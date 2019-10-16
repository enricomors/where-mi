// versione dello script browser.js di Ale

const access_token = 'pk.eyJ1Ijoic3VzdGF6IiwiYSI6ImNrMWphcDk1MzB4aWwzbnBjb2N5NDZ0bG4ifQ.ijWf_bZClD4nTcL91sBueg';

var markerPosizioneAttuale;
var circlePosizioneAttuale;
var markerSearch;
var circleSearch;

var markerDraggable;
var circleDraggable;
var currentPosition;
var currentOlc;

var routingControl = null;

/** Clip di youtube */
var idYT = [];
var datiVideo = {};

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
var map = L.map('map').fitWorld();

/** Tile layer per la mappa */
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: access_token
}).addTo(map);

/** Richiede al browser la posizione attuale e chiama displayLocation in caso di successo */
navigator.geolocation.getCurrentPosition(displayLocation);
//Controllo su posizione non trovata
//TODO:aggiungere popup per inserire manualmente la posizione
if(!navigator.geolocation){
    alert("Inserisci posizione manualmente");
}
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
   
    markerPosizioneAttuale.bindPopup(`<div style="text-align: center;">
		<h6 class="text-uppercase" style="margin-top: 2%;">You are here</h6>
        <hr align="center">If location is incorrect, drag the marker
        <hr align="center"><button onclick="loadYTVideos()" id="searchButton" type="button"
        class="btn btn-success">Search clips</button>
        </div>`).openPopup();
    markerPosizioneAttuale.addTo(map);
    
}

function loadYTVideos() {
    // Crea query string x YouTube con i primi 6 caratteri dell'OLC
    var queryString = currentOlc.substring(0, 5);
    console.log(queryString);
    /** Ricerca i video di YouTube in base all'API key */
    var req = gapi.client.youtube.search.list({
        part: 'snippet',
        type: 'video',
        q: queryString,
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
            console.log(idVideo);
            // inserisce id del video in idYT
            idYT.push(idVideo);
            // estrare i uno per uno i metadati dalla stringa
            let olc = metaDati.split(":")[0];
            let purpose = metaDati.split(":")[1];
            let language = metaDati.split(":")[2];
            let category = metaDati.split(":")[3];
            let audience = metaDati.split(":")[4];
            let detail = metaDati.split(":")[5];
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
            var marker = L.marker([coords.latitudeCenter, coords.longitudeCenter], { myCustomId: idVideo + "map" })
                .bindPopup(popup).addTo(map).on('click', routing);
            // aggiunge le card delle clip nella sezione #clips
            $('#clips').append(
                `<!-- Start: Clip Cards -->
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
};

/** Funzionalità di Routing */
function routing() {
    // se presente, rimuove la casella di controllo del routing dalla mappa
    if (routingControl != null) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    // restitusce le coordinate del marker cliccato
    coordDest = this.getLatLng();
    // opzioni per il router leaflet: indicazioni a piedi, lingua italiana
    let options = { profile: 'mapbox/walking', language: 'it' };
    // inizializza nuovo routing control
    routingControl = L.Routing.control({
        waypoints: [currentPosition, coordDest],
        showAlternatives: 'false',
        router: new L.Routing.mapbox(access_token, options)
    }).addTo(map);
    
};

function filter() {
    
};

function filterClips() {
    
};

// set the popup information: latlng and address
function addPopup(marker) {
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
