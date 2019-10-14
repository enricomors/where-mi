const API_KEY = 'AIzaSyAFrXgyA4uIMddd3xxiipVvNEcDL2MM4Lw';

/** Carica l'API di YouTube */
function onClientLoad() {
    gapi.client.setApiKey(API_KEY);
    gapi.client.load('youtube', 'v3', () => {
        console.log('client loaded');
    });
};
