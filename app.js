let pca = require('./src/pca');
let kmeans = require('./src/kmeans');
let dbscan = require('./src/dbscan');
pca.pcaProcess('./datasource/SpotifyCSV.csv');
kmeans.mainKMeans();
//dbscan.dbscan();