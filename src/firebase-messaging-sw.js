importScripts('https://www.gstatic.com/firebasejs/7.18.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.18.0/firebase-messaging.js');

firebase.initializeApp({
    apiKey: 'AIzaSyD1RntUaS60yYJIWSVayKmOSfcROhKeqfc',
    authDomain: 'apptli-397cb.firebaseapp.com',
    databaseURL: 'https://apptli-397cb.firebaseio.com',
    projectId: 'apptli-397cb',
    storageBucket: 'apptli-397cb.appspot.com',
    messagingSenderId: '431566778438',
    appId: '1:431566778438:web:f42969a4257fe63b6ada47',
    measurementId: 'G-KPJ3EN8LZT'
});
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = 'Background Message Title';
    const notificationOptions = {
        body: 'Background Message body.',
        icon: '/assets/images/logo.png'
    };

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});
