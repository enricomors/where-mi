/** Html per il controllo ricerca delle clip */
const SEARCH_CONTROL = `<label for="distanceLevel">Distance level</label>
<select class="form-control form-control" id="distanceLevel">
<option value="sm">Small</option>
<option value="wd">Wide</option>
</select>
<button id="searchButton" type="button" class="btn btn-success btn-map">Search clips</button>`;

/** Html per i controlli delle clip */
const USER_CONTROLS = `<button id="wmiButton" type="button" class="btn btn-success btn-map">WhereMI</button>
<button id="moreButton" type="button" class="btn btn-success btn-map">More</button>
<button id="nextButton" type="button" class="btn btn-success btn-map">Next</button>`;

/** aggiunge alla mappa la selezione del livello di distanza */
var searchClips = L.control({ position: 'topright' });
searchClips.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'custom-control');
    div.innerHTML = SEARCH_CONTROL;
    div.onmousedown = div.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
searchClips.addTo(map);

/** Aggiunge alla mappa i pulsanti more e next */
var userControls = L.control({ position: 'bottomleft'});
userControls.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'custom-control');
  div.innerHTML = USER_CONTROLS;
  div.onmousedown = div.ondblclick = L.DomEvent.stopPropagation;
  return div;
};
userControls.addTo(map);

$('#wmiButton').on('click', wheremi);

function wheremi() {
  if (!isEmpty(datiVideo)) {
    var places = []; 
    idYT.forEach((id) => {
      places.push(datiVideo[id].name);
    });
    var id = idYT[1];
    console.log('PLAY', id);
    player.loadVideoById(id);
  } else {
    alert('Non ci sono clip da riprodurre');
  }
}

/** Controlla se l'oggetto obj è vuoto */
function isEmpty(obj) {
  for(var key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
}