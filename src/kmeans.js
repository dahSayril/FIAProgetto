var nodeplotlib = require('nodeplotlib');
var dataForge = require('data-forge');
var clusterMaker = require('clusters');
require('data-forge-fs');

function main(pathPCA, pathStandardizzato) {

    // DataFrame con Componenti Principali
    let dataFrame = dataForge.readFileSync(pathPCA).parseCSV();

    //1. Ottengo gli identificativi delle colonne generate dalla pca
    let columnNames=dataFrame.getColumnNames();
    for(i=0;i<columnNames.length;i++)
        dataFrame=dataFrame.parseFloats(columnNames[i]);
    let datasetPCA=dataFrame.toRows(); // DataFrame come array di array (ogni riga e' una canzone)
    
    // DataFrame dal DataSet completo ma dopo normalizzazione e standardizzazione
    dataFrame = dataForge.readFileSync(pathStandardizzato).parseCSV();
    let datasetCompleto=dataFrame.toArray();

    //2. Rilevo il k-ottimale da usare per il clustering
    //Grafico Elbow Point
    const elbowPointIndex = elbowPoint(datasetPCA,2,10);
    console.log(elbowPointIndex);

    //3. Calcolo cluster
    const clusters = makeCluster(elbowPointIndex, 1000, datasetPCA);


    //4. Creo le playlists da creare tramite le API di Spotify
    let playlists=[];
    var i=0;
    while (i<clusters.length){
        var playlist= fromPointsToSong(clusters[i].points,datasetPCA,datasetCompleto);
        playlists.push(playlist);
        i++;
    }

    return [clusters, playlists, datasetPCA, datasetCompleto];
}

//Funzione che genera un barchart in base a una determinata features
function barChart(puntiCluster,feature,datasetCluster,datasetCompleto,n_cluster){

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
//Funzione che ritorna le percentuali di genere all'interno di un cluster
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
//Funzione che controlla se due punti hanno le stesse cordinate
function control_point(point,pointControl){
    var riscontro=false;
    for(cordinata=0;cordinata<point.length;cordinata++){
        if(point[cordinata]==pointControl[cordinata])
            riscontro=true;
        else
            return false;
    }
    return riscontro;
}
//Funzione per il calcolo del elbowPoint
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
//Funzione usata per estrarre da un array di punti solo una determinata coordinata
function extractColum(points,coordinata){
    var elementiColonna=[];
    for(i=0;i<points.length;i++)
        elementiColonna.push(points[i][coordinata]);
    return elementiColonna;
}
//Funzione usata per ottenere le canzoni da un insieme di punti
function fromPointsToSong(points,datasetCluster,datasetCompleto){
    var songs=[];
    //1. Per ogni punto nell array controllo se nel dataset utilizzato per creare i cluster,
    //e presente un punto con le stesse cordinate
    //2. Nel caso in cui esiste sfruttando la posizione nel dataset ottengo la canzone coincidente con quel punto
    for(i=0;i<points.length;i++){
        for(j=0;j<datasetCluster.length;j++){
            if(control_point(points[i],datasetCluster[j]))
                songs.push(datasetCompleto[j]);
        }
    }
    return songs
}
//Funzione usata per generare un grafico radar dei cluster creati
function graficoRadar(clusters, datasetCluster,datasetCompleto,rangeMin=-2,rangeMax=6){

    var j=0;
    var data=[];
    
    while(j<clusters.length) {
        var songs=fromPointsToSong(clusters[j].points,datasetCluster,datasetCompleto);
        var trace = {
            type: 'scatterpolar',
            r: [ valoreMedio(songs,"Beats Per Minute (BPM)"),valoreMedio(songs,"Energy"), valoreMedio(songs,"Danceability"),
                valoreMedio(songs,"Loudness (dB)"), valoreMedio(songs,"Liveness"),
                valoreMedio(songs,"Valence"), valoreMedio(songs,"Length (Duration)"),
                valoreMedio(songs,"Acousticness"), valoreMedio(songs,"Speechiness")],
            theta: ["Beats Per Minute (BPM)","Energy","Danceability","Loudness (dB)","Liveness","Valence","Length (Duration)","Acousticness","Speechiness"],
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
                range: [rangeMin, rangeMax]
            }
        }
    }

    nodeplotlib.plot(data,layout);
}
//Funzione usata per generare un grafico 3D che mostra i punti nello spazio
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
            text: researchTitleCluster(clusters[i].points,datasetCluster,datasetCompleto), //Ottengo un array di titoli per le canzoni che compongono il cluster
            type: 'scatter3d'
        };

        dataToBePlotted.push(trace);
        i=i+1;

    }

    var layout = {
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
        },
        legend: {
            "orientation": "h"
        }
    };

    nodeplotlib.plot(dataToBePlotted,layout);

}
//Funzione che genera un barchart per ogni cluster
function makeBarChart(clusters, feature, datasetCluster, datasetCompleto){
    clusters.forEach((value, index, array)=>{
        barChart(value.points, feature, datasetCluster, datasetCompleto, index );
    });
}
//Funziona che genera dei cluster su un dataset
function makeCluster(numberOfClusters, iterations, dataset){
    clusterMaker.k(numberOfClusters);
    clusterMaker.iterations(iterations);
    clusterMaker.data(dataset);
    return clusterMaker.clusters();
}
//Funzione che restituisce il genere di tutti i punti di un cluster
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
//Funzione che restituisce il titolo delle canzoni di tutti i punti di un cluster
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
//Funzione che calcola la distanza euclidea
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
//Funzione che calcola il valore medio di una feature in un array
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


function graficoElbowPointByVarianza(gomito,varianza){
    //Generazione del grafico
    var trace1 = {
        x: varianza,
        y: gomito,
        type: 'scatter'
    };
    var data = [trace1];
    var layout = {
        title: 'Gomito data la varianza della PCA',
        xaxis: {
            title: 'Varianza',
        },
        yaxis: {
            title: 'Gomito',
        }
    };

    nodeplotlib.plot(data,layout);
}

function graficoNumeroPuntiClusterByVarianza(numeroPunti,numeroCluster,percentualVarianza){

    var data = [];
    var i=0;
    while (i<percentualVarianza.length){
        var trace = {
            x: numeroCluster[i],
            y: numeroPunti[i],
            name: 'Percentual Varianza:'+ percentualVarianza[i],
            type: 'scatter'
        };
        data.push(trace)
        i++;
    }

    var layout = {
        title: 'Variazione numero punti di un cluster in base alla varianza della PCA',
        xaxis: {
            title: 'Cluster',
        },
        yaxis: {
            title: 'Numero Punti',
        }
    };

    nodeplotlib.plot(data,layout);
}



exports.graficoNumeroPuntiClusterByVarianza=graficoNumeroPuntiClusterByVarianza;
exports.graficoElbowPointByVarianza=graficoElbowPointByVarianza;
exports.mainKMeans = main;
exports.grafico3D = grafico3D;
exports.graficoRadar = graficoRadar;
exports.makeHistograms = makeBarChart;
