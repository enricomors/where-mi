/** Api key per la presentazione */
const API_KEY = '[INSERT_YOUR_API_KEY_HERE]';

/** Carica l'API di YouTube */
function onClientLoad() {
    var isSecureOrigin = location.protocol === 'https:' || location.host.includes('localhost');
    if (!isSecureOrigin) {
        location.protocol = 'HTTPS';
        console.log("Passo a HTTPS!");
    }
    gapi.client.setApiKey(API_KEY);
    gapi.client.load('youtube', 'v3', () => {
        console.log('client loaded');
    });
};
