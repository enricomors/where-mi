/** Token per l'accesso alle API di Mapbox (indicazioni) */
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3VzdGF6IiwiYSI6ImNrMWphcDk1MzB4aWwzbnBjb2N5NDZ0bG4ifQ.ijWf_bZClD4nTcL91sBueg';
/** Coordinate di Default per la mappa */
const DEFAULT_COORDS = [44.493671, 11.343035];
/** Client ID per le API di Google */
const CLIENT_ID='787144290576-jbgo63i1vhct58loglvp6et7fsflrest.apps.googleusercontent.com'
// tom const CLIENT_ID='185000965260-1dlcaidkh1h3f5g85kmvfgoeokeuu93u.apps.googleusercontent.com';
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
   //console.log(currentOlc);
   // crea marker per la posizione attuale con popup
   markerPosizioneAttuale = L.marker([lat, lng], { draggable: 'true'});

   markerPosizioneAttuale.addTo(map);
}

function onMapClick(e) {
    if (markerPosizioneAttuale) {
        map.removeLayer(markerPosizioneAttuale);
    }
    markerPosizioneAttuale = L.marker([e.latlng.lat, e.latlng.lng], { draggable: 'false'});

    markerPosizioneAttuale.addTo(map);
	currentOlc = OpenLocationCode.encode(e.latlng.lat, e.latlng.lng);
    console.log(currentOlc);
}

map.on('click', onMapClick);

/**autenticazione google*/
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
    document.getElementById("gbutton").style.visibility="hidden";
    document.getElementById("logOut").style.visibility="visible";
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
  document.getElementById("gbutton").style.visibility="visible";
  document.getElementById("logOut").style.visibility="hidden";
}

// GESTIONE REGISTRAZIONE E FUNZIONI


'use strict';

var MediaRecorder;

const mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
let mediaRecorder;
let recordedBlobs;
let sourceBuffer;


if(typeof MediaRecorder.isTypeSupported !== "function"){
  document.getElementById("registraVideo").style.display="none";
}

const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo = document.querySelector('video#recorded');
const recordButton = document.querySelector('button#record');

recordButton.addEventListener('click', () => {
  if (recordButton.textContent === 'Start Recording') {

    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = 'Start Recording';
    playButton.disabled = false;
    uploadButton.disabled = false;
  }
});

const playButton = document.querySelector('button#play');
playButton.addEventListener('click', () => {
  const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  recordedVideo.src = null;
  recordedVideo.srcObject = null;
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.controls = true;
  recordedVideo.play();
});

const uploadButton = document.querySelector('button#upload');
uploadButton.addEventListener('click', () => {
  const blob = new Blob(recordedBlobs, {type: 'video/webm'});
  const url = window.URL.createObjectURL(blob);

  uploadVideo(blob);
});

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function startRecording() {
  recordedBlobs = [];
  let options = {mimeType: 'video/webm;codecs=vp9'};
  if(typeof MediaRecorder.isTypeSupported === "function"){

  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.error(`${options.mimeType} is not Supported`);
    errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
    options = {mimeType: 'video/webm;codecs=vp8'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not Supported`);
      errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not Supported`);
        errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
        options = {mimeType: ''};
      }
    }
  }
} else {
        document.getElementById("registraVideo").style.display="none";
        alert("Il tuo browser non supporta il registratore. Carica il video");
}

  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop Recording';
  playButton.disabled = true;
  uploadButton.disabled = true;
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10); // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
  console.log('Recorded Blobs: ', recordedBlobs);
}

function handleSuccess(stream) {
  recordButton.disabled = false;
  console.log('getUserMedia() got stream:', stream);
  window.stream = stream;

  const gumVideo = document.querySelector('video#gum');
  gumVideo.srcObject = stream;
}

async function init(constraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
    errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
  }
}

document.querySelector('button#start').addEventListener('click', async () => {
  const constraints = {
    audio: true,
    video: {
      width: {
        exact:1280
      },
      height: {
        exact:720
    }
  }
  };
  console.log('Using media constraints:', constraints);
  await init(constraints);
});




// composizione descrizione video
function creaMetadata(){
   var purpose=document.getElementById("purpose").value;
   var language=document.getElementById("language").value;
   var content=document.getElementById("content").value;
   var detail=document.getElementById("detail").value;
   var audience=document.getElementById("audience").value;
   var metadata=currentOlc+":"+purpose+":"+language+":"+content+":"+audience+":"+detail;
   console.log(metadata);
   return metadata;
}

//caricamento video
  function uploadVideo(blob){
    //passiamo il blob dallo sccript di crezione del video
    //attraverso funzione ajax (grazie a access token "auth" richiediamo upload su youtube)
    var descrizione = creaMetadata();
    var titolo=document.getElementById("titolo").value;
  //  console.log(descrizione);
    console.log(titolo);
    var token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
    console.log(token);
    console.log(blob);


    metadata = {
      kind: 'youtube#video',
      snippet: {
        title: titolo,
        description: descrizione,
      },
      status: {
        privacyStatus: 'public',
        embeddable: true
      }
    };

    var meta = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    var form = new FormData();
    //Blob per il metadata
    form.append('video', meta);
    //Blob del video
    form.append('mediaBody', blob);

    //document.getElementById("registraVideo").style.display="none";
  //  document.getElementById("scegliVideo").style.display="none";
  //  document.getElementById("loading").style.display="block";

    //chiamata ajax
    $.ajax({
      url: 'https://www.googleapis.com/upload/youtube/v3/videos?access_token='
        + encodeURIComponent(token) + '&part=snippet,status',
      data: form,
      cache: false,
      contentType: false,
      processData: false,
      method: 'POST',
      success:function(data) {
        alert("Video caricato");
      //  document.getElementById("registraVideo").style.display="block";
    	  //document.getElementById("scegliVideo").style.display="block";
    	  //document.getElementById("loading").style.display="none";
       mediaRecorder.stop();

    },
// ed una per il caso di fallimento
error: function(request, status, error) {
        alert(request.responseText);
}

    });

  }
