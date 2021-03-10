var nodeplotlib = require('nodeplotlib');
var pca = require('pca-js');
var dataForge = require('data-forge');
require('data-forge-fs');

const standardizzatoEsportato = './datasource/datasetStandardizzato.csv';
const pcEsportato = './datasource/datasetComponentiPrincipali.csv';

function pcaProcess(datasetDiPartenza,percentualeOttima){

    // Carico il DataSet
    let dataFrame = dataForge.readFileSync(datasetDiPartenza).parseCSV();

    // Seleziono solo le features che mi interessano
    let features = ["Beats Per Minute (BPM)", "Energy","Danceability","Loudness (dB)","Liveness","Valence","Length (Duration)","Acousticness","Speechiness"];
    let totalFeatures=["Index","Title","Artist","Top Genre","Beats Per Minute (BPM)", "Energy","Danceability","Loudness (dB)","Liveness","Valence","Length (Duration)","Acousticness","Speechiness"];
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

    // //Normalizzazione valori tra 0 e 1
    // for(i=0;i<myColumns.length;i++){
    //     var max=-100,min=100;
    //     //Ricero il massimo e il minimo
    //     for(j=0;j<myColumns[i].length;j++){
    //         if(max<myColumns[i][j])
    //             max=myColumns[i][j];
    //         if(min>myColumns[i][j])
    //             min=myColumns[i][j];
    //     }
    //     //Normalizzo i valori
    //     for(j=0;j<myColumns[i].length;j++){
    //         myColumns[i][j]=normalize(myColumns[i][j],max,min);
    //     }
    // }


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


    newDataFrame3.asCSV().writeFileSync(standardizzatoEsportato);
    subDataFrame = newDataFrame3.subset(features);

    // DataSet come array di array
    let data = subDataFrame.toRows();

    // Numero di elementi (canzoni) nel DataSet
    let dimension = data.length;

    // Calcolo autovettori e autovalori per PCA
    var vectors = pca.getEigenVectors(data);

    //Percentuale di accuratezza considerando il primo, i primi due e i primi tre autovettori
    console.log("Percentuali: ");
    let v = [];
    let percentualiVarianza = [];
    let percentuale;
    let i;
    for(i = 0; i < vectors.length; i++) {
        v.push(vectors[i]);
        percentuale=pca.computePercentageExplained(vectors, ...v);
        percentualiVarianza.push(percentuale);
        console.log(i+1 +" : "+percentuale);
        if(percentuale>=percentualeOttima) {
            break;
        }
    }

    graficoComponentiVarianza(vectors);

    let adData = pca.computeAdjustedData(data, ...v).adjustedData; // N.B. Array di array


    // Nuovo DataSource che conterra' il DataSet trasformato sulle PC individuate
    let myNewDataSource = [];
    let elementi=[];
    //For per ottenere le scritte PC1,PC2... in base a quanti vettori ho usato per la pca
    for(j=0;j<adData.length;j++) {
        elementi.push('PC'+(j+1));
    }

    // Riempo il nuovo DataSource
    for (let i = 0; i < dimension; i++){

        let mySong = {};
        for(j=0;j<adData.length;j++)
            mySong[elementi[j]] = adData[j][i];


        myNewDataSource.push(mySong);

    }

    // Creo nuovo DataFrame dal DataSource e poi lo esporto
    let newDataFrame2 = new dataForge.DataFrame({
		values: myNewDataSource
	});
    newDataFrame2.asCSV().writeFileSync(pcEsportato);

    return [standardizzatoEsportato, pcEsportato];
    
}

function graficoComponentiVarianza(vectors){

    let v = [];
    let percentualiVarianza = [];
    let percentuale;
    let i;
    for(i = 0; i < vectors.length; i++) {
        v.push(vectors[i]);
        percentuale=pca.computePercentageExplained(vectors, ...v);
        percentualiVarianza.push(percentuale);
    }

    let componenti = [...Array(++i).keys()].map(x=>x+1);

    //Generazione del grafico
    var trace1 = {
        x: componenti,
        y: percentualiVarianza,
        type: 'scatter'
    };
    var data = [trace1];
    var layout = {
        title: 'Variazione numero componenti in base alla varianza della PCA',
        xaxis: {
            title: 'Numero Componenti',
        },
        yaxis: {
            title: 'Percentuale Varianza',
        }
    };

    nodeplotlib.plot(data,layout);

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


function graficoComonetiPrecisioneVarianza(datasetDiPartenza){
    // Carico il DataSet
    let dataFrame = dataForge.readFileSync(datasetDiPartenza).parseCSV();

    // Seleziono solo le features che mi interessano
    let features = ["Beats Per Minute (BPM)", "Energy","Danceability","Loudness (dB)","Liveness","Valence","Length (Duration)","Acousticness","Speechiness"];
    let totalFeatures=["Index","Title","Artist","Top Genre","Beats Per Minute (BPM)", "Energy","Danceability","Loudness (dB)","Liveness","Valence","Length (Duration)","Acousticness","Speechiness"];
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


    subDataFrame = newDataFrame3.subset(features);

    // DataSet come array di array
    let data = subDataFrame.toRows();



    // Calcolo autovettori e autovalori per PCA
    var vectors = pca.getEigenVectors(data);

    //Percentuale di accuratezza considerando il primo, i primi due e i primi tre autovettori
    console.log("Percentuali: ");
    let v = [];
    let percentuale;

    let numeroComponentiUsate=[];
    let percentuali=[];
    for(let i = 0; i < vectors.length; i++) {
        v.push(vectors[i]);
        numeroComponentiUsate.push(v.length);
        percentuali.push(pca.computePercentageExplained(vectors, ...v));
    }


    var trace1 = {
        x: numeroComponentiUsate,
        y: percentuali,
        type: 'scatter'
    };

    var dataGrafico=[trace1];
    var layout = {
        title: 'Variazione numero componenti in base alla varianza della PCA',
        xaxis: {
            title: 'Numero Componenti',
        },
        yaxis: {
            title: 'Percentuale Varianza',
        }
    };

    nodeplotlib.plot(dataGrafico,layout);
}

exports.graficoComonetiPrecisioneVarianza=graficoComonetiPrecisioneVarianza;
exports.pcaProcess = pcaProcess;

