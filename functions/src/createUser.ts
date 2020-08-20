import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

const createUser = functions.https.onCall((data) => {
    return admin.auth().createUser(data)
        .then(function(userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log('Successfully created new user:', userRecord.uid);
        })
        .catch((error) => {
            throw new functions.https.HttpsError('internal', error.message)
        });
});

export default createUser;
