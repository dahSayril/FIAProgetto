var pca = require('pca-js');
var dataForge = require('data-forge');
require('data-forge-fs');

function pcaProcess(){

    // Carico il DataSet
    let dataFrame = dataForge.readFileSync('../datasource/SpotifyCSV.csv').parseCSV();

    // Seleziono solo le features che mi interessano
    let features = ["Acousticness", "Danceability", "Energy", "Valence","Beats Per Minute (BPM)"]
    let subDataFrame = dataFrame.subset(features);

    var columns = subDataFrame.getColumns();
    var arrayOfColumns = columns.toArray();
    
    let myColumns = []; // Array di array (ogni array e' una colonna)

    for (var column in arrayOfColumns) {
        let myColumn = [];
        myColumn.push(...arrayOfColumns[column].series.content.values);
        standardize(myColumn);
        myColumns.push(myColumn);
    }


    // DataSet come array di array
    let data = subDataFrame.toRows();

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
    let adData = pca.computeAdjustedData(data, vectors[0], vectors[1], vectors[2]).adjustedData; // N.B. Array di array

    let adjustedData = adData;

    const minPC1 = Math.min(...adData[0]);
    const minPC2 = Math.min(...adData[1]);
    const minPC3 = Math.min(...adData[2]);

    adjustedData[0].forEach((value, index, array) => array[index] = value + Math.abs(minPC1));
    adjustedData[1].forEach((value, index, array) => array[index] = value + Math.abs(minPC2));
    adjustedData[2].forEach((value, index, array) => array[index] = value + Math.abs(minPC3));

    const maxPC1 = Math.max(...adData[0]);
    const maxPC2 = Math.max(...adData[1]);
    const maxPC3 = Math.max(...adData[2]);

    // Nuovo DataSource che conterra' il DataSet trasformato sulle PC individuate
    let myNewDataSource = [];

    // Riempo il nuovo DataSource
    for (i = 0; i < dimension; i++){

        let mySong = {};
        mySong.PC1 = 100 * (adjustedData[0][i] / maxPC1);
        mySong.PC2 = 100 * (adjustedData[1][i] / maxPC2);
        mySong.PC3 = 100 * (adjustedData[2][i] / maxPC3);

        myNewDataSource.push(mySong);

    }

    // Creo nuovo DataFrame dal DataSource e poi lo esporto
    let newDataFrame2 = new dataForge.DataFrame({
		values: myNewDataSource
	});
    newDataFrame2.asCSV().writeFileSync('../datasource/datasetComponentiPrincipali.csv');
}

function getStandardDeviation(numbersArr, meanVal) {
    
    var SDprep = 0;
    for(var key in numbersArr) {
        if(numbersArr[key]!=""||numbersArr[key]){
            SDprep += Math.pow((parseFloat(numbersArr[key]) - meanVal),2);
        }
    }
    var SDresult = Math.sqrt(SDprep/numbersArr.length);
    return SDresult;

}

function getMean(array){
    let n = array.length;
    let sum = 0;
    array.forEach((value, index, array)=>{
        if(value!=""||value){
            sum += parseInt(value);
        } else {
            n--;
        }
    });
    return sum/n;
}

function standardize(array){
    const mean = getMean(array);
    const standardDeviation = getStandardDeviation(array, mean);
    array.forEach((value, index, array)=>{
        zscore = (value - mean)/standardDeviation;
        array[index] = zscore;
    });
}

pcaProcess();

exports.pcaProcess = pcaProcess;

