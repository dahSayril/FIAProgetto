var nodeplotlib = require('nodeplotlib');
var dataForge = require('data-forge');
var clusterMaker = require('clusters');
require('data-forge-fs');

function main() {
    
    /* Datasource manipulation */

    // DataFrame con Componenti Principali
    let dataFrame = dataForge.readFileSync('./datasource/datasetComponentiPrincipali.csv').parseCSV();
    dataFrame=dataFrame.parseFloats("PC1");
    dataFrame=dataFrame.parseFloats("PC2");
    dataFrame=dataFrame.parseFloats("PC3");
    let myArray=dataFrame.toRows(); // DataFrame come array di array (ogni riga e' una canzone)
    

    // DataFrame2 dal DataSet completo ma dopo normalizzazione e standardizzazione
    let dataFrame2 = dataForge.readFileSync('./datasource/datasetStandardizzato.csv').parseCSV();
    let myArrayCompleto=dataFrame2.toArray();
    
    //Grafico Elbow Point
    const elbowPointIndex = elbowPoint(myArray,2,10);
    
    //Calcolo cluster
    const cluster = makeCluster(elbowPointIndex, 200, myArray);

    //Grafici cluster
    grafico3D(cluster,myArray,myArrayCompleto);
    graficoRadar(cluster, myArray, myArrayCompleto);
    
    makeHistograms(cluster, "Acousticness", myArray, myArrayCompleto);

}

/* Esegue algoritmo kmeans e ritorna un array con centroidi e punti */
function makeCluster(numberOfClusters, iterations, myArray){
    clusterMaker.k(numberOfClusters);
    clusterMaker.iterations(iterations);
    clusterMaker.data(myArray);
    return clusterMaker.clusters();
}

/**
 * Funzione che genera il grafico elbow point
 * @param dataset il dataset
 * @param min valore minimo di clustes che si vogliono creare
 * @param max valore massimo di clusters che si vogliono creare
 */
function elbowPoint(dataset,min,max){
    
    let kmin=min; //valore minimo di k
    let kmax=max; //valore massi a cui puo arrivare k
    let sse=[]; //squared sum estimate

    for(k=kmin;k<=kmax;k++) { //Calcolo l'sse per ogni k
        clusterMaker.k(k);
        clusterMaker.iterations(100);
        clusterMaker.data(dataset);
        let cluster = clusterMaker.clusters(); 
        var distortions = 0;
        for (i = 0; i < k; i++)
            distortions = distortions + sommaDistanze(cluster[i].centroid, cluster[i].points);
        sse.push(distortions);
    }

    // Calcolo elbow point
    deltas = [];
    for (i = 1; i < sse.length - 1; i++){
        delta1 = Math.abs(sse[i] - sse[i-1]);
        delta2 = Math.abs(sse[i+1] - sse[i]);
        deltas.push(Math.abs(delta2-delta1));
    }
    const maximumDelta = Math.max(...deltas);
    const elbowPoint = deltas.indexOf(maximumDelta) + 1 + kmin; // Trust me

    //Inserisco in un array i valori di k per cui ho calcolato l'sse
    var cordinateX=[];
    for(k=0;k<kmax;k++)
        cordinateX[k]=kmin+k;

    //Generazione del grafico
    var trace1 = {
        x: cordinateX,
        y: sse,
        type: 'scatter'
    };
    var data = [trace1];
    var layout = {
        title: 'Elbow Point',
        xaxis: {
            title: 'Number of Clusters',
        },
        yaxis: {
            title: 'SSE',
        }
    };

    nodeplotlib.plot(data,layout);
    
    return elbowPoint;
}

function grafico3D(clusters,datasetCluster,datasetCompleto){
    
    var dataToBePlotted=[];
    var i=0;

    //Per ogni cluster creato
    while(i<clusters.length){
        
        let trace = {
            x: extractColum(clusters[i].points,0),
            y:extractColum(clusters[i].points,1),
            z:extractColum(clusters[i].points,2), //Do tutte le canzoni che compongono il cluster
            mode: 'markers',
            name:"Trace " + i + ": " + categorizzazioneCluster(clusters[i].points,datasetCluster,datasetCompleto),
            marker: {
                size: 5,
                line: {
                    width: 0.1
                },
                opacity: 1,
            },
            text: researchTitleCluster(clusters[i].points,datasetCluster,datasetCompleto), //Ottengo un array di titoli per le canzoni che compongono il claster
            type: 'scatter3d'
        };

        dataToBePlotted.push(trace);
        i=i+1;

    }

    var layout = {margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
        }};
    
    nodeplotlib.plot(dataToBePlotted,layout);

}

