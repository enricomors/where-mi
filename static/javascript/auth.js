/** Carica l'api key dalle variabili d'ambiente */
const API_KEY = process.env.MY_API_KEY;

/** Carica l'API di YouTube */
function onClientLoad() {
    gapi.client.setApiKey(API_KEY);
    gapi.client.load('youtube', 'v3', () => {
        console.log('client loaded');
    });
};
