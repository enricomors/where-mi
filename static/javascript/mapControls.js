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
var actualId;
var actualPlace;
var counter;

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
  if (idYT.length != 0) {
    idYT.forEach((item) => {
      if (datiVideo[item].purpose == 'what') {
        places.push({
          "name": datiVideo[item].name,
          "id": item
        });
      }
      });
    counter = 1;
    actualId = places[counter].id;
    actualPlace = places[counter].name;
    console.log('playng ', actualId);
    console.log('place ', actualPlace);
    player.loadVideoById(actualId);
    visitedPlaces.push(actualPlace);
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
  //il contatore viene riportato a 1 per gestire la profondita del more
  contatore=1;
  if ((counter + 1) < places.length) {
    counter++;
    while (actualPlace == places[counter].name ||
      visitedPlaces.includes(places[counter].name)) {
      counter++;
    }
    actualId = places[counter].id;
    actualPlace = places[counter].name;
    console.log('playng ', actualId);
    console.log('place ', actualPlace);
    player.loadVideoById(actualId);
    visitedPlaces.push(actualPlace);
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
var contatore=1;
/** Listener per click su bottone more */
$('#moreButton').on('click', moreFunction);
function moreFunction(){
  for (const clip in datiVideo) {

    if(contatore==1){ //how
        if (datiVideo[clip].name==actualPlace && datiVideo[clip].purpose=="how"){
          console.log(datiVideo[clip].name);
          console.log(clip);
          player.loadVideoById(clip);
          contatore++;
          break;
        }
      }else if(contatore==2){
        if(datiVideo[clip].name==actualPlace && datiVideo[clip].purpose=="why" && datiVideo[clip].detail=="1" ){
          console.log(datiVideo[clip].name);
          console.log(clip);
          player.loadVideoById(clip);
          contatore++;
          break;
        }
    }else{
      console.log("nessuna clip trovata");
    }
}
}
