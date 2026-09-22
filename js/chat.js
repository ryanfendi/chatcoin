import { auth, db } from "./firebase-config.js";

import {
collection,
getDocs,
addDoc,
query,
onSnapshot,
orderBy,
doc,
setDoc,
getDoc
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

    await updateMyStatus(true);

    loadUsers();

});

async function updateMyStatus(online){

    await setDoc(
        doc(db,"users",currentUser.uid),
        {
            name: currentUser.displayName,
            email: currentUser.email,
            photo: currentUser.photoURL,
            online: online,
            lastSeen: Date.now()
        },
        { merge:true }
    );

}

window.addEventListener("beforeunload", async ()=>{

    if(!currentUser) return;

    await updateMyStatus(false);

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

        let statusText = "";

        if(data.online){
            statusText = "🟢 Online";
        }else{
            statusText =
            "Terakhir aktif " +
            timeAgo(data.lastSeen || Date.now());
        }

        div.innerHTML = `
            <b>${data.name || "Pengguna"}</b>
            <br>
            <small>${statusText}</small>
        `;

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
    ).innerHTML = `
        <div>
            <b>${name}</b>
            <div id="userStatus">
                Memuat...
            </div>
        </div>
    `;

    currentRoom =
    [currentUser.uid,uid]
    .sort()
    .join("_");

    listenMessages();

    listenUserStatus(uid);

}

function listenUserStatus(uid){

    onSnapshot(
        doc(db,"users",uid),
        (snapshot)=>{

            if(!snapshot.exists()) return;

            const data =
            snapshot.data();

            const status =
            document.getElementById(
            "userStatus"
            );

            if(!status) return;

            if(data.online){

                status.innerHTML =
                "🟢 Online";

            }else{

                status.innerHTML =
                "Terakhir aktif " +
                timeAgo(
                    data.lastSeen
                );

            }

        }
    );

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

        messages.scrollTop =
        messages.scrollHeight;

    });

}

document
.getElementById("sendBtn")
.onclick = async ()=>{

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
            sender: currentUser.uid,
            text: text,
            time: Date.now()
        }

    );

    document.getElementById(
    "messageInput"
    ).value="";

};

function timeAgo(timestamp){

    if(!timestamp)
        return "baru saja";

    const seconds =
    Math.floor(
        (Date.now()-timestamp)/1000
    );

    if(seconds < 60)
        return "baru saja";

    if(seconds < 3600)
        return Math.floor(seconds/60)
        + " menit lalu";

    if(seconds < 86400)
        return Math.floor(seconds/3600)
        + " jam lalu";

    return Math.floor(seconds/86400)
    + " hari lalu";

}
