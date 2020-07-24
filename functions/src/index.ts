import * as functions from 'firebase-functions';
//importar express y cors
import * as express from 'express';
import * as cors from 'cors';
//Importar el firebase admin para conectar mi app

import * as admin from 'firebase-admin';

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://firestore-grafica-2e08a.firebaseio.com"
})

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
 export const helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", {structuredData: true});
    response.json("hola mundo desde funciones !");
 });

 export const getGoty = functions.https.onRequest(async (request, response) => {
   
        const gotyRef = db.collection('goty');
        const docSnap = await gotyRef.get();
        const juegos = docSnap.docs.map( doc=>doc.data() );

        response.json( juegos );

 });

 //Express

 const app = express();

 app.use( cors({origin : true}) );

 app.get('/goty', async(req, res)=>{

    const gotyRef = db.collection('goty');
    const docSnap = await gotyRef.get();
    const juegos = docSnap.docs.map( doc=>doc.data() );

    res.json( juegos );
 });

 app.post('/goty/:id', async(req, res)=>{

    const id = req.params.id;
    const gameRef = db.collection('goty').doc( id );
    const gameSnap = await gameRef.get();

    if( !gameSnap.exists ){
        res.status(404).json({
            ok :'false',
            message :'No existe el juego con el id'+id
        });
    }else{
        
        const before = gameSnap.data() || {votos:0};
        await gameRef.update({
            votos : before.votos + 1
        });

        res.json({
            ok :true,
            message:  `Gracias por votar por ${before.name} `
        });

    }

 });

export const api = functions.https.onRequest( app );