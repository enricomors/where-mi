const API_KEY = 'AIzaSyB4Jh2e86uK5pBGSXCT-I6K__jmHpjEvw8';

/** Carica l'API di YouTube */
function onClientLoad() {
    gapi.client.setApiKey(API_KEY);
    gapi.client.load('youtube', 'v3', () => {
        console.log('client loaded');
    });
};
