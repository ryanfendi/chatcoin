import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {

apiKey: "AIzaSyCuCna7gPGu1vUuw-wiF7CoOG6LEN-d_7k",

authDomain: "chatcoine.firebaseapp.com",

projectId: "chatcoine",

storageBucket: "chatcoine.firebasestorage.app",

messagingSenderId: "6497828415",

appId: "1:6497828415:web:9dbc5c7f78dc61ca41428a"

};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
