import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as moment from 'moment';

exports.pushNotification = functions.https.onCall((data) => {
    let message;
    switch(data.status){
        case 'cancelled':
            message = `Se cancelo la consulta del día ${moment(data.start).locale('es').format('ddd DD MMM')} a las ${data.hourStart}`
            break;

        case 'requestByPatient':
        case 'requestByDoctor':
            message = `Tienes una consulta por confirmar del día ${moment(data.start).locale('es').format('ddd DD MMM')} a las ${data.hourStart}`
            break;

        case 'approved':
            message = `La consulta está confirmada del día ${moment(data.start).locale('es').format('ddd DD MMM')} a las ${data.hourStart}`
            break;
    }


    const payload = {
        notification: {
            title: message,
            body: message
        }
    };

    for(const token of data.tokens){
        admin.messaging().sendToDevice(token, payload)
            .then(resp => {
                console.log('SUCCESS ', resp);
                return resp;

            })
            .catch(err => {
                console.log('ERROR ', err)
                return err;
            });
    }
});
