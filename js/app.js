import { auth, db } from "./firebase-config.js";

import {
GoogleAuthProvider,
signInWithPopup
}
from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
collection,
addDoc,
query,
orderBy,
onSnapshot,
doc,
getDoc,
setDoc
}
from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const provider = new GoogleAuthProvider();

const loginBtn =
document.getElementById("loginBtn");

const appBox =
document.getElementById("app");

const loginBox =
document.getElementById("loginBox");

let currentUser = null;

loginBtn.onclick = async () => {

const result =
await signInWithPopup(auth, provider);

currentUser = result.user;

document.getElementById("username").innerText =
currentUser.displayName;

document.getElementById("avatar").src =
currentUser.photoURL;

loginBox.style.display = "none";

appBox.style.display = "block";

loadCoin();

loadMessages();

};

async function loadCoin(){

const ref = doc(db,"users",currentUser.uid);

const snap = await getDoc(ref);

if(!snap.exists()){

await setDoc(ref,{
coin:0
});

document.getElementById("coin").innerText = 0;

return;
}

document.getElementById("coin").innerText =
snap.data().coin;

}

document.getElementById("claimCoin")
.onclick = async ()=>{

const ref = doc(db,"users",currentUser.uid);

const snap = await getDoc(ref);

let coin = snap.data().coin || 0;

coin += 100;

await setDoc(ref,{
coin:coin
});

document.getElementById("coin").innerText =
coin;

alert("+100 Coin");
};

document.getElementById("sendBtn")
.onclick = async ()=>{

const text =
document.getElementById("messageInput").value;

if(text.trim()==="") return;

await addDoc(
collection(db,"messages"),
{
name:currentUser.displayName,
text:text,
time:Date.now()
}
);

document.getElementById("messageInput").value="";
};

function loadMessages(){

const q = query(
collection(db,"messages"),
orderBy("time")
);

onSnapshot(q,(snapshot)=>{

const messages =
document.getElementById("messages");

messages.innerHTML = "";

snapshot.forEach((doc)=>{

const data = doc.data();

const mine =
data.name === currentUser.displayName;

messages.innerHTML += `

<div class="
message
${mine ? 'mine' : ''}
">

<b>${data.name}</b><br>
${data.text}

</div>

`;

});

messages.scrollTop =
messages.scrollHeight;

});

}
