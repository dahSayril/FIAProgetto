var SpotifyWebApi = require('spotify-web-api-node');
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
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

    spotifyApi.authorizationCodeGrant(code).then(
        function(data) {
            console.log('The token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            console.log('The refresh token is ' + data.body['refresh_token']);

            // Set the access token on the API object to use it in later calls
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
            spotifyApi.getMySavedTracks({
                limit : 50,
                offset: 1
            })
                .then(function(data) {
                    console.log('Done! '+data.body.items.length);
                    var tracks=data.body.items;
                    for (i=0;i<tracks.length;i++){
                        console.log(tracks[i]);
                    }
                }, function(err) {
                    console.log('Something went wrong!', err);
                });

        },
        function(err) {
            console.log('Something went wrong!', err);
        }
    );












});

console.log('Listening on 8080');
app.listen(8080);

