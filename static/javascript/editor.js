/** Token per l'accesso alle API di Mapbox (indicazioni) */
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3VzdGF6IiwiYSI6ImNrMWphcDk1MzB4aWwzbnBjb2N5NDZ0bG4ifQ.ijWf_bZClD4nTcL91sBueg';
/** Coordinate di Default per la mappa */
const DEFAULT_COORDS = [44.493671, 11.343035];
/** Client ID per le API di Google */
const CLIENT_ID='787144290576-jbgo63i1vhct58loglvp6et7fsflrest.apps.googleusercontent.com'
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
];
/** Scopes per l'accesso all'API di YouTube */
const SCOPES = 'https://www.googleapis.com/auth/youtube';

var markerPosizioneAttuale;
var circlePosizioneAttuale;
var markerSearch;
var circleSearch;

var markerDraggable;
var circleDraggable;
var currentPosition;
var currentOlc;

// per il momento lunghezza massima 30 secondi, poi sarà da gestire meglio
var maxLenght = 30000;
var recordedBlob;

recorder = document.getElementById('recorder');
let preview = document.getElementById('preview');
let startButton = document.getElementById('record');
let stopButton = document.getElementById('stopRecord');

/** Marker verde */
var greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/** Inizializza la mappa Leaflet */
var map = L.map('map').setView(DEFAULT_COORDS, 15);

/** Tile layer per la mappa */
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: MAPBOX_TOKEN
}).addTo(map);

/** Ottiene la posizione corrente dal browser */
navigator.geolocation.getCurrentPosition(displayLocation);

function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
  console.log(gapi.auth2.getAuthInstance().signIn());
}

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
};

function initClient(callback) {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    cookiepolicy: 'single_host_origin',
    scope: SCOPES
  }).then(() => {
    // Listen for sign in state changes
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    console.log(gapi.auth2.getAuthInstance().isSignedIn.get());
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  }).catch(err => console.log(JSON.stringify(err)));
}

function updateSigninStatus(status) {
  if (status) {
    console.log('in');
  } else {
    alert("Devi prima effettuare il log in.");
  }
};

// logout function
function signOut() {
  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    console.log("out");
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut();
    auth2.disconnect();
    alert("Disconnesso.");
    console.log("Disconnesso.")
    $('#data').hide();
    $('#recordingSection').hide();
  };
}

/**
 * SEZIONE METODI DELLA MAPPA
 */
// Se sono presenti video vengono mostrati dei markers
function loadYTVideos() {
  gapi.client.setApiKey("AIzaSyCfAGcL91p3JSJIbohytN94hsRgnyz-jJs");
  // Crea query string x YouTube
  var queryString = currentOlc.substring(0, 8);
  console.log(queryString);
  // ricerca video 
  gapi.client.load("youtube", "v3", function() {
    console.log("YT Api ready");
    var req = gapi.client.youtube.search.list({
      part: "snippet",
      type: "video",
      q: queryString,
      maxResults: 50
    });
    // execute the request
    req.execute(function(response) {
      console.log(response); //just for debug purpose
      var videosIDString = ''; // for all videos ids
      response.result.items.forEach(function(item) {
        var currentVideo = new Object();
        currentVideo.idV = item.id.videoId;
        let title = item.snippet.title;
        let olc = item.snippet.description.split('#')[0].split(":")[0];
        // calcola le coordinate relative all'olc del video
        let coords = OpenLocationCode.decode(olc);
        // aggiunge nuovo marker alla mappa alle coordinate del video
        var m = new L.marker([coords.latitudeCenter, coords.longitudeCenter])
          .bindPopup(title)
          .addTo(map);
        // Setta callback per evento di click su marker
        m.on('click', onMarkerClick);
      });
    });
  });
};

/** Mostra sulla mappa la posizione ricevuta dal browser */
function displayLocation(position) {
  // console.log('position', position);
   var lat = position.coords.latitude;
   var lng = position.coords.longitude;
   // aggiorna la posizione corrente
   currentPosition = [lat, lng];
   // ottiene l'OLC della posizione corrente
   currentOlc = OpenLocationCode.encode(lat, lng);
   // apre la mappa sulla posizione ricevuta dal browser
   map.setView([lat, lng], 18);
   // crea marker per la posizione attuale con popup
   markerPosizioneAttuale = L.marker([lat, lng], { draggable: 'true'});
   markerPosizioneAttuale.setIcon(greenIcon);
   markerPosizioneAttuale.bindPopup(`<div style="text-align: center;">
   <h6 class="text-uppercase" style="margin-top: 2%;">You are here</h6>
   <hr align="center">If location is incorrect, drag the marker</a>
   <hr align="center"><button onclick="loadYTVideos()" id="searchButton" type="button"
    class="btn btn-success">Search clips</button>
   </div>`).openPopup();
   markerPosizioneAttuale.addTo(map);
};

//prende in input lo stream dati e la lunghezza in millisecondi
function startRecording(stream, lengthInMS) {

  //inizializza un array vuoto
  let data = [];

  //fa partire lo stram dati
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = event => data.push(event.data);
  recorder.start();
  //identifica ogni registrazione con un Id diverso, imposta una nuova traccia ogni volta
  recorderId = setTimeout(function () { recorder.state == "registratore"; recorder.stop(); stream.getTracks().forEach(track => track.stop()); }, lengthInMS);
  //promessa che indica se è stata rispettata o no.
  //se si allora ok, se no ritorna un errore
  return new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  })
    .then(() => data);
};

/** Stop the recording and each track */
function stop(stream) {
  //resetta il tempo di timeout, ferma il recorder
  clearTimeout(recorderId);
  recorder.stop();
  stream.getTracks().forEach(track => track.stop());
};

startButton.addEventListener("click", function () {
  //ask the browser for permission
  navigator.mediaDevices.getUserMedia({

    //permette di registrare sia audio che video
    video: true,
    audio: true
  }).then(stream => {

    //lo stream serve sia per l' anteprima in diretta, sia per l' anteprima successiva che per il dowload del .webm
    preview.srcObject = stream;
    downloadButton.href = stream;
    preview.captureStream = preview.captureStream || preview.mozCaptureStream || preview.webkitCaptureStream;

    //promesssa con concatenazione di funzioni
    return new Promise(resolve => preview.onplaying = resolve);
  }).then(() => startRecording(preview.captureStream(), maxAllowedRegistrationLenght))
    .then(recordedChunks => {
      //registra in formato blob, inserendo il tipo video/webm, il registrato poi si può scaricare grazie al bottone dowload
      recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
      registratore.src = URL.createObjectURL(recordedBlob);
      downloadButton.href = registratore.src;
      downloadButton.download = "clip.webm";

    })

    //log se errore
    .catch(log);
}, false);

//ferma la preview
stopButton.addEventListener("click", function () {
  if (recorder.state == "registratore") {
    stop(preview.srcObject);
  }
}, false);
