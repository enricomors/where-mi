/** Clip di youtube */
var idYT = [];
var datiVideo;
var markerClip;

$('#searchButton').on('click', loadYTVideos);

function loadYTVideos() {
    // Remove all the clip elements
	$("#clips").empty();
	//
	if (idYT.length > 0) {
		idYT.forEach((item) => {
			map.removeLayer(markerClip[item]);
		});
	}
	markerClip = {};
	idYT = [];
	// inizializza datiVideo come oggetto vuoto
	datiVideo = {};
    // Inizializzo tale variabile per creare le sottostringhe di olc per le distanze
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
        // salva la risposta nell'array results
        var results = resp.result.items;
        console.log('trovati ' + results.length + ' risultati');
		console.log(resp.result.items);
        // se la ricerca produce risultati
        if (results.length > 0) {
            // scorre le risorse contenute nella risposta
            for (var i = 0; i < results.length; i++) {
				// definizione variabili per ciascuna clip
				let name, olc, purpose, language, category, audience, detail, descrizione;
				let idVideo, idPrev, idNext, coords;
				let metaDati = results[i].snippet.description;
				// recupera id del video
				idVideo = results[i].id.videoId;
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
				// 8FPH0000+:8FPHF800+:8FPHF8VP+7R:what:ita:art:elm:2.
                if (metaDati.split(":")[1].indexOf("+") != -1) {
					console.log('olc multipli separati da :', results[i]);
					// title
					name = results[i].snippet.title;
					// geolocation
					olc = results[i].snippet.description.split(":")[2];
					coords = OpenLocationCode.decode(olc);
					// metadata
					purpose = results[i].snippet.description.split(":")[3];
					language = results[i].snippet.description.split(":")[4];
					category = results[i].snippet.description.split(":")[5];
					audience = results[i].snippet.description.split(":")[6];
					detail = results[i].snippet.description.split(":")[7];
					descrizione = "Not specified";
				} else {
					// titolo del video
					let title = results[i].snippet.title; 
					// olc nel titolo separato da ":"
					if (title.indexOf(":") != -1) {
						name = title.split(":")[0];
					} else {
						name = title.split('#')[0]; // #wheremiguide
					}
					// separa la descrizione della clip dai restanti metadati
					if (metaDati.indexOf("#") != -1) {
						descrizione = metaDati.split("#")[1];
						metaDati = metaDati.split("#")[0];
					} else if (metaDati.indexOf("%%%") != -1) {
						descrizione = metaDati.split("%%%")[1];
						metaDati = metaDati.split("%%%")[0];
					} else if (!descrizione){
						descrizione = "Not specified";
					}
					// estrae gli OLC nei metadati del video
					let olcString = metaDati.split(":")[0];
					// estrae l'OLC esatto per posizionare il marker
					if (olcString.indexOf('-') != -1) {
						olc = olcString.split('-')[2];	
					} else {
						// caso in cui viene usato un solo OLC
						olc = olcString;
					}
					try {
						// ricava le coordinate della clip dall'olc
						coords = OpenLocationCode.decode(olc);
					} catch (IllegalArgumentException) {
						console.log('using current olc ' + currentOlc + ' for ' + results[i]);
						coords = OpenLocationCode.decode(currentOlc);
					}
					purpose = metaDati.split(":")[1];
					language = metaDati.split(":")[2];
					category = metaDati.split(":")[3];
					// audience
					audience = metaDati.split(":")[4];
					if (!audience) {
						audience = "Not specified";
					} else if (audience.indexOf("A") != -1) {
						if (audience.indexOf('+') != -1) {
							audience = audience.substring(2);	
						} else {
							audience = audience.substring(1);
						}
					}
					// detail level
					detail = metaDati.split(":")[5];
					if (!detail) {
						detail = "Not specified";
					} else if (detail.indexOf("P") != -1) {
						if (detail.indexOf('+') != -1) {
							detail = detail.substring(2);
						} else {
							detail = detail.substring(1);
						}
					}
				}
				name = name.toUpperCase();
				// dati della clip
				let dati = {
					"name": name,
					"purpose": purpose,
					"language": language,
					"category": category,
					"audience": audience,
					"detail": detail,
					"descrizione": descrizione,
				};
				datiVideo[idVideo] = dati;
				// crea popup per il marker della clip
				let popup =
				`<div id="${idVideo}popup" style="text-align: center;">
				<h5 class="text-uppercase" style="margin-top: 2%;">${name}</h5>
				<hr align="center">
				<a id="${idVideo}link" class="btn" style="color: #04af73;" href="#${idVideo}card">Listen to audio clip!</a>
				</div>`;
				// crea marker nelle posizioni delle clips
				var marker = new L.marker([coords.latitudeCenter, coords.longitudeCenter], { myCustomId: idVideo + "map" })
					.bindPopup(popup).addTo(map).on('click', routing);
				// aggiunge il marker alla lista dei marker
				markerClip[idVideo] = marker;
				// aggiunge le card delle clip nella sezione #clips
				document.getElementById("clipList").innerHTML = "Clip List";
				$('#clips').append(
					`<!-- Start: Clip Cards -->
					<article id="${idVideo}card" class="col-sm-4 col-md-4 col-lg-3" style="margin-bottom: 2%;">
					<div class="card cards-shadown cards-hover" style="height: 35rem;">

					<!-- CARD HEADER-->
					<div id="${idVideo}header" class="card-header text-left" style="background-color: #04af73;width: 100%;height: 100%;">
						<span class="space"><a id="${idVideo}map" class="btn btn-secondary btn-sm" href="#map" style="color: white;">View on the map</i></a></span>
						<div class="cardheader-text" style="color: white;">
						<h4 id="heading-card" style="font-size: 18px;margin-top: 7%;">${name}</h4>
						<p id="cardheader-subtext" style="font-size: 16px"><i>Purpose:&nbsp</i><span class="text-uppercase">${purpose}</span></p>
						</div>
					</div>

					<!-- CARD BODY-->
					<div class="card-body" style="color:black;">
						<ul class="list-group text-left">
							<li class="list-group-item"><span><i><b>Language:&nbsp</b></i>${language}</span></li>
							<li class="list-group-item"><span><i><b>Category:&nbsp</b></i>${category}</span></li>
							<li class="list-group-item"><span><i><b>Audience:&nbsp</b></i>${audience}</span></li>
							<li class="list-group-item" style="height: 5rem; overflow: auto;"><span><i><b>Description:&nbsp</b></i>${descrizione}</span></li>
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

/** Filtra le clip di YouTube da visualizzare per lingua*/
function filterLanguage(selectedItem) {
    idYT.forEach((item) => {
		if ((
			 datiVideo[item].language != selectedItem.value
            )) {
            // nasconde la card della clip
            $('#'+item+'card').hide();
            map.removeLayer(markerClip[item]);
            console.log("nascosto" + item + " " + selectedItem.value);
        } else {
            // mostra la card della clip
            $('#'+item+'card').show();
            markerClip[item].addTo(map);
        }
    });
};
 /** Filtra le clip di YouTube da visualizzare per audience */
function filterAudience(selectedItem) {
    idYT.forEach((item) => {
		if ((
			 datiVideo[item].audience != selectedItem.value
            )) {
            // nasconde la card della clip
            $('#'+item+'card').hide();
            map.removeLayer(markerClip[item]);
            console.log("nascosto" + item + " " + selectedItem.value);
        } else {
            // mostra la card della clip
            $('#'+item+'card').show();
            markerClip[item].addTo(map);
        }
    });
};

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
};
