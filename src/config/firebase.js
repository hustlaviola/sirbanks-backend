import * as admin from 'firebase-admin';
import serviceAccount from '../../sirbanks-taxi-firebase-adminsdk-ode93-301e358e36.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://sirbanks-taxi.firebaseio.com'
});

export default admin;
