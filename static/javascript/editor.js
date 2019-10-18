
const access_token = 'pk.eyJ1Ijoic3VzdGF6IiwiYSI6ImNrMWphcDk1MzB4aWwzbnBjb2N5NDZ0bG4ifQ.ijWf_bZClD4nTcL91sBueg';
const CLIENT_ID='185000965260-1dlcaidkh1h3f5g85kmvfgoeokeuu93u.apps.googleusercontent.com'
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';
var markerPosizioneAttuale;
var circlePosizioneAttuale;
var markerSearch;
var circleSearch;

var markerDraggable;
var circleDraggable;
var currentPosition;
var currentOlc;

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
var map = L.map('map').setView([ 44.493671, 11.343035], 15);

/** Tile layer per la mappa */
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: access_token
}).addTo(map);

navigator.geolocation.getCurrentPosition(displayLocation);




/**
 * SEZIONE PER IL LOGIN
 */

  // Login function
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
      // Handle initial sign in state
      //updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      //disabilitaBottoni(gapi.auth2.getAuthInstance().isSignedIn.get());
    })
    .catch(err => console.log(JSON.stringify(err)));
  }

  function updateSigninStatus(status) {
    if (status) {
      console.log('in');
    } else {
      alert("Devi prima effettuare il log in.");
     //$("#logout").remove();
     //location.reload();
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
function showMarkers() {
  gapi.client.setApiKey("AIzaSyCfAGcL91p3JSJIbohytN94hsRgnyz-jJs");
  // seach videos
  gapi.client.load("youtube", "v3", function() {
    console.log("YT Api ready");
    var request = gapi.client.youtube.search.list({
      part: "snippet",
      type: "video",
      q: "8FPHF9Q5+J4",
      maxResults: 50,
      order: "title"
    });
        // execute the request
        request.execute(function(response) {
          console.log(response); //just for debug purpose
          var videosIDString = ''; // for all videos ids
          response.result.items.forEach(function(item) {
            var currentVideo = new Object();
            currentVideo.idV = item.id.videoId;
            videosIDString = videosIDString + currentVideo.idV + ",";
          });

          // rimuovo la virgola finale
          videosIDString = videosIDString.substring(0, videosIDString.length - 1);

            // ottengo i video in base agli id
            var videoIDRequest = gapi.client.youtube.videos.list({
              id: videosIDString,
              part: 'id,snippet,recordingDetails',
              order: "title"
            });
            videoIDRequest.execute(function(response) {
              console.log(response); //just for debug purpose
              response.items.forEach(function(item) {
                let title = item.snippet.title.split(":")[0];
                let olc = item.snippet.description.split("#")[0].split(":")[0];
                //let olc = item.snippet.description.split(":")[0];
                let coords = OpenLocationCode.decode(olc);

                var m = new L.marker([coords.latitudeCenter, coords.longitudeCenter])
                .bindPopup(title)
                .addTo(map);

                // Event setup
                m.on('click', onMarkerClick);
              });
            });
          });
      });
};

/** Mostra sulla mappa la posizione ricevuta dal browser */
function displayLocation(position) {
  // console.log('position', position);
   var lat = position.coords.latitude;
   var lng = position.coords.longitude;
   // apre la mappa sulla posizione ricevuta dal browser
   map.setView([lat, lng], 18);
   // crea marker per la posizione attuale con popup
   markerPosizioneAttuale = L.marker([lat, lng], { draggable: 'true'});
   markerPosizioneAttuale.bindPopup(`<div style="text-align: center;">
   <h6 class="text-uppercase" style="margin-top: 2%;">You are here</h6>
   <hr align="center">If location is incorrect, drag the marker</a>
       </div>`).openPopup();
   markerPosizioneAttuale.addTo(map);
}

// set the popup information: latlng and address
function addPopup (marker) {
  // OSM Nomitatim documentation: http://wiki.openstreetmap.org/wiki/Nominatim
  var jsonQuery = "http://nominatim.openstreetmap.org/reverse?format=json&lat=" + marker.getLatLng().lat + "&lon=" + marker.getLatLng().lng + "&zoom=18&addressdetails=1";

  $.getJSON(jsonQuery).done( function (result_data) {
      console.log(result_data);

      var road;

      if(result_data.address.road) {
          road = result_data.address.road;
      }
      else if (result_data.address.pedestrian) {
          road = result_data.address.pedestrian;
      }
      else {
          road = "No defined";
      }
      var olc= OpenLocationCode.encode(marker.getLatLng().lat, marker.getLatLng().lng, 10);

      var popup_text = "<b>Olc:</b> "+ olc  +
          "</br><b>Road:</b> " + road + ", " + result_data.address.house_number +
          "</br><b>City:</b> " + result_data.address.city +
          "</br><b>Postal Code:</b> " + result_data.address.postcode;

      marker.bindPopup(popup_text).openPopup();

      map.removeLayer(markerPosizioneAttuale);
      map.removeLayer(circlePosizioneAttuale);
      if(markerSearch) {
          map.removeLayer(markerSearch);
          map.removeLayer(circleSearch);
      }

  });

}
/*
// Handler click event on map
function onMapClick(e) {

  if(selectedPoint)
    selectedPoint.setIcon(myPositionIcon);

  newPoint
  .setIcon(audioIcon)
  .setLatLng(e.latlng)
  .bindPopup('Record the first clip').openPopup()
  .addTo(map)

  selectedPoint = newPoint;

  // name field update
  $("#name").val('');
  $("#name").attr({"readonly": false});

  //show form
  showForm();

};

// Handler click event on existing marker
function onMarkerClick(marker) {
  newPoint.remove();

  if(selectedPoint)
    selectedPoint.setIcon(marker.target.getIcon());

  selectedPoint = marker.target;
  selectedPoint.setIcon(defaultIcon);

  // name field update
  $("#name").attr({"readonly": false});
  $("#name").val(selectedPoint.getPopup().getContent());

  //show form
  showForm();
}

// Map update
function updateMap(coord) {
  map.setView(coord,14);
  // Set marker current position
  var marker = L.marker(coord);
  marker.setIcon(myPositionIcon);
  // Adding popup to the marker
  marker.bindPopup('You are here').openPopup();
    // Adding marker to the map
    marker.addTo(map);

    // Event setup
    marker.on('click', onMarkerClick);

  };

// show/hide form fields
function showForm() {
  if (selectedPoint) {
    $('#data').show();
    $('#detailLevel').hide();
  }
  else {
    $('#data').hide();
    $('#recordingSection').hide();
  }
}

// only if why purpose is selected the detail level is shown
function showDetailLevel() {
  if ($('#purpose').val()=="why")
    $('#detailLevel').show();
  else
    $('#detailLevel').hide();
}

// gps location
function gpsLocation() {
  // If geoloc is enabled
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
          // If user allows geoloc
          pos => updateMap([pos.coords.latitude, pos.coords.longitude]),
          // User refuses geoloc
          () => updateMap(default_coords),
          {enableHighAccuracy: true});
  }
  else  updateMap(default_coords);
}

// Init map
function mapInit(coord) {

  map = L.map('map').setView(coord, 14);

    // Setup tile layer
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 22,
      id: 'mapbox.streets',
      accessToken: leaflet_access_token
    }).addTo(map);

    // Gps request
    gpsLocation();

    // Show markers
    showMarkers();

    // Event setup
    map.on('click', onMapClick);
  }
*/

// record clip
function recordClip() {
  var gumStream;            //stream from getUserMedia()
  var recorder;             //WebAudioRecorder object
  var input;              //MediaStreamAudioSourceNode  we'll be recording
  var encodingType;           //holds selected encoding for resulting audio (file)
  var encodeAfterRecord = true;       // when to encode

  // shim for AudioContext when it's not avb.
  var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext; //new audio context to help us record

    $('#record').click((start)=>{

      if($("#name").val().trim().length == 0) {
        alert('Inserire titolo audio');
        return;
      }

      var constraints = { audio: true, video:true }

      // standard promise based getUserMedia()
      navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        audioContext = new AudioContext(); //create an audio context after getUserMedia is called
        gumStream = stream; //assign to gumStream for later use
        input = audioContext.createMediaStreamSource(stream); //use the stream
        encodingType = ENCONDING_TYPE; //set the encoding

        recorder = new WebAudioRecorder(input, {
          workerDir: "/static/WebAudioRecorder/",
          encoding: encodingType,
                numChannels:2, //2 is the default, mp3 encoding supports only 2
                onEncoderLoading: function(recorder, encoding) {
                  console.log("Loading "+encoding+" encoder...");
                },
                onEncoderLoaded: function(recorder, encoding) {
                  console.log(encoding+" encoder loaded");
                }
              });

        recorder.onComplete = function(recorder, blob) {
          console.log("Encoding complete");
          createDownloadLink(blob,recorder.encoding);

                // var reader = new FileReader();
                // reader.onload = function () {
                //     b64 = reader.result.replace(/^data:.+;base64,/, '');
                //     document.getElements("video").value = b64;
                //     console.log(b64);
                // };
                // reader.readAsDataURL(blob);
              }

              recorder.setOptions({
                timeLimit:180,
                encodeAfterRecord:encodeAfterRecord,
                ogg: {quality: 0.5},
                mp3: {bitRate: 160}
              });

            //start the recording process
            recorder.startRecording();
            console.log("Recording started");
            // hide record button
            $('#record').hide();
            $('#stopButton').prop("hidden", false);

            //$('#stopButton').show();

            // show stop button
            //$("#buttonSelection").append('<button id = "stopButton" class="btn btn-danger btn-block btn-sm text-center"">Stop</button>');
            //$('#recordButton').hide();
            // $("#buttonSelection").append(`<button  id="stopButton" class="btn btn-danger btn-block btn-lg text-center
            //  text-sm-center d-xl-flex align-items-center justify-content-xl-center align-items-xl-center">Stop
            //  </button>`);


            $('#stopButton').click((start)=>{
                // stop microphone access
                gumStream.getAudioTracks()[0].stop();
                // tell the recorder to finish the recording (stop recording + encode the recorded audio)
                recorder.finishRecording();
                // show record button
                $('#stopButton').hide();
                $('#record').show();
                // remove stop button
                //$('#stopButton').remove();
                console.log('Recording stopped');

              });

          }).catch(function(error) {
            console.log(error);
          });
        });
  }

