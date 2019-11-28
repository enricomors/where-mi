/** Client ID per le API di Google */
const CLIENT_ID='185000965260-1dlcaidkh1h3f5g85kmvfgoeokeuu93u.apps.googleusercontent.com';
//const CLIENT_ID='644760882953-iksnqaqotrcbmf3nk29r03dccqp9e67e.apps.googleusercontent.com';

const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
];
/** Scopes per l'accesso all'API di YouTube */
const SCOPES = 'https://www.googleapis.com/auth/youtube';

var recordedBlob;

recorder = document.getElementById('recorder');
let preview = document.getElementById('preview');
let startButton = document.getElementById('record');
let stopButton = document.getElementById('stopRecord');

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

    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      var auth2 = gapi.auth2.getAuthInstance();
      var profile = auth2.currentUser.get().getBasicProfile();
      console.log('Email: ' + profile.getEmail());
      document.getElementById('profile').innerText = profile.getEmail();
    };

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
  document.getElementById('profile').innerText = '';

}

//ascoltatore del select purpose che abilita o disabilita il select detail
//utile solo per l'opzione why
purpose.addEventListener('click',() => {

  if(document.getElementById('purpose').value=="why"){
      document.getElementById("detail").disabled = false;
      document.getElementById("detail").selectedIndex = 1;
    }else {
      document.getElementById("detail").disabled = true;
      document.getElementById("detail").selectedIndex = 0;
    }
});

//funzioni regiztrazione video
var MediaRecorder;
const mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
let mediaRecorder;
let recordedBlobs;
let sourceBuffer;

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo = document.querySelector('video#recorded');
const recordButton = document.querySelector('button#record');
var timeout;

/** Pulsante per avviare la fotocamera */
const cameraButton = document.querySelector('button#camera');
cameraButton.addEventListener('click', () => {
  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    $('#locale').hide();
    $('#registra').show();
    $('#registraVideo').show();
    console.log(gapi.auth2.getAuthInstance().isSignedIn.get());
  } else {
    alert('Devi prima effettuare il log in.');
  }
});

/** Pulsante per avviare la registrazione */
const startRec = document.querySelector('button#start')
startRec.addEventListener('click', async () => {
  const constraints = {
    audio: true,
    video: true
  };
    console.log('Using media constraints:', constraints);
    await init(constraints);
});


async function init(constraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
    errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
  }
}

function handleSuccess(stream) {
  recordButton.disabled = false;
  console.log('getUserMedia() got stream:', stream);
  window.stream = stream;

  const gumVideo = document.querySelector('video#gum');
  gumVideo.srcObject = stream;
  startRec.setAttribute('disabled', '');
}


//Listener per evento click su pulsante Start recording/Stop recording
recordButton.addEventListener('click', () => {
  if (recordButton.textContent === 'Start Recording') {

    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = 'Start Recording';
    playButton.disabled = false;
    uploadButton.disabled = false;
    downloadButton.disabled= false;
  }
});

function startRecording() {
  //gestione delle restrizioni di tempo per le registrazioni

  if(document.getElementById("purpose").value=="what"){
    var recordingTime=15000;
  }else{

  if(document.getElementById("purpose").value=="why"){
    switch (document.getElementById("detail").value) {
      case "1":
      var recordingTime=31000;
        break;
      case "2":
      var recordingTime=41000;
      break;
      case "3":
      var recordingTime=51000;
      break;
      case "4":
      var recordingTime=61000;
      break;
    }

  }else{
      var recordingTime=31000;
    }
  }

  recordedBlobs = [];
  let options = {mimeType: 'video/webm;codecs=vp9'};
  if(typeof MediaRecorder.isTypeSupported === "function") {

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

  //funzione che attiva il timer della registrazione quando scade il tempo
   timeout=setTimeout(stopRecordTime, recordingTime);
}


function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}
//funzione che stoppa la registrazione del video
function stopRecording() {
  mediaRecorder.stop();
  clearTimeout(timeout);
  console.log('Recorded Blobs: ', recordedBlobs);
}

//funzione che viene chiamata dal timeout per interrompere la registrazione del video
function stopRecordTime(){
  stopRecording();
  recordButton.textContent = 'Start Recording';
  playButton.disabled = false;
  uploadButton.disabled = false;
  downloadButton.disabled= false;
};

//Event listener che attiva la riproduzione del video registrato
const playButton = document.querySelector('button#play');
playButton.addEventListener('click', () => {
  const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  recordedVideo.src = null;
  recordedVideo.srcObject = null;
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  recordedVideo.controls = true;
  recordedVideo.play();
});

//Event Listener che attiva il caricamento del video sul canale youtube
const uploadButton = document.querySelector('button#upload');
uploadButton.addEventListener('click', () => {
  const blob = new Blob(recordedBlobs, {type: 'video/webm'});
  const url = window.URL.createObjectURL(blob);

  uploadVideo(blob);
});

//Event Listener del bottone per permettere il download in locale del video registrato
const downloadButton = document.querySelector('button#download');
downloadButton.addEventListener('click', () => {
  const blob = new Blob(recordedBlobs, {type: 'video/webm'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = document.getElementById("titolo").value;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
});



/** Pulsante per caricamento locale del file */
const localButton = document.querySelector('button#local');
localButton.addEventListener('click', () => {
  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    $('#registra').hide();
    $('#registraVideo').hide();
    $('#locale').show();
  } else {
    alert('Devi prima effettuare il log in.');
  }
});

/** Funzione per aprire file picker */
function scegliFile() {
  var file = document.querySelector('input[type=file]').files[0];
  var reader = new FileReader();
  file instanceof Blob; // true
  console.log(file);
  uploadVideo(file);
}

// composizione descrizione video
function creaMetadata(){
  var purpose = document.getElementById("purpose").value;
  var language = document.getElementById("language").value;
  var content = document.getElementById("content").value;
  var detail = document.getElementById("detail").value;
  var audience = document.getElementById("audience").value;
  var description = document.getElementById("description").value;
  var mediumOlc = currentOlc.substring(0, 9);
  var wideOlc = currentOlc.substring(0, 6) + '00+';
  var feedback = document.getElementById("feedback");
  // 8FPHF800+-8FPHF8VV+-8FPHF8VV+57:
  var metadata = wideOlc+'-'+mediumOlc+'-'+currentOlc+":"+purpose+":"+language+":"+content+":A+"+audience+":P+"+detail+"#"+description;
  console.log(metadata);
  return metadata;
}

//caricamento video
function uploadVideo(blob){
  //passiamo il blob dallo sccript di crezione del video
  //attraverso funzione ajax (grazie a access token "auth" richiediamo upload su youtube)
  var descrizione = creaMetadata();
  var titolo = document.getElementById("titolo").value;
  console.log(titolo);
  var token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
  console.log(token);
  console.log(blob);

  metadata = {
    kind: 'youtube#video',
    snippet: {
      title: titolo + '#wheremi-guide',
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
      window.location.href='editor.html';
    //  document.getElementById("registraVideo").style.display="block";
      //document.getElementById("scegliVideo").style.display="block";
      //document.getElementById("loading").style.display="none";
    if (mediaRecorder.state != 'inactive') {
      mediaRecorder.stop();
    }
  },
  // ed una per il caso di fallimento
  error: function(request, status, error) {
    alert(request.responseText);
  }
  });
}
