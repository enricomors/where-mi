/** La costante port indica la porta su cui il server deve restare in ascolto (8000 perché richiesta da Gocker) */
const port = process.env.PORT || 8000;

/** Modulo express */
const express = require('express');

/** Modulo body parser, effettua parsing del body delle richieste */
const bodyParser = require('body-parser');

/** Modulo path, fornisce utilities per lavorare con percorsi di file e cartelle */
const path = require('path');

/** Dotenv is a zero-dependency module that loads environment variables from a .env file 
 * into process.env. Storing configuration in the environment separate from code is based 
 * on The Twelve-Factor App methodology.
 */
require('dotenv').config();

/** Chiama la funzione "express()" per creare una nuova applicazione Express, assegnata alla variabile "app" */
const app = express();

/** app.use carica una funzione da utilizzare come middleware
 * express.static() prende un path in input e ritorna un middleware che fornisce accesso a tutti i file in quel path
 * serve tutti i file nella cartella 'static', e permette di accedervi attraverso il path '/static'
 */
app.use('/static', express.static(path.join(__dirname, 'static')));

/** */
app.use(bodyParser.json({ limit: '500mb' }));

/** */
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

/** */
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods", 
        "POST, PUT, OPTIONS, DELETE, GET");
	res.header(
        "Access-Control-Allow-Headers", 
        "Orgin, X-Requested-With, Content-Type, Accept");
	// passa al prossimo middleware
	next();
});

/**
 * app.get() permette di gestire le richieste GET in entrata. Vengono intercettate tutte le richieste e ridirezionate in base all'URL
 */
app.get('/*', (req,res) => {
    if (req.path == '/') {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
    else if (req.path == '/browser.html' || req.path == '/browser') {
      res.sendFile(path.join(__dirname, 'browser.html'));
    }
    else if (req.path == '/editor.html' || req.path == '/editor' ) {
      res.sendFile(path.join(__dirname, 'editor.html')); 
    } else {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
});

/** Resta in ascolto per richieste sulla porta 8000 */
app.listen(port, () => {
    console.log(`Running on port ${port}`);
})