function graficoRadar(clusters, datasetCluster,datasetCompleto){

    var j=0;
    var data=[];

    //Per ogni cluster creato
    while(j<clusters.length) {
        var songs=fromPointsToSong(clusters[j].points,datasetCluster,datasetCompleto);
        var trace = {
            type: 'scatterpolar',
            r: [ valoreMedio(songs,"Energy"), valoreMedio(songs,"Danceability"),
                valoreMedio(songs,"Loudness (dB)"), valoreMedio(songs,"Liveness"),
                valoreMedio(songs,"Valence"), valoreMedio(songs,"Length (Duration)"),
                valoreMedio(songs,"Acousticness"), valoreMedio(songs,"Speechiness")],
            theta: ["Energy","Danceability","Loudness (dB)","Liveness","Valence","Length (Duration)","Acousticness","Speechiness"],
            fill: 'toself',
            name: 'Cluster '+ j,
        };
        data.push(trace);
        j = j + 1;
    }

    layout = {
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 1]
            }
        }
    }

    nodeplotlib.plot(data,layout);
}

function histogram(puntiCluster,feature,datasetCluster,datasetCompleto,n_cluster){

    let songs = fromPointsToSong(puntiCluster,datasetCluster,datasetCompleto); //contiene le canzoni del cluster
    
    var valoriFeature=[]; // solo canzoni cluster
    for(i=0;i<songs.length;i++){
        valoriFeature.push(parseFloat(songs[i][feature]))
    }

    var trace1 = {
        x:  [...Array(songs.length).keys()],
        y: valoriFeature,
        name: 'Canzone',
        marker: {
            color: "rgba(255, 100, 102, 1)",
            line: {
                color:  "rgba(255, 100, 102, 1)",
                width: 1
            }
        },
        opacity: 0.5,
        type: "bar",

    };

    var trace2 = {
        y: new Array(songs.length).fill(valoreMedio(valoriFeature)),
        x:  [...Array(songs.length).keys()],
        marker: {
            color: "rgba(0, 0, 0, 1)",
            line: {
                color:  "rgba(0, 0, 0, 1)",
                width: 1
            }
        },
        name: 'Media del cluster',
        type: 'scatter'
    };

    var trace3 = {
        y: new Array(songs.length).fill(valoreMedio(datasetCompleto, feature)),
        x:  [...Array(songs.length).keys()],
        marker: {
            color: "rgb(106,90,205,1)",
            line: {
                color:  "rgb(106,90,205,1)",
                width: 1
            }
        },
        name: 'Media del dataset',
        type: 'scatter'
    };

    var data = [trace1, trace2, trace3];
    var layout = {
        bargap: 0.05,
        bargroupgap: 0.2,
        barmode: "overlay",
        title: "Cluster "+ n_cluster,
        xaxis: {title: "Canzone"},
        yaxis: {title: feature}
    };
    
    nodeplotlib.plot(data,layout);

}

/**
 * 
 * @param {*} clusters i clusters trovati da kmeans
 * @param {*} feature la feature da graficare
 * @param {*} datasetCluster 
 * @param {*} datasetCompleto 
 */
function makeHistograms(clusters, feature, datasetCluster, datasetCompleto){
    clusters.forEach((value, index, array)=>{
        histogram(value.points, feature, datasetCluster, datasetCompleto, index + 1);
    });
}

/**
 * Funzione che calcola la distanza euclidea di tutti i punti di un cluster dal centroide
 * @param centroide array che contiene le cordinate del centroide del cluster
 * @param punti array che contiene le cordinate dei punti del cluster
 * @returns {number} somma della distanza euclidea di ogni punto
 */
function sommaDistanze(centroide, punti){
    let somma = 0;
    const dimension = centroide.length;
    for(i=0;i<punti.length;i++){
        sommaDimensioni = 0;
        for(j=0;j<dimension;j++){
            sommaDimensioni += Math.pow(punti[i][j]-centroide[j],2);
        }
        somma += Math.sqrt(sommaDimensioni);
    }
    return somma;
}

