/** Mapbox token */
const leaflet_access_token = 'pk.eyJ1Ijoic3VzdGF6IiwiYSI6ImNrMWphcDk1MzB4aWwzbnBjb2N5NDZ0bG4ifQ.ijWf_bZClD4nTcL91sBueg';
/** Coordinate di default */
const default_coords = [44.4940258,11.340965];

/** Icone per i marker */
var blueIcon = L.icon({
    iconUrl: '/blue-icon.png',
	iconSize: [25, 40],
	iconAnchor: [12, 40],
	popupAnchor: [1, -35],
});
var redIcon = L.icon({
    iconUrl: '/red-icon.png',
	iconSize: [25, 40],
	iconAnchor: [12, 40],
	popupAnchor: [1, -35],
});

/** Mostra nuovo marker sulla mappa */
var newPoint = L.marker();

var currPosition;
var selectedPoint;
var tappa;
var myPosition;
var routingControl = null;

/** Clip di youtube */
var idYT = [];
var datiVideo = {};

/** Quando il DOM è pronto ad eseguire il codice js */
$(document).ready(() => {
    // Inizializza la mappa
    mapInit(default_coords);
    // mostra le card per le clip
    showCards();
});

/** Inizializza la mappa leaflet */
function mapInit(coords) {
    /** Crea nuova mappa Setta le coordinate di default e il livello di zoom */
    map = L.map('map').map.setView(coords, 14);
    /** Setta il tileLayer */
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
 		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery Â© <a href="https://www.mapbox.com/">Mapbox</a>',
 		maxZoom: 22,
 		id: 'mapbox.streets',
 		accessToken: leaflet_access_token
    }).addTo(map);
    /** Richiesta location */
    getLocation();
};

/** Aggiorna la mappa con le coordinate ricevute dal browser */
function updateMap(coords) {
    if (currPosition) {
        currPosition.remove();
    }
    lat = coords.latitude;
    lng = coords.longitude;
    /** Setta la mappa sulle nuove coordinate */
    map.setView([lat, lng], 14);
    /** Marker della posizone corrente */
    currPosition = L.marker([lat, lng], { draggable: 'true' });
    currPosition.setIcon(redIcon);
    /** Crea il popup per il marker */
    currPosition.bindPopup(
        `<div style="text-align: center;">
		<h6 class="text-uppercase" style="margin-top: 2%;">You are here</h6>
		<hr align="center">If location is incorrect, drag the marker</a>
        </div>`).openPopup();
    /** Aggiunge il marker alla mappa */
    currPosition.addTo(map);
    currPosition.on('click', onMarkerClick);
};

/** Gestisce l'evento di click su marker esistente */
function onMarkerClick(marker) {
    newPoint.remove();
    if (selectedPoint) {
        selectedPoint.setIcon(blueIcon);
    }
    selectedPoint = marker.target;
    selectedPoint.setIcon(redIcon);
}

/** Ottiene la posizione attuale */
function getLocation() {
    navigator.geolocation.getCurrentPosition(
        pos => updateMap(pos.coords)
    );
};