// function printMetadata() {
//  console.log(audio.metadata)
// }

// create download link for the clip (USELESS?? BOH)
function createDownloadLink(blob,encoding) {

  var url = URL.createObjectURL(blob);
  console.log(blob);
  let smallUrl = url.split('/');
  smallUrl = smallUrl[smallUrl.length-1];
  //console.log(smallUrl[smallUrl.length-1]);

  // test purpose
  //console.log(url);
  //var audio = document.createElement('audio');
  //var li =  document.createElement('li');
  //var link = document.createElement('a');
  var metadata = createMetadata();
  var range = document.getElementById('range');


  //add controls to the <audio> element
  //audio.controls = true;
  //audio.src = url;

  //link the a element to the blob
  //link.href = url;
  //link.download = new Date().toISOString() + '.'+encoding;
  //link.innerHTML = link.download;

  $("#recs").append(
    `<!--Start: clip -->
    <article id="${smallUrl}card" style="margin-bottom:3%;">
    <div class="row text-center">
    <div class="col text-center d-flex d-xl-flex justify-content-center justify-content-xl-center">
    <div class="text-center bg-white border rounded border-white shadow" style="width: 50%;height: 100%;">
    <div class="row" style="margin-left: 3%;margin-right: 3%;margin-top: 3%;">
    <div class="col text-center"><label class="text-center d-flex justify-content-center d-xl-flex justify-content-xl-center"><strong>Title</strong></label><input class="border rounded border-white text-center d-xl-flex justify-content-xl-center d-flex justify-content-center text-sm-center" type="text" readonly="" value="${$("#name").val()}" style="font-size:17px; font-weight:bold;"></div>
    <div class="col text-center"><label class="d-xl-flex d-flex justify-content-center justify-content-xl-center">Language</label><input class="border rounded border-white text-center d-flex justify-content-center d-xl-flex justify-content-xl-center  text-sm-center" type="text" readonly="" value="${$("#language").val()}"></div>
    <div class="col text-center"><label class="d-xl-flex d-flex justify-content-center justify-content-xl-center">Purpose&nbsp;</label><input class="border rounded border-white text-center d-xl-flex justify-content-xl-center d-flex justify-content-center  text-sm-center text-xl-center " type="text" readonly="" value="${$("#purpose").val()}"></div>
    </div>
    <hr>
    <div class="row text-center" style="margin-top: 1%;margin-left: 3%;margin-right: 3%;">
    <div class="col text-center d-xl-flex d-flex justify-content-center justify-content-xl-center"><audio preload="metadata" id="${smallUrl}audio" src="${url}" controls="true"></audio></div>
    </div>
    <hr>
    <div class="row" style="margin-top: 3%;margin-bottom: 3%;margin-right: 3%;margin-left: 3%;">
    <div class="col"><button id="${smallUrl}upload" class="btn btn-success btn-block btn-lg bg-success" type="button" style="background-color: #00563f;">UPLOAD</button></div>
    <div class="col"><button id="${smallUrl}delete" class=" btn btn-danger btn-block btn-lg border-danger" type="button">DELETE</button>
    </div>
    <div class="col"><button id="${smallUrl}review" class="btn btn-warning btn-block btn-lg border-warning" type="button" style="color: #ffffff;">REVIEW</button></div>
    </div>
    </div>
    </div>
    </div>

    <script>
    $('#${smallUrl}upload').click(function() {
      console.log(this.id.split('upload')[0]);

      console.log("dentro l'upload");
    });

    $("#${smallUrl}delete").click(function() {
      $("#"+this.id.split('delete')[0]+"card").hide();
    });

    $("#${smallUrl}review").click(function() {
      let url = "blob:https://site181929.tw.cs.unibo.it/"+this.id.split('review')[0];
      $('#audioClip').attr("src", url);
      $('#modifyClip').modal();

      var vid = document.getElementById("audioClip");
      vid.onloadedmetadata = function() {
        var sec = Math.floor(vid.duration%60)+1;
        var min = Math.floor(vid.duration/60);
        if(sec<10) sec = "0"+sec;
        var time = min + "." + sec;

        noUiSlider.create(range, {
          start: [0,time],
          connect: true,
          tooltips: [true, wNumb({decimals: 2})],
          range: {
            'min': [0],
            'max': [parseFloat(time)]
          }
        });
      }
    });
    </script>
    </article>
    <!--End: clip -->`);

  $('#recordingSection').slideDown();

  // ad upload video deve essere passata il risultato di cloudinary
  //uploadVideo(blob, metadata);

  //uploadVideo(player.recordedData, metadata);
  $( "#upload" ).click(function() {
    uploadVideo(blob, metadata);
  });

}

