/** Token per l'accesso alle API di Mapbox (Indicazioni) */
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3VzdGF6IiwiYSI6ImNrMWphcDk1MzB4aWwzbnBjb2N5NDZ0bG4ifQ.ijWf_bZClD4nTcL91sBueg';
/** Coordinate di Default per la mappa */
const DEFAULT_COORDS = [44.493671, 11.343035];
/** Codice per il popup del marker */
const POPUP = `<div style="text-align: center;">
<h6 class="text-uppercase" style="margin-top: 2%;">You are here</h6>
<hr align="center">
If location is incorrect, drag the marker or use search control on left side of the map
<hr align="center"><button onclick="loadYTVideos()" id="searchButton" type="button"
class="btn btn-success">Search clips</button>
</div>`;

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
var map = L.map('map').setView(DEFAULT_COORDS, 15);

/** Tile layer per la mappa */
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: MAPBOX_TOKEN
}).addTo(map);

/** Aggiunge alla mappa casella di ricerca per gli indirizzi */
var searchControl = L.esri.Geocoding.geosearch().addTo(map);

/** Mostra sulla mappa il risultato scelto e rimuove i marker presenti */
var results = L.layerGroup().addTo(map);
searchControl.on('results', function (data) {
    // rimuove il marker della posizione attuale se presente
    if (markerPosizioneAttuale) {
        map.removeLayer(markerPosizioneAttuale);
    }
    for (let i = data.results.length - 1; i >= 0; i--) {
        console.log(data.results[i].latlng);
        updateMarker(data.results[i].latlng.lat, data.results[i].latlng.lng);
        updatePosition(data.results[i].latlng.lat, data.results[i].latlng.lng);
    }
})

/** Richiede al browser la posizione attuale e chiama displayLocation in caso di successo */
navigator.geolocation.getCurrentPosition(displayLocation);

//Controllo su posizione non trovata
//TODO:aggiungere popup per inserire manualmente la posizione
if(!navigator.geolocation){
    alert("Inserisci posizione manualmente");
}

/** Mostra sulla mappa la posizione ricevuta dal browser */
function displayLocation(position) {
    // apre la mappa sulla posizione ricevuta dal browser
    map.setView([lat, lng], 18);
    // aggiorna marker
    updateMarker(position.coords.latitude, position.coords.longitude);
    //aggiorna posizione
    updatePosition(position.coords.latitude, position.coords.longitude);
}

/** Aggiorna la posizione del marker sulla mappa in base alle coordinate */
function updateMarker(lat, lng) {
    // crea marker per la posizione attuale con popup
    markerPosizioneAttuale = L.marker([lat, lng], { draggable: 'true'});
    markerPosizioneAttuale.on('dragend', function (e) {
        updatePosition(e.latlng.lat, e.latlng.lng);
    });
    markerPosizioneAttuale.setIcon(greenIcon);
    // popup associato il nuovo marker
    markerPosizioneAttuale.bindPopup(POPUP).openPopup();
    // aggiunge il marker alla mappa
    markerPosizioneAttuale.addTo(map);
}

/** Aggiorna posizione attuale e calcola OLC */
function updatePosition(lat, lng) {
    // aggiorna posizione corrente
    currentPosition = [lat, lng];
    // aggiorna olc posizione corrente
    currentOlc = OpenLocationCode.encode(lat, lng);
    console.log(currentOlc);
}

/** Se l'utente clicca sulla mappa, rimuovi le indicazioni */
function onMapClick(e) {
   // se presente, rimuove la casella di controllo del routing dalla mappa
   if (routingControl != null) {
        map.removeControl(routingControl);
        routingControl = null;
    }
}

/** Modifica la posizione attuale al doppio click sulla mappa */
function onMapDoubleClick(e) {
    // se presente, rimuove la casella di controllo del routing dalla mappa
    if (routingControl != null) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    // rimuove il marker della posizione attuale se già presente
    if (markerPosizioneAttuale) {
        map.removeLayer(markerPosizioneAttuale);
    }
    updateMarker(e.latlng.lat, e.latlng.lng);
    updatePosition(e.latlng.lat, e.latlng.lng);
}

/** Gestione del doppio click sulla mappa */
map.on('dblclick', onMapDoubleClick);
/** Gestione del click singolo sulla mappa */
map.on('click', onMapClick);

