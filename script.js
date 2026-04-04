const firebaseConfig = {
    apiKey: "AIzaSyBCtAu5W-S48pICmS9H0k7mKLiJpNKHSoQ",
    authDomain: "finansas-ib.firebaseapp.com",
    projectId: "finansas-ib",
    storageBucket: "finansas-ib.firebasestorage.app",
    messagingSenderId: "699584425602",
    appId: "1:699584425602:web:0d793337469fbf02b00e9b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let currentUser = "";

function selectProfile(name) {
    currentUser = name;
    document.getElementById('user-display').innerText = "Hola, " + name;
    document.getElementById('profile-selection').classList.add('hidden');
    document.getElementById('main-dashboard').classList.remove('hidden');
    escucharMovimientos();
}

function showTab(tab) {
    document.getElementById('main-dashboard').classList.toggle('hidden', tab === 'add');
    document.getElementById('tab-add').classList.toggle('hidden', tab === 'home');
}

function addEntry(type) {
    const amount = parseFloat(document.getElementById('amount').value);
    const desc = document.getElementById('desc').value;
    const cat = document.getElementById('cat').value;

    if (!amount || !desc) return alert("¡Completá los datos!");

    db.collection("movimientos").add({
        amount: amount,
        desc: desc,
        cat: cat,
        type: type,
        perfil: currentUser,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        document.getElementById('amount').value = "";
        document.getElementById('desc').value = "";
        showTab('home');
    });
}

function escucharMovimientos() {
    db.collection("movimientos")
        .where("perfil", "==", currentUser)
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
            const list = document.getElementById('history-list');
            let total = 0;
            list.innerHTML = "";
            
            snapshot.forEach((doc) => {
                const res = doc.data();
                const id = doc.id;
                const isIngreso = res.type === 'ingreso';
                total += isIngreso ? res.amount : -res.amount;

                list.innerHTML += `
                    <div class="card ${res.type}">
                        <div class="flex-between">
                            <div>
                                <strong>${res.desc}</strong><br>
                                <small style="color:#aaa">${res.cat}</small>
                            </div>
                            <div style="text-align:right">
                                <div style="font-weight:bold; color:${isIngreso?'#00b894':'#ff7675'}">
                                    $${res.amount.toLocaleString()}
                                </div>
                                <button class="btn-delete" onclick="borrarDato('${id}')">Borrar</button>
                            </div>
                        </div>
                    </div>`;
            });
            document.getElementById('net-balance').innerText = "$" + total.toLocaleString();
        });
}

window.borrarDato = function(id) {
    if (confirm("¿Borrar este registro?")) {
        db.collection("movimientos").doc(id).delete();
    }
};

function logout() { location.reload(); }