function setVolume() {
  $('#audioClip').prop("volume", $('#volumeClip').val());
}

function onSave() {

  //save volume changes
  let smallUrl = $('#audioClip').attr('src').split('/');
  smallUrl = smallUrl[smallUrl.length-1];
  $('#'+smallUrl+"audio").prop("volume", $('#volumeClip').val());
  $("#volumeClip").val('');

  //save start/end changes

  range.noUiSlider.destroy();

}

function onCancel() {

  //reset volume changes
  $("#volumeClip").val('');

  //reset start/end changes
  range.noUiSlider.destroy();

}


// Handler for the button 'Send Clip'
function createMetadata() {
  // Retrieve metadata
  var geoloc = OpenLocationCode.encode(selectedPoint.getLatLng().lat, selectedPoint.getLatLng().lng, OpenLocationCode.CODE_PRECISION_EXTRA);
  // just for debug
  //console.log(geoloc);
  var purpose = $("#purpose").val();
  var language = $("#language").val();
  // just for debug
  //console.log(language);
  var content = $("#content").val();
  var audience = 'A+';
  audience += $("#audience").val();
  var detail = 'P+';
  detail += $("#audience").val();
  var detail = 'P+';
  detail += $("#detailLevel").val();
  console.log(detail);
  var description =  $("#description").val();

  // name of the new point
  var name = $("#name").val();

  // Define metadata
  var metadata = {
    kind: 'youtube#video',
    snippet: {
      title: name + ":8FPHF9Q5+J4",
      description: [[geoloc, purpose, language, content, audience, detail].join(':'),description]
      .join('#'),
      categoryId: 22

    },
    status: {
      privacyStatus: 'public',
      embeddable: true
    }
  };

  console.log(metadata.snippet.description);

  return metadata;

//  uploadVideo(video, metadata, function(data) {
//  //customizzare l'alert
//  alert("Clip guida caricata con successo");
//     //riaggiorna la pagina
//     location.reload();
// });


}

