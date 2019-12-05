/** Html per il controllo ricerca delle clip */
const SEARCH_CONTROL = `<label for="distanceLevel">Distance level</label>
<select class="form-control form-control" id="distanceLevel">
<option value="sm">Small</option>
<option value="wd">Wide</option>
</select>
<button id="searchButton" type="button" class="btn btn-success btn-map">Search clips</button>`;

/** Html per i controlli delle clip */
const USER_CONTROLS = `<button id="wmiButton" type="button" class="btn btn-success btn-map" disabled>WhereMI</button>
<button id="moreButton" type="button" class="btn btn-success btn-map" disabled>More</button>
<button id="nextButton" type="button" class="btn btn-success btn-map" disabled>Next</button>`;

var places = [];
var visitedPlaces = [];
var moreOnPlace = [];
var actualId;
var actualPlace;
var countNext;

// countMore per il more
var countMore;

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

/** Listener per click su bottone wheremi */
$('#wmiButton').on('click', wheremi);

/** Riproduce la prima clip trovata sul luogo */
function wheremi() {
  places = [];
  if (idYT.length != 0) {
    idYT.forEach((item) => {
      if (datiVideo[item].purpose == 'what') {
        places.push({
          "name": datiVideo[item].name,
          "id": item
        });
      }
    });
    if (places.length == 0) {
      alert('Non ci sono clip "what" nella zona');
    }
    countNext = 0;
    actualId = places[countNext].id;
    actualPlace = places[countNext].name;
    console.log('playng ', actualId);
    console.log('place ', actualPlace);
    player.loadVideoById(actualId);
    visitedPlaces.push(actualPlace);
    moreOnPlace = [];
    countMore = 0;
    for (const clip in datiVideo) {
      if (datiVideo[clip].name == actualPlace && (datiVideo[clip].purpose == "how" || datiVideo[clip].purpose == "how")) {
        moreOnPlace.push(clip);
      } 
    }
    // Abilita i pulsanti more e next solo dopo aver richiamato whereMi
    $('#moreButton').prop('disabled',false);
    $('#nextButton').prop ('disabled',false);
  } else {
    alert('Non ci sono clip da riprodurre');
  }
}

/** listener per evento di click su pulsante next */
$('#nextButton').on('click', nextPlace);

/** Changes the location */
function nextPlace() {
  
  if ((countNext + 1) < places.length) {
    countNext++;
    while (actualPlace == places[countNext].name ||
      visitedPlaces.includes(places[countNext].name)) {
      countNext++;
    }
    actualId = places[countNext].id;
    actualPlace = places[countNext].name;
    console.log('playng ', actualId);
    console.log('place ', actualPlace);
    player.loadVideoById(actualId);
    visitedPlaces.push(actualPlace);
    moreOnPlace = [];
    //il countMore viene riportato a 1 per gestire la profondita del more
    countMore = 0;
    for (const clip in datiVideo) {
      if (datiVideo[clip].name == actualPlace && (datiVideo[clip].purpose == "how" || datiVideo[clip].purpose == "why")) {
        moreOnPlace.push(clip);
      } 
    }
  } else {
    alert('Hai visitato tutti i luoghi della zona');
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

/** Listener per click su bottone more */
$('#moreButton').on('click', moreFunction);

/** Funzionalità more */
function moreFunction() {
  console.log("more clips: ");
  console.log(moreOnPlace);
  
  if (moreOnPlace.length == 0) {
    alert('Nessuna clip trovata');
  } else {
    if (countMore < moreOnPlace.length) {
      var id = moreOnPlace[countMore];
      console.log('playng ', id);
      console.log('place ', actualPlace);
      player.loadVideoById(id);
      countMore++;
    } else {
      alert("Non ci sono più clip per questo luogo");
    }
  }
}
