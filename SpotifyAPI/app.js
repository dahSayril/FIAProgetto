
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var dataForge = require('data-forge');
require('data-forge-fs');

var client_id = '8ed4c3cd01d7411d9ec2d5962a61499b'; // Your client id
var client_secret = 'd5358a8f000c424dae68837b1d249032'; // Your secret
var redirect_uri = 'http://localhost:8080/callback'; // Your redirect uri


var playlistDaOttimizzare="TestIA";
var datasetUtente=[];

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        getListofCurrenUserPlaylists(access_token,playlistDaOttimizzare);
        console.log("Sto prelevano le canzoni da spotify");
        setTimeout(()=>{
          datasetUtente.sort((a, b) => (a.index > b.index) ? 1 : -1);
          let newDataFrame3 = new dataForge.DataFrame({
            values: datasetUtente
          });
          newDataFrame3.asCSV().writeFileSync('../SpotifyAPI/datasetUtente.csv');
          console.log("Canzoni prelevate: "+datasetUtente.length);
        },10000);

        // we can also pass the token to the browser to make requests from there


        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

function getListofCurrenUserPlaylists(access_token,playlistDaOttimizzare){
  var playlist_id;
  var options = {
    url: 'https://api.spotify.com/v1/me/playlists',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };

  // use the access token to access the Spotify Web API
  request.get(options, function(error, response, body) {
    var playlists=body.items;
    for(i=0;i<playlists.length;i++) {
      if (playlists[i].name == playlistDaOttimizzare)
        playlist_id = playlists[i].id;
    }
  getTracksFromPlaylists(access_token,playlist_id);
  });


}

function getTracksFromPlaylists(access_token,playlistId){
  var tracks=[];

  var options = {
    url: 'https://api.spotify.com/v1/playlists/'+playlistId+'/tracks',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };

  // use the access token to access the Spotify Web API
  request.get(options, function(error, response, body) {
      tracks=body.items;
      console.log(tracks.length);
      for(i=0;i<tracks.length;i++)
      getFeaturesFromTrack(access_token,tracks[i].track.id,i+1,tracks[i].track.name);

  });
}

function getFeaturesFromTrack(access_token,trackId,index,titolo){
  var options = {
    url: 'https://api.spotify.com/v1/audio-features/'+trackId,
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };

  // use the access token to access the Spotify Web API
  request.get(options, function(error, response, body) {
    var boolean=false;
    var feature=body;
    if(feature!==undefined) {
      var song = {
        index: index,
        title: titolo,
        id: trackId,
        energy: feature.energy,
        danceability: feature.danceability,
        loudness: feature.loudness,
        liveness: feature.liveness,
        valence: feature.valence,
        duration: feature['duration_ms'],
        acousticness: feature.acousticness,
        speechiness: feature.speechiness,
      };
      datasetUtente.push(song);
    }
  });
}

console.log('Listening on 8080');
app.listen(8080);
