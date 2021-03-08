const pca = require('./src/pca');
const kmeans = require('./src/kmeans');
const dbscan = require('./src/dbscan');

/* PCA */
const pathDataset = pca.pcaProcess('./datasource/SpotifyCSV.csv'); // Array, primo elemento path standardizzato secondo elemento path pc
const pathStandardizzato = pathDataset[0];
const pathPC = pathDataset[1];

// /* KMeans */
const results = kmeans.mainKMeans(pathPC, pathStandardizzato);
const clusters = results[0];
const datasetAsArray = results[2];
const allSongsAsArray = results[3];

// /* Grafici KMeans */
kmeans.grafico3D(clusters,datasetAsArray,allSongsAsArray);
kmeans.graficoRadar(clusters, datasetAsArray, allSongsAsArray);
kmeans.makeHistograms(clusters, "Beats Per Minute (BPM)", datasetAsArray, allSongsAsArray);

/* DBScan */
dbscan.dbscan(pathPC);