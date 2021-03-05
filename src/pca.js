var pca = require('pca-js');
var dataForge = require('data-forge');
require('data-forge-fs');

function pcaProcess(){

    // Carico il DataSet
    let dataFrame = dataForge.readFileSync('../datasource/SpotifyCSV.csv').parseCSV();

    // Seleziono solo le features che mi interessano
    let features = ["Energy","Danceability","Loudness (dB)","Liveness","Valence","Length (Duration)","Acousticness","Speechiness"];
    let totalFeatures=["Index","Title","Artist","Top Genre","Energy","Danceability","Loudness (dB)","Liveness","Valence","Length (Duration)","Acousticness","Speechiness"];
    let subDataFrame = dataFrame.subset(features);

    var columns = subDataFrame.getColumns();
    var arrayOfColumns = columns.toArray();
    var arrayCompleto= dataFrame.toArray();
    
    let myColumns = []; // Array di array (ogni array e' una colonna)

    for (var column in arrayOfColumns) {
        let myColumn = [];
        myColumn.push(...arrayOfColumns[column].series.content.values);
        standardize(myColumn);
        myColumns.push(myColumn);
    }

    //Normalizzazione valori tra 0 e 1
    for(i=0;i<myColumns.length;i++){
        var max=-100,min=100;
        //Ricero il massimo e il minimo
        for(j=0;j<myColumns[i].length;j++){
            if(max<myColumns[i][j])
                max=myColumns[i][j];
            if(min>myColumns[i][j])
                min=myColumns[i][j];
        }
        //Normalizzo i valori
        for(j=0;j<myColumns[i].length;j++){
            myColumns[i][j]=normalize(myColumns[i][j],max,min);
        }
    }


    let newDataSource = [];
    for(let i = 0; i < myColumns[0].length; i++) {
        
        let mySong = { };
        mySong[totalFeatures[0]]=arrayCompleto[i].Index;
        mySong[totalFeatures[1]]=arrayCompleto[i].Title;
        mySong[totalFeatures[2]]=arrayCompleto[i].Artist;
        mySong[totalFeatures[3]]=arrayCompleto[i]['Top Genre'];
        for(let j = 0; j < myColumns.length; j++){
            let name = features[j];
            mySong[name] = myColumns[j][i];
        }
        newDataSource.push(mySong);

    }
    
    let newDataFrame3 = new dataForge.DataFrame({
		values: newDataSource
	});


    newDataFrame3.asCSV().writeFileSync('../datasource/datasetStandardizzato.csv');
    subDataFrame = newDataFrame3.subset(features);

    // DataSet come array di array
    let data = subDataFrame.toRows();

    // Numero di elementi (canzoni) nel DataSet
    let dimension = data.length;

    // Calcolo autovettori e autovalori per PCA
    var vectors = pca.getEigenVectors(data);

    // Percentuale di accuratezza considerando il primo, i primi due e i primi tre autovettori
    console.log("Percentuali: ");
    console.log("1: " + pca.computePercentageExplained(vectors,vectors[0]));
    console.log("2: " + pca.computePercentageExplained(vectors,vectors[0], vectors[1]));
    console.log("3: " + pca.computePercentageExplained(vectors,vectors[0], vectors[1], vectors[2]));
    
    // DataSet trasformato sulle prime quattro componenti principali individuate
    let adData = pca.computeAdjustedData(data, vectors[0], vectors[1], vectors[2]).adjustedData; // N.B. Array di array


    // Nuovo DataSource che conterra' il DataSet trasformato sulle PC individuate
    let myNewDataSource = [];

    // Riempo il nuovo DataSource
    for (i = 0; i < dimension; i++){

        let mySong = {};
        mySong.PC1 = adData[0][i];
        mySong.PC2 = adData[1][i];
        mySong.PC3 = adData[2][i];

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

function normalize(val, max, min) {
    return (val - min) / (max - min);
}

pcaProcess();

exports.pcaProcess = pcaProcess;

