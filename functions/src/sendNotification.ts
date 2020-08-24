import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

exports.sendNotification = functions.firestore
    .document('schedule/{uid}')
    .onCreate((snapshot, context) => {
        const users = snapshot.data().users;

        const payload = {
            notification: {
                title: 'Se registro una nueva consulta.',
                body: 'Se registro una nueva consulta.'
            }
        };

        users.forEach((user: any) => {
            console.log('user', user);
            const user$ = admin.firestore()
                .doc(`users/${user}`);

            user$.get()
                .then( snapshot1 => {
                    // @ts-ignore
                    const token = snapshot1.get('token');

                    if(token){
                        admin.messaging().sendToDevice(token, payload)
                            .then(data => {
                                console.log('SUCCESS ', data);
                                return data;

                            })
                            .catch(err => {
                                console.log('ERROR ', err)
                                return err;
                            });
                    }
                     return 'no token';
                })
                .catch(err => {
                    console.log('ERROR 1', err)
                    return 'can get user data of '+user;
                });
        });
    });
