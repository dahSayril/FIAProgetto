var SpotifyWebApi = require('spotify-web-api-node');
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var dataForge = require('data-forge');
const { resolve } = require('path');
require('data-forge-fs');


var client_id = '8ed4c3cd01d7411d9ec2d5962a61499b';
var client_secret = 'd5358a8f000c424dae68837b1d249032';
var redirect_uri = 'http://localhost:8080/callback';
var scopes = ['user-read-private', 'user-read-email','user-library-read'];
var state = 'some-state-of-my-choice';
var spotifyApi = new SpotifyWebApi({
    redirectUri: redirect_uri,
    clientId: client_id
});
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
var app = express();

app.get('/login', function(req, res) {
    res.redirect(authorizeURL);
});

app.get('/callback', function(req, res) {

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    var credentials = {
        clientId: client_id,
        clientSecret: client_secret,
        redirectUri: redirect_uri,
    };

    spotifyApi = new SpotifyWebApi(credentials);


    spotifyApi.authorizationCodeGrant(code)
    .then(data => {
        // Richiesta fittizia (solo una canzone) per accedere al totale delle canzoni
        spotifyApi.setAccessToken(data.body['access_token']);
        return spotifyApi.getMySavedTracks({
            limit : 1
        });
    })
    .then(async data => {
        const total = data.body.total; // Quante canzoni ho (totale canzoni)
        const limit = 50; // Quante canzoni prendo alla volta (max. 50 by Spotify)
        const n = (total/limit); // Quante volte devo iterare
        allMySongs = [];
        for (i = 0; i < n; i++){
            let subset = await getSongs(limit*i);
            allMySongs.push(...subset);
        }
        return allMySongs;
    })
    .then(async allMySongs => {

        myDataset = [];

        // Creo dataset con features canzone
        for (i=0; i < allMySongs.length; i++){
            const id = allMySongs[i].track.id;
            const features = await getFeatures(id);
            mySong = {
                Index: i,
                Title: allMySongs[i].track.name,
                Energy: features.energy,
                Danceability: features.danceability,
                'Loudness (dB)': features.loudness,
                Liveness: features.liveness,
                Valence: features.valence,
                'Length (Duration)': features.duration_ms,
                Acousticness: features.acousticness,
                Speechiness: features.speechiness
            }
            myDataset.push(mySong);
        }

        // Creo nuovo DataFrame dal DataSource e poi lo esporto
        let newDataFrame = new dataForge.DataFrame({
            values: myDataset
        });
        newDataFrame.asCSV().writeFileSync('../datasource/datasetUtente.csv');

    });

    res.redirect("http://www.google.it");

});

const getSongs = (offset) => {
 return new Promise((resolve, reject) => {
    spotifyApi.getMySavedTracks({
        limit : 50,
        offset: offset
    }).then(data =>{
        resolve(data.body.items);
    });
 });
};

const getFeatures = (trackId) => {
    return new Promise((resolve, reject) => {
        spotifyApi.getAudioFeaturesForTrack(trackId)
            .then((data) => {
                resolve(data.body);
            }).catch(error => {
                console.log("Error: " + JSON.stringify(error));
            });
    });
};

console.log('Listening on 8080');
app.listen(8080);

