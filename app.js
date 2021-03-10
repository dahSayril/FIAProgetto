const pca = require('./src/pca');
const kmeans = require('./src/kmeans');
const dbscan = require('./src/dbscan');

<<<<<<< Updated upstream

pca.graficoComonetiPrecisioneVarianza('./datasource/datasetUtente.csv');
=======
// Grafico che mostra la sceta della varianza accettabile
let percentualVarianza=[0.40,0.50,0.60,0.70,0.80,0.90,1]
let elbowPoints=[];
let numeroPunti=[];
let numeroCluster=[];
let i=0;
// pca.graficoComonetiPrecisioneVarianza('./datasource/datasetUtente.csv');
>>>>>>> Stashed changes

// while (i<percentualVarianza.length){
//     let pathDataset = pca.pcaProcess('./datasource/SpotifyCSV.csv',percentualVarianza[i]); // Array, primo elemento path standardizzato secondo elemento path pc
//     let pathStandardizzato = pathDataset[0];
//     let pathPC = pathDataset[1];
//     let results = kmeans.mainKMeans(pathPC, pathStandardizzato);
//     elbowPoints.push(results[0].length);

//     let j=0;
//     var clusters=[];
//     var punti=[];
//     while(j<results[0].length){
//         clusters.push(j);
//         punti.push(results[0][j].points.length);
//         j++;
//     }
//     numeroPunti.push(punti);
//     numeroCluster.push(clusters);
//     i++;
// }
// kmeans.graficoElbowPointByVarianza(elbowPoints,percentualVarianza);
// kmeans.graficoNumeroPuntiClusterByVarianza(numeroPunti,numeroCluster,percentualVarianza);


const pathDataset = pca.pcaProcess('./datasource/datasetUtente.csv',0.70); // Array, primo elemento path standardizzato secondo elemento path pc
const pathStandardizzato = pathDataset[0];
const pathPC = pathDataset[1];

const results = kmeans.mainKMeans(pathPC, pathStandardizzato);
const clusters = results[0];
const datasetAsArray = results[2];
const allSongsAsArray = results[3];
<<<<<<< Updated upstream

kmeans.grafico3D(clusters,datasetAsArray,allSongsAsArray);
kmeans.graficoRadar(clusters, datasetAsArray, allSongsAsArray);
kmeans.makeHistograms(clusters, "Danceability", datasetAsArray, allSongsAsArray);
=======


kmeans.grafico3D(clusters,datasetAsArray,allSongsAsArray);
kmeans.graficoRadar(clusters, datasetAsArray, allSongsAsArray);
kmeans.makeHistograms(clusters, "Beats Per Minute (BPM)", datasetAsArray, allSongsAsArray);
>>>>>>> Stashed changes

/* DBScan */
// dbscan.dbscan(pathPC);