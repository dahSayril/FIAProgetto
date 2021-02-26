var nodeplotlib = require('nodeplotlib');
var dataForge = require('data-forge');
var clusterMaker = require('clusters');
require('data-forge-fs');

var nameSong=[];

function plotTest() {


    /* Datasource manipulation */

    let dataFrame = dataForge.readFileSync('./datasource/datasetComponentiPrincipali.csv').parseCSV();
    let dataFrame2 = dataForge.readFileSync('./datasource/SpotifyCSV.csv').parseCSV();
    dataFrame = dataFrame.parseInts("PC1");
    dataFrame = dataFrame.parseInts("PC2");
    dataFrame = dataFrame.parseInts("PC3");
    let titoli=dataFrame2.toArray();
    let myArray=dataFrame.toRows();
    var dataToBePlotted= [];
    var coloriUsati=[];
    console.log(myArray);



    clusterMaker.k(10);
    clusterMaker.iterations(750);
    clusterMaker.data(myArray);
    var cluster=clusterMaker.clusters();
    researchDuplicate(43,68,35,myArray);
    var i=0;
    while(i<cluster.length){
        do {
            var color = random_rgba();
        }while (isUsed(coloriUsati,color));
        coloriUsati.push(color);
        var arraySupporto=cluster[i].points;
        var trace = {
            x: extractColum(arraySupporto,0),y:extractColum(arraySupporto,1),z:extractColum(arraySupporto,2),
            mode: 'markers',
            marker: {
                size: 8,
                color: color,
                line: {
                    color: color,
                    width: 0.1},
                opacity: 0.8,
            },
            text: researchTitle(cluster[i],myArray,titoli),
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

    console.log(researchTitle(66,79,47,myArray,titoli))
}


function extractColum(array,colonna){
    var elementiColonna=[];
    for(i=0;i<array.length;i++)
        elementiColonna.push(array[i][colonna]);
    return elementiColonna;
}
function random_rgba() {
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
function isUsed(coloriUsati,colore){
    for(i=0;i<coloriUsati.length;i++){
        if(coloriUsati[i]==colore)
            return true
    }
    return false;
}

function researchTitle(clusters,myArray,titoli){
    var i=0,j=0;
        do{
           // console.log(clusters.points[j]);
            cordX = clusters.points[j][0];
            cordY = clusters.points[j][1];
            cordZ = clusters.points[j][2];
            console.log(cordX+','+cordY+','+cordZ);
            for (z = 0; z < myArray.length; z++) {
                if (cordX ==myArray[z][0]  && cordY ==myArray[z][1] && cordZ ==myArray[z][2]) {
                    nameSong.push(titoli[z].Title);
                    console.log(titoli[z].Title);
                }
            }
            j++;

        }while(j<clusters.points.length)
    return nameSong;
}

function researchDuplicate(x,y,z,myArray,){
    var i=0;
    for (j= 0; j < myArray.length; j++) {

        if (x == myArray[j][0]  && y ==myArray[j][1] && z ==myArray[j][2]) {
                i++;
            console.log(j);
        }
    }
    console.log(i);
}

exports.plotTest = plotTest;