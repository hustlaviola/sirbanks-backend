import admin from 'firebase-admin';
import serviceAccount from '../../sirbanks-taxi-firebase-adminsdk-ode93-301e358e36.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://sirbanks-taxi.firebaseio.com'
});

// const message = {
//     notification: {
//         title: 'Testing uncle Taiwos brain',
//         body: 'You here sound?'
//     },
//     android: {
//         notification: {
//             sound: 'default',
//             timeToLive: 60 * 60 * 24
//         }
//     },
//     token: deviceToken
// };
// admin.messaging()
//     .send(message).then(response => {
//         console.log('Notification sent successfully', response);
//     })
//     .catch(error => {
//         console.log(error);
//     });

export default admin;
