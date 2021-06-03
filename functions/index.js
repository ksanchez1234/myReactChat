//This cloud function will run every time a new document (message) is created by a user.
//It will check for profanity and ban users (if need be).
const functions = require('firebase-functions');
const Filter = require('bad-words');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

//Getting access to the messages in Firestore to check them for bad words.
exports.detectEvilUsers = functions.firestore
       .document('messages/{msgId}')
       .onCreate(async (doc) => {

        const filter = new Filter();
        const { text, uid } = doc.data(); 


        //If there was profanity - users will be banned from the App
        if (filter.isProfane(text)) {

            const cleaned = filter.clean(text);
            await doc.ref.update({text: `I got BANNED for saying... ${cleaned}`});

            await db.collection('banned').doc(uid).set({});
        } 

        const userRef = db.collection('users').doc(uid)

        const userData = (await userRef.get()).data();

        if (userData.msgCount >= 7) {
            await db.collection('banned').doc(uid).set({});
        } else {
            await userRef.set({ msgCount: (userData.msgCount || 0) + 1 })
        }

});