/**
 * Funzione che ritorna tutte le coordinate (ese:X) dei punti nel cluster
 * @param points array che contiene i punti
 * @param coordinata coordinata che si vuole selezionare
 * @returns {[]} array contenete le coordinate
 */
function extractColum(points,coordinata){
    var elementiColonna=[];
    for(i=0;i<points.length;i++)
        elementiColonna.push(points[i][coordinata]);
    return elementiColonna;
}


/**
 * Funzione utilizzata per ricercare i titoli delle canzoni di un cluster.
 * @param clusters punti del cluster
 * @param datasetPCA dataset a cui e stata applicata la pca
 * @param datasetCompleto dataset completo
 * @returns {[]} nomi canzoni
 */
function researchTitleCluster(points,datasetPCA,datasetCompleto){
    var j=0;
    var nameSongs=[];
        do{
            var cordX =points[j][0];
            var cordY =points[j][1];
            var cordZ =points[j][2];
            var title='';
            for (i = 0; i < datasetPCA.length; i++) {
                if (cordX == datasetPCA[i][0]  && cordY == datasetPCA[i][1] && cordZ == datasetPCA[i][2]) {
                    title=title+' '+datasetCompleto[i].Title;
                }
            }
            nameSongs.push(title);
            j++;
        }while(j<points.length)
    return nameSongs;
}

/**
* Funzione utilizzata per ricercare i generi delle canzoni di un cluster.
* @param clusters punti del cluster
* @param datasetPCA dataset a cui e stata applicata la pca
* @param datasetCompleto dataset completo
* @returns {[]} generi canzoni
*/
function researchGenreCluster(points,datasetPCA,datasetCompleto){
    var j=0;
    var genereSongs=[];
    do{
        var cordX =points[j][0];
        var cordY =points[j][1];
        var cordZ =points[j][2];
        var genere='';
        for (i = 0; i < datasetPCA.length; i++) {
            if (cordX == datasetPCA[i][0]  && cordY == datasetPCA[i][1] && cordZ == datasetPCA[i][2]) {
                genere=genere+' '+datasetCompleto[i]['Top Genre'];
            }
        }
        genereSongs.push(genere);
        j++;
    }while(j<points.length)
    return genereSongs;
}

/**
 * Funzione utilizzata per ricercare i titoli delle canzoni di un cluster.
 * @param points punti del cluster
 * @param datasetCompleto dataset completo utilizzato per creare i cluster
 * @param valore1 valore1 utilizzato per creare i cluster (ese loudness)
 * @param valore2 valore1 utilizzato per creare i cluster (ese energy)
 * @param valore3 valore1 utilizzato per creare i cluster (ese BPM)
 * @returns {[]}
 */
function researchTitleClusterNoPCA(points,datasetCompleto,valore1,valore2,valore3){
    var j=0;
    var nameSongs=[];
    do{
        // console.log(clusters.points[j]);
        var cordX =points[j][0];
        var cordY =points[j][1];
        var cordZ =points[j][2];
        var title='';

        for (i = 0; i < datasetCompleto.length; i++) {
            if (cordX == datasetCompleto[i][valore1]  && cordY == datasetCompleto[i][valore2] && cordZ == datasetCompleto[i][valore3]) {
                title=title+' '+datasetCompleto[i].Title;
            }
        }
        nameSongs.push(title);
        j++;
    }while(j<points.length)
    return nameSongs;
}

/**
 * Funzione utilizzata per ricercare i generi delle canzoni di un cluster.
 * @param points punti del cluster
 * @param datasetCompleto dataset completo utilizzato per creare i cluster
 * @param valore1 valore1 utilizzato per creare i cluster (ese loudness)
 * @param valore2 valore1 utilizzato per creare i cluster (ese energy)
 * @param valore3 valore1 utilizzato per creare i cluster (ese BPM)
 * @returns {[]}
 */
function researchTitleClusterNoPCA(points,datasetCompleto,valore1,valore2,valore3){
    var j=0;
    var genereSongs=[];
    do{
        // console.log(clusters.points[j]);
        var cordX =points[j][0];
        var cordY =points[j][1];
        var cordZ =points[j][2];
        var genere='';

        for (i = 0; i < datasetCompleto.length; i++) {
            if (cordX == datasetCompleto[i][valore1]  && cordY == datasetCompleto[i][valore2] && cordZ == datasetCompleto[i][valore3]) {
                genere=genere+' '+datasetCompleto[i]['Top Genre'];
            }
        }
        genereSongs.push(genere);
        j++;
    }while(j<points.length)
    return genereSongs;
}

