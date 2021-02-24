var pca = require('pca-js');
var dataForge = require('data-forge');
require('data-forge-fs');

function pcaProcess(){

    let dataFrame = dataForge.readFileSync('../datasource/SpotifyFeatures.csv').parseCSV();
    let newDataFrame = dataFrame.subset(["acousticness", "danceability", "energy", "instrumentalness", "liveness", "speechiness", "valence"]);
    
    let aNewDataFrame = newDataFrame.between(0, 2000);
    
    let data = aNewDataFrame.toRows();

    console.log("Ok done");

    var vectors = pca.getEigenVectors(data);

    console.log(vectors);

    console.log("Percentuali: ");

    console.log("Primo: " + pca.computePercentageExplained(vectors,vectors[0]));
    console.log("Primi due: " + pca.computePercentageExplained(vectors,vectors[0], vectors[1]));
    console.log("Primi tre: " + pca.computePercentageExplained(vectors,vectors[0], vectors[1], vectors[2]));

}

pcaProcess();

exports.pcaProcess = pcaProcess;

