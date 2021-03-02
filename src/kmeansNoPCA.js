var nodeplotlib = require('nodeplotlib');
var dataForge = require('data-forge');
var clusterMaker = require('clusters');
require('data-forge-fs');

function plotTest() {
    /* Datasource manipulation */
    let dataFrame = dataForge.readFileSync('./datasource/datasetStandardizzato.csv').parseCSV();
    let features = ["Danceability", "Energy","Beats Per Minute (BPM)"]
    dataFrame = dataFrame.subset(features);
    dataFrame=dataFrame.parseFloats("Danceability");
    dataFrame=dataFrame.parseFloats("Energy");
    dataFrame=dataFrame.parseFloats("Beats Per Minute (BPM)");

    let dataFrame2 = dataForge.readFileSync('./datasource/SpotifyCSVSemplificato.csv').parseCSV();

    //array di oggetti del dataset SpotifyCSV, usato per ottenere i titoli delle canzoni
    let myArrayCompleto=dataFrame2.toArray();

    //array di righe del dataset generato dalla PCA
    let myArray=dataFrame.toRows();

    //array che conterra i vari gruppi del grafico
    let dataToBePlotted= [];
    var generiMusicaliDataset=generiMusicali(myArrayCompleto);

    elbowPoint(myArray,2,20);

    clusterMaker.k(6);
    clusterMaker.iterations(750);
    clusterMaker.data(myArray);

    let cluster = clusterMaker.clusters();

    var i=0;
    //Per ogni claster creato
    while(i<cluster.length){
        let arraySupporto=cluster[i].points; //Punti del cluster
        //Creo un gruppo di puntini che sara mostrato nel grafico
        let trace = {
            x: extractColum(arraySupporto,0),y:extractColum(arraySupporto,1),z:extractColum(arraySupporto,2), //Do tutte le canzoni che compongono il cluster
            mode: 'markers',
            name:"Trace "+i+": "+categorizzazioneCluster(arraySupporto,myArray,myArrayCompleto,generiMusicaliDataset),
            marker: {
                size: 5,
                line: {
                    width: 0.1},
                opacity: 1,
            },
            text: researchTitleCluster(arraySupporto,myArray,myArrayCompleto), //Ottengo un array di titoli per le canzoni che compongono il claster
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

/**
 * Funzione che genera il grafico elbow point
 * @param dataset dataset su cui si esegue il clustering
 * @param min valore minimo di clustes che si vogliono creare
 * @param max valore massimo di clusters che si vogliono creare
 */
function elbowPoint(dataset,min,max){
    let kmin=min; //valore minimo di k
    let kmax=max; //valore massi a cui puo arrivare k
    let sse=[]; //squared sum estimate

    for(k=kmin;k<=kmax;k++) { //Calcolo l'sse per ogni k
        clusterMaker.k(k);
        clusterMaker.iterations(750);
        clusterMaker.data(dataset);
        let cluster = clusterMaker.clusters();
        var distortions = 0;
        for (i = 0; i < k; i++)
            distortions = distortions + sommaDistanze(cluster[i].centroid, cluster[i].points);
        sse.push(distortions);

    }



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
}

/**
 * Funzione che calcola la distanza euclidea di tutti i punti di un cluster dal centroide
 * @param centroide array che contiene le cordinate del centroide del cluster
 * @param punti array che contiene le cordinate dei punti del cluster
 * @returns {number} somma della distanza euclidea di ogni punto
 */
function sommaDistanze(centroide,punti){
    var somma=0;
    for(i=0;i<punti.length;i++){
        somma=somma+Math.sqrt(Math.pow(punti[i][0]-centroide[0],2)+Math.pow(punti[i][1]-centroide[1],2)+Math.pow(punti[i][2]-centroide[2],2));
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
function categorizzazioneCluster(points,datasetPCA,datasetCompleto,generiDataset){
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

exports.plotTest = plotTest;