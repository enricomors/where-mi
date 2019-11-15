/** Clip di youtube */
var idYT = [];
var datiVideo = {};

function loadYTVideos() {
  $("#clips").empty();
    var queryString;
    //Acquisisce il livello di distanza scelto tra i filtri
    var zoom = document.getElementById('distanceLevel').value;
    console.log("this is the zoom value" + " " + zoom);
    // Crea query string x YouTube
    if (zoom == 'sm') {
        queryString = currentOlc.substring(0, 8);
    } else if (zoom == 'wd') {
        queryString = currentOlc.substring(0, 6) + '00';
    }
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
        console.log(results.length);
        // se la ricerca produce risultati
        if (results.length > 0) {
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
                let metaDati = results[i].snippet.description;
                let idVideo = results[i].id.videoId;
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
                // estrae gli OLC nei metadati del video
                let olcString = metaDati.split(":")[0];
                // estrae l'OLC esatto per posizionare il marker
                let olc = olcString.split('-')[2];                
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
                // metadati aggiuntivi
                let descrizione = metaDati.split("#")[1];
                let openingHour = metaDati.split("#")[2];
                let closingHour = metaDati.split("#")[3];
                // dati della clip
                let dati = {
                    "purpose": purpose,
                    "language": language,
                    "category": category,
                    "audience": audience,
                    "detail": detail,
                    "descrizione": descrizione,
                    "openingHour": openingHour,
                    "closingHour": closingHour
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
                    <span class="space"><a id="${idVideo}map" class="btn btn-secondary btn-sm" href="#map" style="color: white;">Find on the map</i></a></span>
                    <div class="cardheader-text" style="color: white;">
                    <h4 id="heading-card" style="font-size: 18px;margin-top: 7%;">${name}</h4>
                    <p id="cardheader-subtext" style="font-size: 16px"><i>Purpose:&nbsp</i><span class="text-uppercase"> ${purpose}</span></p>
                    </div>
                    </div>

                    <!-- CARD BODY-->
                    <div class="card-body" style="color:black;">
                    <ul class="list-group text-left">
                    <li class="list-group-item"><span><i><b>Language:&nbsp</b></i>${language}</span></li>
                    <li class="list-group-item"><span><i><b>Category:&nbsp</b></i>${category}</span></li>
                    <li class="list-group-item"><span><i><b>Audience:&nbsp</b></i>${audience}</span></li>
                    <li class="list-group-item" style="height: 5rem; overflow: auto;"><span><i><b>Description:&nbsp</b></i>${descrizione}<p>Opening Hour:</p>${openingHour}<p>CosingHour:</p>${closingHour}</span></li>
                    </ul>

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
        } else {
            alert("Nella zona non sono presenti clip");
        }
    });
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

//utile solo per l'opzione why
purpose.addEventListener('click',() => {

  if(document.getElementById('purpose').value=="Why"){
      document.getElementById("detailLevel").disabled = false;

    }else {
      document.getElementById("detailLevel").disabled = true;
    }
});

/** Abilita/Disabilita i filtri delle clip */
function filterClips() {
    if ($('#filterTrigger').is(':checked')) {
        // disabilita gli elementi select
        $('.disabled').prop('disabled', true);
        $('.custom-control-label').text('Enable filters');
    } else {
        $('.disabled').prop('disabled', false);
        $('.custom-control-label').text('Disable filters');
    }
    filter();
};