function showCards() {

    gapi.client.load('youtube', 'v3', () => {
        // richiesta ricerca clip
        var req = gapi.client.youtube.search.list({
            part: 'snippet',
            type: 'video',
            q: '8FPHF9Q5+J4',
            maxResults: 50,
            order: 'title'
        });
        // esegue la richiesta
        req.execute((resp) => {
            console.log(resp);
            // scorre le risorse contenute nella risposta
            resp.result.items.forEach((item) => {
                // estrae i dati del video
                let name = item.snippet.title.split(":")[0];
                let metaDati = item.snippet.description.split("#")[0];
                let description = item.snippet.description.split("#")[1];
                let idVideo = item.id.videoId;
                // inserisce id del video in idYT
                idYT.push(idVideo);
                // estrare i uno per uno i metadati dalla stringa
                let olc = metaDati.split(":")[0];
                let purpose = metadati.split(":")[1];
            	let language = metadati.split(":")[2];
                let category = metadati.split(":")[3];
                let audience = metadati.split(":")[4];
                let detail = metadati.split(":")[5];
                // ricava le coordinate della clip dall'olc
                let coords = OpenLocationCode.decode(olc);
                let dati = {
                    "purpose": purpose,
                    "language": language,
                    "category": category,
                    "audience": audience,
                    "detail": detail
                };
                datiVideo[idVideo] = dati;
                // crea popup per il marker della clip 
                let popup = 
                `<div id="${idVideo}popup" style="text-align: center;">
                <h5 class="text-uppercase" style="margin-top: 2%;">${name}</h5>
                <hr align="center">
                <a id="${idVideo}link" class="btn" style="color: #fed136;" href="#${idVideo}card">Vai alla clip!</a>
                </div>`;
                // crea marker nelle posizioni delle clips
                var marker = L.marker([coords.latitudeCenter, coords.longitudeCenter], { myCustomId: idVideo + "map" });
                // aggiunge il marker alla mappa
                marker.bindPopup(popup).addTo(map);
                // click listener per il marker
                marker.on('click', routing);
                // carica player API per il video player
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/player_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                // aggiunge le card delle clip nella sezione #clips
                $('#clips').append(
                    `<!-- Start: Animation Cards -->
                    <article id="${idVideo}card" class="col-sm-4 col-md-4 col-lg-3" style="margin-bottom: 2%;">
                    <div class="card cards-shadown cards-hover" style="height: 35rem;">

                    <!-- CARD HEADER-->
                    <div class="card-header text-left" style="background-color: #fed136;width: 100%;height: 100%;"><span class="space"><a id="${idVideo}map" href="#map"><i class="fa fa-map" id="download-icon"></i></a></span>
                    <div class="cardheader-text">
                    <h4 id="heading-card" style="font-size: 26px;margin-top: 7%;">${name}</h4>
                    <p id="cardheader-subtext"><i>Purpose:&nbsp</i><span class="text-uppercase"> ${purpose}</span></p>
                    </div>
                    </div>

                    <!-- CARD BODY-->
                    <div class="card-body" style="color:black;">
                    <ul class="list-group text-left">
                    <li class="list-group-item"><span><i><b>Language:&nbsp</b></i> ${language}</span></li>
                    <li class="list-group-item"><span><i><b>Category:&nbsp</b></i> ${category}</span></li>
                    <li class="list-group-item"><span><i><b>Audience:&nbsp</b></i> ${audience}</span></li>
                    <li class="list-group-item" style="height: 5rem; overflow: auto;"><span><i><b>Description:&nbsp</b></i> ${description}</span></li>
                    </ul>
                    </div>

                    <!-- CARD FOOTER-->
                    <div class="card-footer text-center">
                    <button class="previous btn">
                    <i class="fa fa-backward" id="previous" style="font-size: 30px;"></i>
                    </button>
                    <button id="${idVideo}" class="btn">
                    <i class="fa fa-play-circle" style="font-size: 30px;padding-right: 5%;"></i>
                    </button>
                    <button class="pause btn">
                    <i class="fa fa-pause-circle" style="font-size: 30px;"></i>
                    </button>
                    <button class="next btn">
                    <i class="fa fa-forward" id="next" style="font-size: 30px;"></i>
                    </button>
                    </div>
                    </div>
                    <!-- End: Animation Cards -->

                    <script>
                    $("#${idVideo}map").click(function(){
                        $.each(map._layers, function(i, item){
                            if(this.options.myCustomId == "${idVideo}map"){
                                this.openPopup();
                                map.flyTo(this._latlng)
                            }
                        });
                    });

                    $("#${idVideo}").click(function(){ 
                        player.loadVideoById(this.id);
                    });

                    $(".pause").click(function(){
                        player.pauseVideo();
                    });

                    $(".previous").click(function() {
                        console.log("previous");
                        player.previousVideo();
                        player.playVideo();
                    });

                    $(".next").click(function() {
                        console.log("next");
                        player.nextVideo();
                        player.playVideo();
                    });
                    </script>
                    </article>`
                );
            });
        });
    });
    
};

/** Funzione di navigazione */
function routing() {
    
}

function filer() {
    
}

function filerClips() {
    
}


/**
 * FORMATO RISPOSTA di gapi.client.youtube.search.list
 * {
  "kind": "youtube#searchResult",
  "etag": etag,
  "id": {
    "kind": string,
    "videoId": string,
    "channelId": string,
    "playlistId": string
  },
  "snippet": {
    "publishedAt": datetime,
    "channelId": string,
    "title": string,
    "description": string,
    "thumbnails": {
      (key): {
        "url": string,
        "width": unsigned integer,
        "height": unsigned integer
      }
    },
    "channelTitle": string,
    "liveBroadcastContent": string
  }
 */