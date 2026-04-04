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
let currentUser = "", transactions = [], totalAhorrado = 0, currentSaldoNeto = 0, myChart = null;
let unsubMov, unsubAhorro, unsubHist;

function selectProfile(name) {
    currentUser = name;
    document.getElementById('user-display').innerText = "Hola, " + name;
    document.getElementById('profile-selection').classList.add('hidden');
    document.getElementById('main-dashboard').classList.remove('hidden');
    
    // Escuchar Movimientos del Mes
    unsubMov = db.collection("movimientos").where("perfil", "==", currentUser).orderBy("timestamp", "desc").onSnapshot(snap => {
        transactions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateUI();
    });

    // Escuchar Caja de Ahorro
    unsubAhorro = db.collection("ahorros").doc(currentUser).onSnapshot(doc => {
        totalAhorrado = doc.exists ? doc.data().total : 0;
        document.getElementById('total-saved-big').innerText = "$" + totalAhorrado.toLocaleString();
    });

    // Escuchar Historial de Meses
    unsubHist = db.collection("historial_cierres").where("perfil", "==", currentUser).orderBy("timestamp", "desc").onSnapshot(snap => {
        const list = document.getElementById('calendar-list');
        list.innerHTML = "";
        snap.forEach(doc => {
            const d = doc.data();
            list.innerHTML += `<div class="month-card flex-between">
                <span><strong>${d.mes} ${d.año}</strong></span>
                <span style="color:var(--green)">+$${d.monto_final.toLocaleString()}</span>
            </div>`;
        });
    });
}

function showTab(t) {
    document.querySelectorAll('.tab-content').forEach(x => x.classList.add('hidden'));
    document.getElementById('tab-' + t).classList.remove('hidden');
    if(t === 'stats') updateChart();
}

function addEntry(type) {
    const amount = parseFloat(document.getElementById('amount').value);
    const desc = document.getElementById('desc').value;
    const cat = document.getElementById('cat').value;
    if (!amount || !desc) return alert("Completá los datos");

    db.collection("movimientos").add({
        amount, desc, cat, type, perfil: currentUser,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        document.getElementById('amount').value = "";
        document.getElementById('desc').value = "";
        showTab('home');
    });
}

function updateUI() {
    const list = document.getElementById('history-list');
    list.innerHTML = "";
    let inc = 0, exp = 0;
    transactions.forEach(t => {
        if (t.type === 'ingreso') inc += t.amount; else exp += t.amount;
        list.innerHTML += `<div class="card ${t.type} flex-between">
            <div><strong>${t.desc}</strong><br><small>${t.cat}</small></div>
            <div style="text-align:right">
                <div style="font-weight:bold">$${t.amount.toLocaleString()}</div>
                <button class="btn-delete" onclick="borrarDato('${t.id}')">Borrar</button>
            </div>
        </div>`;
    });
    currentSaldoNeto = inc - exp;
    document.getElementById('net-balance').innerText = "$" + currentSaldoNeto.toLocaleString();
}

function updateChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    const totals = {};
    transactions.filter(t => t.type === 'gasto').forEach(t => totals[t.cat] = (totals[t.cat] || 0) + t.amount);
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: Object.keys(totals), datasets: [{ data: Object.values(totals), backgroundColor: ['#6c5ce7', '#00b894', '#fd79a8', '#fab1a0'] }] }
    });
}

window.transferBalanceToSavings = function() {
    if (currentSaldoNeto <= 0) return alert("No hay saldo para ahorrar.");
    const mes = new Date().toLocaleString('es-AR', { month: 'long' });
    if (confirm(`¿Cerrar mes y archivar $${currentSaldoNeto}?`)) {
        db.collection("historial_cierres").add({ perfil: currentUser, mes, año: 2026, monto_final: currentSaldoNeto, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        db.collection("ahorros").doc(currentUser).set({ total: totalAhorrado + currentSaldoNeto });
        transactions.forEach(t => db.collection("movimientos").doc(t.id).delete());
    }
};

window.borrarDato = id => { if(confirm("¿Borrar?")) db.collection("movimientos").doc(id).delete(); };
function logout() { location.reload(); }
