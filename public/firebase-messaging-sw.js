importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// These values are from your firebase-applet-config.json
firebase.initializeApp({
  apiKey: "AIzaSyDBQoJSWPlWZn-y9DRtGW0qZpXUdYxScTM",
  authDomain: "gen-lang-client-0425003032.firebaseapp.com",
  projectId: "gen-lang-client-0425003032",
  storageBucket: "gen-lang-client-0425003032.firebasestorage.app",
  messagingSenderId: "479682659083",
  appId: "1:479682659083:web:9e59e2c3f2528f5291580e"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://detricon-messenger.vercel.app/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
