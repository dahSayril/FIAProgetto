var nodeplotlib = require('nodeplotlib');
var dataForge = require('data-forge');
var clusterMaker = require('clusters');
require('data-forge-fs');



function plotTest() {


    /* Datasource manipulation */

    let dataFrame = dataForge.readFileSync('./datasource/datasetComponentiPrincipali.csv').parseCSV();
    let dataFrame2 = dataForge.readFileSync('./datasource/SpotifyCSV.csv').parseCSV();
    dataFrame = dataFrame.parseInts("PC1");
    dataFrame = dataFrame.parseInts("PC2");
    dataFrame = dataFrame.parseInts("PC3");

    //array di oggetti del dataset SpotifyCSV, usato per ottenere i titoli delle canzoni
    let titoli=dataFrame2.toArray();
    console.log(titoli);
    //array di righe del dataset generato dalla PCA
    let myArray=dataFrame.toRows();

    //array che conterra i vari gruppi del grafico
    var dataToBePlotted= [];
    //array che conterra i vari colori gia usati
    var coloriUsati=[];


    //Eseguo il cluster k-means
    clusterMaker.k(100);
    clusterMaker.iterations(750);
    clusterMaker.data(myArray);
    var cluster=clusterMaker.clusters();


    var i=0;
    //Per ogni claster creato
    while(i<cluster.length){
        //Genero un colore, che non sia gia stato usato in precedenza
        //do {
            var color = random_color();
        //}while (isUsed(coloriUsati,color));
       // coloriUsati.push(color); //Aggiungo il colore a quello gia usato
        var arraySupporto=cluster[i].points; //Elementi del cluster
        //Creo un gruppo di puntini che sara mostrato nel grafico
        var trace = {
            x: extractColum(arraySupporto,0),y:extractColum(arraySupporto,1),z:extractColum(arraySupporto,2), //Do tutte le canzoni che compongono il cluster
            mode: 'markers',
            marker: {
                size: 5,
                color: color,
                line: {
                    color: color,
                    width: 0.1},
                opacity: 1,
            },
            text: researchTitleClusters(cluster[i],myArray,titoli), //Ottengo un array di titoli per le canzoni che compongono il claster
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
    console.log("Trace 1");
    stampaGeneri(cluster[1],myArray,titoli);
    console.log("Trace 69");
    stampaGeneri(cluster[69],myArray,titoli);
}

//Funzione che estrae da un claster tutte tutte le colonne (ese: x)
function extractColum(array,colonna){
    var elementiColonna=[];
    for(i=0;i<array.length;i++)
        elementiColonna.push(array[i][colonna]);
    return elementiColonna;
}
//Funzione che genera un colore random
function random_color() {
    var coloreRandom;
    min = Math.ceil(1);
    max = Math.floor(15);
    var i= Math.floor(Math.random() * (max - min)) + min; //Il max è escluso e il min è incluso
    switch (i) {
            case 1: {
                coloreRandom = "#000000";
                break;
            }
            case 2: {
                coloreRandom = "#0000ff";
                break;
            }
            case 3: {
                coloreRandom = "#a52a2a";
                break;
            }
            case 4: {
                coloreRandom = "#00ffff";
                break;
            }
            case 5: {
                coloreRandom = "#00008b";
                break;
            }
            case 6: {
                coloreRandom = "#a9a9a9";
                break;
            }
            case 7: {
                coloreRandom = "#006400";
                break;
            }
            case 8: {
                coloreRandom = "#ff8c00";
                break;
            }
            case 9: {
                coloreRandom = "#8b0000";
                break;
            }
            case 10: {
                coloreRandom = "#00ff00";
                break;
            }
            case 11: {
                coloreRandom = "#ff00ff";
                break;
            }
            case 12: {
                coloreRandom = "#808000";
                break;
            }
            case 13: {
                coloreRandom = "#ff0000";
                break;
            }
            case 14: {
                coloreRandom = "#ffff00";
                break;
            }
            default:
                coloreRandom = null;
        }
    return coloreRandom;
}
//Funzione che controlla se un colore e gia stato usato
function isUsed(coloriUsati,colore){
    for(i=0;i<coloriUsati.length;i++){
        if(coloriUsati[i]==colore)
            return true
    }
    return false;
}
//Funzione che ritorna un arrey contenenti tutti i titoli delle canzoni che appartengono ad un cluster
function researchTitleClusters(clusters,myArray,titoli){
    var i=0,j=0;
    var nameSong=[];
        do{
           // console.log(clusters.points[j]);
            cordX = clusters.points[j][0];
            cordY = clusters.points[j][1];
            cordZ = clusters.points[j][2];
            nameSong.push(researchTitleSong(cordX,cordY,cordZ,myArray,titoli));
            j++;
        }while(j<clusters.points.length)
    return nameSong;
}
//Funzione che ritorna il titolo di una canzone
function researchTitleSong(x,y,z,myArray,titoli){
    var title='';
    for (i = 0; i < myArray.length; i++) {
        if (x ==myArray[i][0]  && y ==myArray[i][1] && z ==myArray[i][2]) {
            title=title+' '+titoli[i].Title;
        }
    }
    return title;
}
//Funzione di supporto che ritorna il posizione di una canzone nel file datasetComponentiPrincipali
function researchPosition(x,y,z,myArray){
    var i=-1;
    for (j= 0; j < myArray.length; j++) {

        if (x == myArray[j][0]  && y ==myArray[j][1] && z ==myArray[j][2]) {
            return j+2;
        }
    }
    return i;
}
function stampaGeneri(clusters,myArray,titoli){
    var i=0,j=0;
    do{
        // console.log(clusters.points[j]);
        cordX = clusters.points[j][0];
        cordY = clusters.points[j][1];
        cordZ = clusters.points[j][2];
        researchGenereSong(cordX,cordY,cordZ,myArray,titoli);
        j++;
    }while(j<clusters.points.length)
}
function researchGenereSong(x,y,z,myArray,titoli){
    var genere='';
    for (i = 0; i < myArray.length; i++) {
        if (x ==myArray[i][0]  && y ==myArray[i][1] && z ==myArray[i][2]) {
            genere=genere+' '+titoli[i]['Top Genre'];
        }
    }
    console.log(genere);
}

exports.plotTest = plotTest;