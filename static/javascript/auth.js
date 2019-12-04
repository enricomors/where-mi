const API_KEY = 'AIzaSyB4Jh2e86uK5pBGSXCT-I6K__jmHpjEvw8'; // thomas
// const API_KEY = 'AIzaSyAW1OR0F6fAiplBctRnWRC37VKYjKr9z-I'; // e.morselli97@gmail.com

/** Api key per la presentazione */
// const API_KEY = 'AIzaSyAFrXgyA4uIMddd3xxiipVvNEcDL2MM4Lw'; // wheremiguide@gmail.com

/** Carica l'API di YouTube */
function onClientLoad() {
    gapi.client.setApiKey(API_KEY);
    gapi.client.load('youtube', 'v3', () => {
        console.log('client loaded');
    });
};