function uploadVideo(video, metadata) {
  var file = new File([video], "abc");

  var data = new FormData();
  data.append("toUpload", file);

  axios({
    url: "http://lily.cs.unibo.it/file-upload",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    data: data
  }).then( function(result) {
    console.log(result);
  }).catch( function(error) {
    console.log(error);
  });

  var auth = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

  var meta = new Blob([JSON.stringify(metadata)], { type: 'application/json' });

  var form = new FormData();
  form.append('data', meta);
  form.append('video', video);

  console.log(metadata);

  cloudinary.config({
    cloud_name: 'do5uz0yci',
    api_key: '286293616516234',
    api_secret: 'YwQupMjENrxhtCxWEkBTzHllzMI'
  });

  console.log('ciao');

  // console.log(video);
  // console.log(gapi.auth2.getAuthInstance().isSignedIn.get());

  // $.ajax({
  //  url: 'https://www.googleapis.com/upload/youtube/v3/videos?access_token='
  //  + encodeURIComponent(auth) + '&part=snippet,status',
  //  data: form,
  //  cache: false,
  //  contentType: false,
  //  processData: false,
  //  method: 'POST',
  //  success: () => alert('upload effettuato con successo'),
  //  error: (err)=> alert(err)
  // });
};

//////////////////////////////////////////////////////////////////////////
// Handler edit clip
function editClip() {
 // $('#start').click(function(){
  var startTime = $('audio').get(0).currentTime;
  console.log(cur_time);
  var stopTime = $('audio').get(0).currentTime;

        //$('[name="limited_sound"]').attr('data-start_time', cur_time);
        //$('[name="select_start_time"]').text((cur_time/100).toFixed(2));
  //});
  // $('[name="end_time"]').click(function(){
  //       var cur_time = $('[name="sound"]').get(0).currentTime.toFixed(2);
  //       $('[name="limited_sound"]').attr('data-end_time', cur_time);
  //       $('[name="select_end_time"]').text((cur_time/100).toFixed(2));
  // });
}

