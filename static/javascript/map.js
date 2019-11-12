/** Token per l'accesso alle API di Mapbox (indicazioni) */
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3VzdGF6IiwiYSI6ImNrMWphcDk1MzB4aWwzbnBjb2N5NDZ0bG4ifQ.ijWf_bZClD4nTcL91sBueg';
/** Coordinate di Default per la mappa */
const DEFAULT_COORDS = [44.493671, 11.343035];

var markerPosizioneAttuale;
var currentPosition;
var currentOlc;

var routingControl = null;

/** Marker verde */
var greenIcon = new L.Icon({
  iconUrl: './static/images/marker-icon-green.png',
  shadowUrl: './static/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/** Inizializza la mappa Leaflet */
var map = L.map('map', { zoomControl: false });

/** Tile layer per la mappa */
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: MAPBOX_TOKEN
}).addTo(map);

/** Aggiunge alla mappa casella di ricerca per gli indirizzi */
var searchControl = L.esri.Geocoding.geosearch({
    useMapBounds: 'false',
    placeholder: 'Cerca un indirizzo'
}).addTo(map);

// aggiunge alla mappa la selezione del livello di distanza
var legend = L.control({ position: 'topright' });
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = '<label>Distance level</label><br><select id="distanceLevel"><option value="sm">Small</option><option value="wd">Wide</option></select>';
    div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
legend.addTo(map);

/** Mostra sulla mappa il risultato scelto e rimuove i marker presenti */
var results = L.layerGroup().addTo(map);
searchControl.on('results', function (data) {
    // rimuove il marker della posizione attuale se presente
    if (markerPosizioneAttuale) {
        map.removeLayer(markerPosizioneAttuale);
    }
    results.clearLayers();
    for (var i = data.results.length - 1; i >= 0; i--) {
        updateMarker(data.results[i].latlng.lat, data.results[i].latlng.lng);
        updatePosition(data.results[i].latlng.lat, data.results[i].latlng.lng);
    }
});

/** Richiede al browser la posizione attuale e chiama displayLocation in caso di successo */
navigator.geolocation.getCurrentPosition(displayLocation);

/** Mostra sulla mappa la posizione ricevuta dal browser */
function displayLocation(position) {
  // apre la mappa sulla posizione ricevuta dal browser
  map.setView([position.coords.latitude, position.coords.longitude], 15);
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
    const newLat = e.target._latlng.lat;
    const newLng = e.target._latlng.lng;
    updatePosition(newLat, newLng);
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

/** Modifica la posizione attuale al doppio click sulla mappa */
function onMapDoubleClick(e) {
  // rimuove il marker della posizione attuale se già presente
  if (markerPosizioneAttuale) {
      map.removeLayer(markerPosizioneAttuale);
  }
  updateMarker(e.latlng.lat, e.latlng.lng);
  updatePosition(e.latlng.lat, e.latlng.lng);
}

/** Gestione del doppio click sulla mappa */
map.on('dblclick', onMapDoubleClick);

/** Se l'utente clicca sulla mappa, rimuovi le indicazioni */
function onMapClick(e) {
  // se presente, rimuove la casella di controllo del routing dalla mappa
  if (routingControl != null) {
       map.removeControl(routingControl);
       routingControl = null;
   }
}

/** Gestione del click singolo sulla mappa */
map.on('click', onMapClick);

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
