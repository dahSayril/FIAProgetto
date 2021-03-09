const dbscan = require('@cdxoo/dbscan');
var nodeplotlib = require('nodeplotlib');
var dataForge = require('data-forge');
require('data-forge-fs');

const minPoints = 10;

function main(pathPC){

    /* Datasource manipulation */

    // DataFrame con Componenti Principali
    let dataFrame = dataForge.readFileSync(pathPC).parseCSV();
    dataFrame=dataFrame.parseFloats("PC1");
    dataFrame=dataFrame.parseFloats("PC2");
    dataFrame=dataFrame.parseFloats("PC3");
    let myArray=dataFrame.toRows(); // DataFrame come array di array (ogni riga e' una canzone)

    arrayEpsilon = [];
    arrayNumeroElementiPrimoCluster = [];
    arrayNumeroElementiNoise = [];
    arrayNumeroCluster = [];

    deltas = [];

    for (e = 0.43; e <= 0.8; e += 0.03){

        console.log("E: " + e);

        arrayEpsilon.push(e);
        
        const result = makeCluster(myArray, e, minPoints);
        // console.log("Result: " + JSON.stringify(result, null, " "));
        console.log("Numero cluster: " + result.clusters.length);
        console.log("Noise: " + result.noise.length);
        indexOfBiggest = findIndexOfBiggestArray(result.clusters);

        lengthOfBiggest = result.clusters[indexOfBiggest]?result.clusters[indexOfBiggest].length:0;
        lengthOfNoise = result.noise?result.noise.length:0;

        arrayNumeroElementiPrimoCluster.push(lengthOfBiggest);
        arrayNumeroElementiNoise.push(lengthOfNoise);
        arrayNumeroCluster.push(result.clusters?result.clusters.length:0);

        delta = Math.abs(lengthOfBiggest - lengthOfNoise);
        deltas.push([delta, e]);

    }

    optimalE = findOptimalE(deltas);
    console.log("Optimal e: " + optimalE);
    
    graficoRelazione(arrayEpsilon, arrayNumeroElementiPrimoCluster, arrayNumeroElementiNoise);
    graficoEpsilonNumeroCluster(arrayEpsilon, arrayNumeroCluster);
    grafico3D(makeCluster(myArray, optimalE, minPoints).clusters, myArray);
    grafico3D(makeCluster(myArray, 0.55, minPoints).clusters, myArray);

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

function graficoEpsilonNumeroCluster(epsilons, arrayNumeroCluster){

    let trace1 = {
        x: epsilons,
        y: arrayNumeroCluster,
        type: 'scatter',
        name: 'Numero di clusters'
    };

    let data = [trace1];
    let layout = {
        title: 'DBSCAN correlation between parameters',
        xaxis: {
            title: 'Epsilon',
        },
        yaxis: {
            title: 'Numero clusters',
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

function findIndexOfBiggestArray(myArray){
    const lengths = myArray.map(a=>a.length);
    return lengths.indexOf(Math.max(...lengths));
}

function findOptimalE(myDeltas){
    const deltas = myDeltas.map(val => val[0]); // tutti i delta;
    const index = deltas.indexOf(Math.min(...deltas)); // indice delta più piccolo;
    return myDeltas[index][1];
}

exports.dbscan = main;