import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

exports.deleteUser = functions.https.onCall(uid => {
    return admin.auth().deleteUser(uid)
        .then(function(userRecord) {
            console.log('Successfully deleted user:', uid);
            return uid;
        })
        .catch((error) => {
            throw new functions.https.HttpsError('internal', error.message)
        });
});