function fromPointsToSong(points,datasetCluster,datasetCompleto){
    var songs=[];
    for(i=0;i<points.length;i++){
        for(j=0;j<datasetCluster.length;j++){
            if(datasetCluster[j][0]==points[i][0] && datasetCluster[j][1]==points[i][1] && datasetCluster[j][2]==points[i][2] )
                songs.push(datasetCompleto[j]);
        }
    }
    return songs
}

function generiMusicali(datasetCompleto){
    var generi=[];
    var booleano=true;
    generi.push(datasetCompleto[0]['Top Genre']);
    for(i=0;i<datasetCompleto.length;i++){
        for(j=0;j<generi.length;j++){
            if(generi[j]==datasetCompleto[i]['Top Genre'])
                booleano=false;
        }
        if(booleano)
            generi.push(datasetCompleto[i]['Top Genre'])
        booleano=true;
    }
    return generi;
}

function categorizzazioneCluster(points,datasetPCA,datasetCompleto){
    var generiPrincipali=["alternative","jazz","pop","indie","rock","country","dance","hip hop","metal","blues","folk","soul","carnaval","punk","disco","electro","rap","latin","reggae","altri"];
    //1. Prendo tutti i generi del cluster
    var generi=[];
    generi=researchGenreCluster(points,datasetPCA,datasetCompleto);

    //2. Canzoni per categoria
    var conteggioGeneri=[];

    // Azzero l'array
    for(j=0;j<20;j++)
        conteggioGeneri[j]=0;

    for(z=0;z<generi.length;z++){
        if(generi[z].includes(generiPrincipali[0]))
            conteggioGeneri[0]++;
        else
        if(generi[z].includes(generiPrincipali[1]))
            conteggioGeneri[1]++;
        else
        if(generi[z].includes(generiPrincipali[2]))
            conteggioGeneri[2]++;
        else
        if(generi[z].includes(generiPrincipali[3]))
            conteggioGeneri[3]++;
        else
        if(generi[z].includes(generiPrincipali[4]))
            conteggioGeneri[4]++;
        else
        if(generi[z].includes(generiPrincipali[5]))
            conteggioGeneri[5]++;
        else
        if(generi[z].includes(generiPrincipali[6]))
            conteggioGeneri[6]++;
        else
        if(generi[z].includes(generiPrincipali[7]))
            conteggioGeneri[7]++;
        else
        if(generi[z].includes(generiPrincipali[8]))
            conteggioGeneri[8]++;
        else
        if(generi[z].includes(generiPrincipali[9]))
            conteggioGeneri[9]++;
        else
        if(generi[z].includes(generiPrincipali[10]))
            conteggioGeneri[10]++;
        else
        if(generi[z].includes(generiPrincipali[11]))
            conteggioGeneri[11]++;
        else
        if(generi[z].includes(generiPrincipali[12]))
            conteggioGeneri[12]++;
        else
        if(generi[z].includes(generiPrincipali[13]))
            conteggioGeneri[13]++;
        else
        if(generi[z].includes(generiPrincipali[14]))
            conteggioGeneri[14]++;
        else
        if(generi[z].includes(generiPrincipali[15]))
            conteggioGeneri[15]++;
        else
        if(generi[z].includes(generiPrincipali[16]))
            conteggioGeneri[16]++;
        else
        if(generi[z].includes(generiPrincipali[17]))
            conteggioGeneri[17]++;
        else
        if(generi[z].includes(generiPrincipali[18]))
            conteggioGeneri[18]++;
        else
            conteggioGeneri[19]++;
    }

    //3. Stringa percentuale
    var percentuale="";
    for(i=0;i<generiPrincipali.length;i++)
        if(conteggioGeneri[i]!=0)
            percentuale+=generiPrincipali[i]+": "+((conteggioGeneri[i]/points.length) * 100).toFixed(0)+"%\n";

    return percentuale;
}

/* Media di valori di tutto l'array */
function valoreMedio(array, feature = undefined){
    let n = array.length;
    let sum = 0;
    array.forEach((value, index, array)=>{
        const val = feature==undefined?value:value[feature];
        if(val!=""||val){
            sum += parseFloat(val);
        } else {
            n--;
        }
    });
    return sum/n;
}

exports.mainKMeans = main;