var pca = require('pca-js');
var dataForge = require('data-forge');
require('data-forge-fs');

function pcaProcess(){

    // Carico il DataSet
    let dataFrame = dataForge.readFileSync('../datasource/SpotifyCSV.csv').parseCSV();

    // Seleziono solo le features che mi interessano
    let newDataFrame = dataFrame.subset(["Acousticness", "Danceability", "Energy","Valence","Beats Per Minute (BPM)"]);
    
    // DataSet come array di array
    let data = newDataFrame.toRows();

    // Numero di elementi (canzoni) nel DataSet
    let dimension = data.length;

    // Calcolo autovettori e autovalori per PCA
    var vectors = pca.getEigenVectors(data);

    // Percentuale di accuratezza considerando il primo, i primi due e i primi tre autovettori
    console.log("Percentuali: ");
    console.log("Primo: " + pca.computePercentageExplained(vectors,vectors[0]));
    console.log("Primi due: " + pca.computePercentageExplained(vectors,vectors[0], vectors[1]));
    console.log("Primi tre: " + pca.computePercentageExplained(vectors,vectors[0], vectors[1], vectors[2]));
    // DataSet trasformato sulle prime tre componenti principali individuate
    let adData = pca.computeAdjustedData(data,vectors[0], vectors[1], vectors[2]).adjustedData; // N.B. Array di array

    // Conterra' ogni canzone con un punteggio shiftato di +50
    // In questo modo il nuovo DataSet conterra' valori compresi tra 0 e 100 come l'originale
    let adjustedData = [];

    // Shifto punteggio di ogni elemento a +50
    adData.forEach(element => {
        let newElement = element.map(score=>Math.round(score+50));
        adjustedData.push(newElement);
    });

    // Nuovo DataSource che conterra' il DataSet trasformato sulle PC individuate
    let myNewDataSource = [];

    // Riempo il nuovo DataSource
    for (i = 0; i < dimension; i++){

        let mySong = {};
        mySong.PC1 = adjustedData[0][i];
        mySong.PC2 = adjustedData[1][i];
        mySong.PC3 = adjustedData[2][i];

        myNewDataSource.push(mySong);

    }

    // Creo nuovo DataFrame dal DataSource e poi lo esporto
    let newDataFrame2 = new dataForge.DataFrame({
		values: myNewDataSource
	});
    newDataFrame2.asCSV().writeFileSync('../datasource/datasetComponentiPrincipali.csv');
}

pcaProcess();

exports.pcaProcess = pcaProcess;

