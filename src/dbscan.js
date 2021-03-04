const dbscan = require('@cdxoo/dbscan');
var nodeplotlib = require('nodeplotlib');
var dataForge = require('data-forge');
require('data-forge-fs');

const minPoints = 10;

function main(){

    /* Datasource manipulation */

    // DataFrame con Componenti Principali
    let dataFrame = dataForge.readFileSync('./datasource/datasetComponentiPrincipali.csv').parseCSV();
    dataFrame=dataFrame.parseFloats("PC1");
    dataFrame=dataFrame.parseFloats("PC2");
    dataFrame=dataFrame.parseFloats("PC3");
    let myArray=dataFrame.toRows(); // DataFrame come array di array (ogni riga e' una canzone)

    arrayEpsilon = [];
    arrayNumeroElementiPrimoCluster = [];
    arrayNumeroElementiNoise = [];

    for (e = 0.05; e < 0.1; e += 0.005){
        
        arrayEpsilon.push(e);
        
        const result = makeCluster(myArray, e, minPoints);
        arrayNumeroElementiPrimoCluster.push(result.clusters[0].length);
        arrayNumeroElementiNoise.push(result.noise.length);

    }

    graficoRelazione(arrayEpsilon, arrayNumeroElementiPrimoCluster, arrayNumeroElementiNoise);
    grafico3D(makeCluster(myArray, 0.075, minPoints).clusters, myArray);

}

function grafico3D(clusters, dataset){

    let dataToBePlotted = [];

    clusters.forEach((cluster, index, array)=>{
        
        let arrayX = [];
        let arrayY = [];
        let arrayZ = [];

        cluster.forEach((value)=>{
            arrayX.push(dataset[value][0]);
            arrayY.push(dataset[value][1]);
            arrayZ.push(dataset[value][2]);
        });

        let trace = {
            x: arrayX,
            y: arrayY,
            z: arrayZ, //Do tutte le canzoni che compongono il cluster
            mode: 'markers',
            name: 'Cluster ' + (index+1),
            marker: {
                size: 5,
                line: {
                    width: 0.1
                },
                opacity: 1,
            },
            type: 'scatter3d'
        };
        dataToBePlotted.push(trace);
    });

    var layout = {
        title: 'DBSCAN-generated clusters',
        xaxis: {title: 'PC'},
        yaxis: {title: 'PC2'},
        zaxis: {title: 'PC3'}
    };

    nodeplotlib.plot(dataToBePlotted,layout);

}

function graficoRelazione(epsilons, primocluster, noise){

    let trace1 = {
        x: epsilons,
        y: primocluster,
        type: 'scatter',
        name: 'Numero di elementi nel cluster più grande'
    };
    
    let trace2 = {
        x: epsilons,
        y: noise,
        type: 'scatter',
        name: 'Numero di elementi noise'
    };

    let data = [trace1, trace2];
    let layout = {
        title: 'DBSCAN correlation between parameters',
        xaxis: {
            title: 'Epsilon',
        },
        yaxis: {
            title: 'Numero elementi',
        }
    };

    nodeplotlib.plot(data,layout);

}

function makeCluster(dataset, epsilon, minimumPoints){
    return dbscan({
        dataset: dataset,
        epsilon: epsilon,
        distanceFunction: calcolaDistanze,
        minimumPoints: minimumPoints
    });
}

function calcolaDistanze(puntoA, puntoB){
    let somma = 0;
    const dimension = puntoA.length;
    for (i = 0; i < dimension; i++){
        somma += Math.pow(puntoA[i]-puntoB[i],2);
    }
    return Math.sqrt(somma);
}

exports.dbscan = main;