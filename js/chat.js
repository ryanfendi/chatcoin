import { auth, db } from "./firebase-config.js";

import {
collection,
getDocs,
addDoc,
query,
where,
onSnapshot,
orderBy
}
from
"https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

let currentUser = null;
let selectedUser = null;
let currentRoom = null;

auth.onAuthStateChanged(async(user)=>{

if(!user){
location.href="index.html";
return;
}

currentUser = user;

loadUsers();

});

async function loadUsers(){

const snapshot =
await getDocs(collection(db,"users"));

const userList =
document.getElementById("userList");

userList.innerHTML="";

snapshot.forEach(docu=>{

const data = docu.data();

if(docu.id===currentUser.uid) return;

const div =
document.createElement("div");

div.className="user";

div.innerText =
data.name || "Pengguna";

div.onclick=()=>{
openChat(docu.id,data.name);
};

userList.appendChild(div);

});

}

async function openChat(uid,name){

selectedUser = uid;

document.getElementById(
"chatHeader"
).innerText=name;

currentRoom =
[currentUser.uid,uid]
.sort()
.join("_");

listenMessages();

}

function listenMessages(){

const q =
query(
collection(
db,
"rooms",
currentRoom,
"messages"
),
orderBy("time")
);

onSnapshot(q,(snapshot)=>{

const messages =
document.getElementById("messages");

messages.innerHTML="";

snapshot.forEach(docu=>{

const data =
docu.data();

const div =
document.createElement("div");

div.className =
data.sender===currentUser.uid
? "message mine"
: "message";

div.innerHTML =
data.text;

messages.appendChild(div);

});

messages.scrollTop=
messages.scrollHeight;

});

}

document
.getElementById("sendBtn")
.onclick=async()=>{

if(!currentRoom) return;

const text =
document.getElementById(
"messageInput"
).value;

if(text.trim()==="") return;

await addDoc(

collection(
db,
"rooms",
currentRoom,
"messages"
),

{
sender:currentUser.uid,
text:text,
time:Date.now()
}

);

document.getElementById(
"messageInput"
).value="";

};
