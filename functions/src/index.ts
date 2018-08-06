import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// import { request } from 'https';

admin.initializeApp(functions.config().firebase); // config for firebase.

// // Start writing Firebase Functions
// https://us-central1-feedlyapp-a4d0b.cloudfunctions.net/helloWorld
// firebase deploy --only functions 
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// cloud function for updating the Likes & Likes Count.
// https://us-central1-feedlyapp-a4d0b.cloudfunctions.net/updateLikesCount
export const updateLikesCount = functions.https.onRequest((request, response) => {

    console.log(request.body);

    const postId = request.body.postId;
    const userId = request.body.userId;
    const action = request.body.action; // 'like' or 'unlike'
    admin.firestore().collection("posts").doc(postId).get().then((data) => {

        let likesCount = data.data().likesCount || 0;
        let likes = data.data().likes || [];

        let updateData = {};

        if(action == "like"){
            updateData["likesCount"] = ++likesCount;
            updateData[`likes.${userId}`] = true;
        } else {
            updateData["likesCount"] = --likesCount;
            updateData[`likes.${userId}`] = false;
        }

        admin.firestore().collection("posts").doc(postId).update(updateData).then(() => {
            response.status(200).send("Done")
        }).catch((err) => {
            response.status(err.code).send(err.message);
        })

    }).catch((err) => {
        response.status(err.code).send(err.message);
    })

})