//var player;

/*
function recordVideo() {
  var options = {
    controls: true,
    width: 320,
    height: 240,
    fluid: false,
    plugins: {
      record: {
        audio: true,
        video: true,
        debug: true
      }
    }
  };
  // apply some workarounds for opera browser
  applyVideoWorkaround();

  player = videojs('myVideo', options, function() {
    // print version information at startup
    videojs.log('Using video.js ' + videojs.VERSION +
      ' with videojs-record ' + videojs.getPluginVersion('record') +
      ' and recordrtc ' + RecordRTC.version);
  });

  // error handling
  player.on('deviceError', function() {
    console.log('device error:', player.deviceErrorCode);
  });

  player.on('error', function(element, error) {
    console.error(error);
  });
  // user clicked the record button and started recording
  player.on('startRecord', function() {
    console.log('started recording!');
  });
  // user completed recording and stream is available
  player.on('finishRecord', function() {
    // the blob object contains the recorded data that
    // can be downloaded by the user, stored on server etc.
    console.log('finished recording: ', player.recordedData);
  });
}
*/

// function whichPage() {
//  if (gapi.auth2.getAuthInstance().isSignedIn.get())
//    window.location.replace("editor.html")
//  else
//    window.location.replace("log.html")
// }



//     // Store a reference of the preview video element and a global reference to the recorder instance
//     var video = document.getElementById('my-preview');
//     var recorder;

//  // When the user clicks on start video recording
//  document.getElementById('btn-start-recording').addEventListener("click", function(){
//  // Disable start recording button
//  this.disabled = true;

//  // Request access to the media devices
//  navigator.mediaDevices.getUserMedia({
//    audio: true,
//    video: true
//  }).then(function(stream) {
//  // Display a live preview on the video element of the page
//  setSrcObject(stream, video);

//  // Start to display the preview on the video element
//  // and mute the video to disable the echo issue !
//  video.play();
//  video.muted = true;

//  // Initialize the recorder
//  recorder = new RecordRTCPromisesHandler(stream, {
//    mimeType: 'video/webm',
//    bitsPerSecond: 128000
//  });

//  // Start recording the video
//  recorder.startRecording().then(function() {
//    console.info('Recording video ...');
//  }).catch(function(error) {
//    console.error('Cannot start video recording: ', error);
//  });

//  // release stream on stopRecording
//  recorder.stream = stream;

//  // Enable stop recording button
//  document.getElementById('btn-stop-recording').disabled = false;
// }).catch(function(error) {
//  console.error("Cannot access media devices: ", error);
// });
// }, false);

//  // When the user clicks on Stop video recording
//  document.getElementById('btn-stop-recording').addEventListener("click", function(){
//    this.disabled = true;

//    recorder.stopRecording().then(function() {
//      console.info('stopRecording success');

//  // Retrieve recorded video as blob and display in the preview element
//  var blob = recorder.getBlob();
//  video.src = URL.createObjectURL(blob);
//  video.play();

//  // Unmute video on preview
//  video.muted = false;

//  // Stop the device streaming
//  recorder.stream.stop();

//  // Enable record button again !
//  document.getElementById('btn-start-recording').disabled = false;
// }).catch(function(error) {
//  console.error('stopRecording failure', error);
// });
// }, false);



// function to upload a video,
// param:

// uploadVideo(video, metadata, function(data) {
//  //customizzare l'alert
//  alert("Clip guida caricata con successo");
//     //riaggiorna la pagina
//     location.reload();
// });
// }
