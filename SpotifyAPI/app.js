var SpotifyWebApi = require('spotify-web-api-node');
var express = require('express'); // Express web server framework
var open = require('open');
var dataForge = require('data-forge');
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

const server = app.listen(8080);
console.log('Listening on 8080');
open('http://localhost:8080/login');

app.get('/login', function(req, res) {
    res.redirect(authorizeURL);
});

app.get('/callback', function(req, res) {

    console.log("Let' start..");

    var code = req.query.code || null;

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

        const limit = 50; // Spotify limita le richieste per gli autori a 50 alla volta :(

        // Creo dataset con features canzone
        for (i=0; i < allMySongs.length; i+=limit){
            const songIds = allMySongs.slice(i, i + limit).map(x=>x.track.id); // Array di ids di canzoni (usato per fare richiesta features)
            const artistsIds = allMySongs.slice(i, i + limit).map(x=>x.track.artists[0].id); // Array di ids di artisti (usato per fare richiesta artista)
            const arrayOfFeatures = await getFeatures(songIds); // Array, ogni valore è un oggetto contente features della canzone in posizione i
            const arrayOfGenres = await getTopGenre(artistsIds); // Array, ogni valore è un oggetto contente il genere dell'artista in posizione i 
            for (j = 0; j < arrayOfFeatures.length; j++){
                mySong = makeSongWrapper(i, j, allMySongs, arrayOfFeatures, arrayOfGenres); // Oggetto canzone ben formattato
                myDataset.push(mySong);
            }
        }

        // Creo nuovo DataFrame dal DataSource e poi lo esporto
        let newDataFrame = new dataForge.DataFrame({
            values: myDataset
        });
        newDataFrame.asCSV().writeFileSync('../datasource/datasetUtente.csv');

        console.log("Ok done gbye");

        server.close();

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

const getFeatures = (trackIds) => {
    return new Promise((resolve, reject) => {
        spotifyApi.getAudioFeaturesForTracks(trackIds)
            .then((data) => {
                resolve(data.body.audio_features);
            }).catch(error => {
                console.log("Error (line 129): " + JSON.stringify(error));
            });
    });
};

const getTopGenre = (artistIds) => {
    return new Promise((resolve, reject) => {
        spotifyApi.getArtists(artistIds)
            .then((data) => {
                resolve(data.body.artists.map(x => x.genres[0]));
            }).catch(error => {
                console.log("Error (line 140): " + JSON.stringify(error));
            });
    });
};

function makeSong(index, title, artist, genre, features){
    mySong = {
        Index: index,
        Title: title,
        Artist: artist.name,
        'Top Genre': genre,
        'Beats Per Minute (BPM)': features.tempo,
        Energy: features.energy,
        Danceability: features.danceability,
        'Loudness (dB)': features.loudness,
        Liveness: features.liveness,
        Valence: features.valence,
        'Length (Duration)': features.duration_ms,
        Acousticness: features.acousticness,
        Speechiness: features.speechiness
    }
    return mySong;
}

function makeSongWrapper(i, j, allMySongs, arrayOfFeatures, arrayOfGenres){
    const index = j + i;
    const title = allMySongs[index].track.name
    const artist = allMySongs[index].track.artists[0];
    const genre = arrayOfGenres[j];
    const features = arrayOfFeatures[j];
    return makeSong(index, title, artist, genre, features);
}