function loadYTVideos() {
  $("#clips").empty();
    // Crea query string x YouTube
    var queryString = currentOlc.substring(0, 8);
    console.log(queryString);
    /** Ricerca i video di YouTube in base all'API key */
    var req = gapi.client.youtube.search.list({
        part: 'snippet',
        type: 'video',
        q: queryString,
        maxResults: 50
    });
    // esegue la richiesta
    req.execute((resp) => {
        console.log(resp);
        // salva la risposta nell'array results
        var results = resp.result.items;
        console.log(results);
        // scorre le risorse contenute nella risposta
        for (var i = 0; i < results.length; i++) {
            let name;
            // titolo del video
            if (results[i].snippet.title.indexOf(':') != -1) {
                name = results[i].snippet.title.split(':')[0];
            } else {
                name = results[i].snippet.title;
            }
            // estrae i dati dell'i-esimo video
            let metaDati = results[i].snippet.description.split("#")[0];
            let description = results[i].snippet.description.split("#")[1];
            let idVideo = results[i].id.videoId;
            console.log(idVideo);
            let idPrev;
            let idNext;
            // ricava id del video precedente
            if (i == 0) {
                // per il primo video, l'id precedente è quello dell'ultimo video
                idPrev = results[results.length - 1].id.videoId;
            } else {
                idPrev = results[i - 1].id.videoId;
            }
            // ricava id del video successivo
            if (i == (results.length - 1)) {
                // per ultimo video, l'id successivo è quello del primo video
                idNext = results[0].id.videoId;
            } else {
                idNext = results[i + 1].id.videoId;
            }
            // inserisce id del video in idYT
            idYT.push(idVideo);
            // estrare i uno per uno i metadati dalla stringa
            let olc = metaDati.split(":")[0];
            // variabile per le coordinate della clip
            let coords;
            try {
                // ricava le coordinate della clip dall'olc
                coords = OpenLocationCode.decode(olc);
            } catch (IllegalArgumentException) {
                coords = OpenLocationCode.decode(currentOlc);
            }
            let purpose = metaDati.split(":")[1];
            let language = metaDati.split(":")[2];
            let category = metaDati.split(":")[3];
            let audience = metaDati.split(":")[4];
            let detail = metaDati.split(":")[5];
            let descrizione= metaDati.split(":")[6];
            // dati della clip
            let dati = {
                "purpose": purpose,
                "language": language,
                "category": category,
                "audience": audience,
                "detail": detail,
                "descrizione": descrizione
            };
            datiVideo[idVideo] = dati;
            // crea popup per il marker della clip
            let popup =
            `<div id="${idVideo}popup" style="text-align: center;">
            <h5 class="text-uppercase" style="margin-top: 2%;">${name}</h5>
            <hr align="center">
            <a id="${idVideo}link" class="btn" style="color: #04af73;" href="#${idVideo}card">Vai alla clip!</a>
            </div>`;
            // crea marker nelle posizioni delle clips
            var marker = new L.marker([coords.latitudeCenter, coords.longitudeCenter], { myCustomId: idVideo + "map" })
                .bindPopup(popup).addTo(map).on('click', routing);
            // aggiunge le card delle clip nella sezione #clips
            $('#clips').append(
                `<!-- Start: Clip Cards -->
                <article id="${idVideo}card" class="col-sm-4 col-md-4 col-lg-3" style="margin-bottom: 2%;">
                <div class="card cards-shadown cards-hover" style="height: 35rem;">

                <!-- CARD HEADER-->
                <div id="${idVideo}header" class="card-header text-left" style="background-color: #04af73;width: 100%;height: 100%;">
                <span class="space"><a id="${idVideo}map" class="btn" href="#map" style="color: white;">Vedi sulla mappa</i></a></span>
                <div class="cardheader-text" style="color: white;">
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
                <li class="list-group-item" style="height: 5rem; overflow: auto;"><span><i><b>Description:&nbsp</b></i> ${descrizione}</span></li>
                </ul>
                </div>

                <!-- CARD FOOTER-->
                <div class="card-footer text-center">
                <button id="${idPrev}" class="btn-previous">
                <i class="fa fa-backward" id="previous" style="font-size: 30px;"></i>
                </button>
                <button id="${idVideo}" class="btn-play">
                <i class="fa fa-play-circle" style="font-size: 30px;padding-right: 5%;"></i>
                </button>
                <button class="btn-pause">
                <i class="fa fa-pause-circle" style="font-size: 30px;"></i>
                </button>
                <button id="${idNext}" class="btn-next">
                <i class="fa fa-forward" id="next" style="font-size: 30px;"></i>
                </button>
                </div>
                </div>
                <!-- End: Clip Cards -->

                <script>
                $("#${idVideo}map").click(function(){
                    $.each(map._layers, function(i, item){
                        if(this.options.myCustomId == "${idVideo}map"){
                            this.openPopup();
                            map.flyTo(this._latlng)
                        }
                    });
                });

                $(".btn-play").click(function(){
                    player.loadVideoById(this.id);
                    console.log(this.id);
                    player.playVideo();
                    // aggiornamento UI
                    console.log("#"+this.id+"header");
                    $("#"+this.id+"header").css("background-color","#006633");
                });

                $(".btn-pause").click(function(){
                    player.pauseVideo();
                });

                $(".btn-next").click(function(){
                    player.clearVideo();
                    player.loadVideoById(this.id);
                    player.playVideo();
                    // aggiornamento UI
                    $("#"+this.id+"header").css("background-color","#006633");
                });

                $(".btn-previous").click(function(){
                    player.clearVideo();
                    player.loadVideoById(this.id);
                    player.playVideo();
                    // aggiornamento UI
                    $("#"+this.id+"header").css("background-color","#006633");
                });

                </script>
                </article>`
            );
        }
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
        router: new L.Routing.mapbox(MAPBOX_TOKEN, options)
    }).addTo(map);
};

/** Filtra le clip di YouTube da visualizzare */
function filter() {
    idYT.forEach((item) => {
        if (!$('#filterTrigger').is(':checked') && (datiVideo[item].purpose != $('#purpose').val()
            || datiVideo[item].language != $('#language').val()
            || datiVideo[item].audience != $('#audience').val()
            || datiVideo[item].category != $('#category').val()
            || datiVideo[item].detail != $('#detailLevel').val()
        )) {
            $('#'+item+'card').hide();
        } else {
            $('#'+item+'card').show();
        }
    });
};

/** Abilita/Disabilita i filtri delle clip */
function filterClips() {
    if ($('#filterTrigger').is(':checked')) {
        // disabilita gli elementi select
        $('.custom-select').prop('disabled', true);
        $('.custom-control-label').text('Enable filters');
    } else {
        $('.custom-select').prop('disabled', false);
        $('.custom-control-label').text('Disable filters');
    }
    filter();
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
