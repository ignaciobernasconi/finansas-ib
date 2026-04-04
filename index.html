<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finansas IB</title>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>
    
    <style>
        /* CSS DEFINITIVO - NO MODIFICAR */
        :root {
            --bg: #121212; --card: #1e1e1e; --purple: #6c5ce7; 
            --green: #00b894; --red: #d63031; --text: #ffffff; --gray: #aaa;
        }
        body { 
            font-family: 'Segoe UI', sans-serif; background-color: var(--bg); color: var(--text); 
            margin: 0; padding: 15px; display: flex; flex-direction: column; align-items: center; 
        }
        .container { width: 100%; max-width: 450px; }
        .card { 
            background: var(--card); padding: 20px; border-radius: 15px; 
            margin-bottom: 15px; border-left: 6px solid var(--purple); 
            box-shadow: 0 4px 10px rgba(0,0,0,0.5); text-align: center;
        }
        .ingreso { border-left-color: var(--green); }
        .gasto { border-left-color: var(--red); }
        button { 
            width: 100%; padding: 15px; margin: 8px 0; border-radius: 10px; 
            border: none; font-weight: bold; font-size: 1rem; cursor: pointer; color: white;
        }
        input, select { 
            width: 100%; padding: 12px; margin: 8px 0; border-radius: 8px; 
            background: #252525; color: white; border: 1px solid #333; box-sizing: border-box;
        }
        .hidden { display: none; }
        .flex-row { display: flex; gap: 10px; }
        .btn-delete { 
            width: auto; padding: 6px 12px; background: transparent; 
            color: var(--red); border: 1px solid var(--red); font-size: 0.8rem;
        }
        .item-list { text-align: left; background: #252525; padding: 10px; border-radius: 10px; margin-bottom: 10px; }
    </style>
</head>
<body>

<div class="container">
    <div id="profile-selection">
        <h1 style="text-align:center">Finansas IB</h1>
        <button onclick="selectProfile('Ignacio')" style="background:var(--purple)">Ignacio</button>
        <button onclick="selectProfile('Claudia')" style="background:#fd79a8">Claudia</button>
    </div>

    <div id="main-dashboard" class="hidden">
        <div style="display:flex; justify-content: space-between; align-items:center; margin-bottom:15px">
            <h2 id="user-display" style="margin:0"></h2>
            <button onclick="logout()" style="width:auto; background:#333; padding:5px 15px; margin:0">Salir</button>
        </div>

        <div class="flex-row">
            <button onclick="showTab('home')" style="background:#444">Home</button>
            <button onclick="showTab('stats')" style="background:#444">Stats</button>
            <button onclick="showTab('calendar')" style="background:#444">Meses</button>
        </div>

        <div id="tab-home">
            <div class="card">
                <small>Saldo Disponible</small>
                <h1 id="net-balance" style="color:var(--green); margin:10px 0">$0</h1>
                <hr style="border:0; border-top:1px solid #333; margin:10px 0">
                <small>Ahorro Acumulado</small>
                <h2 id="total-saved-big" style="color:var(--purple); margin:5px 0">$0</h2>
            </div>
            <button onclick="showTab('add')" style="background:var(--green)">+ NUEVO MOVIMIENTO</button>
            <button onclick="transferBalanceToSavings()" style="background:var(--purple)">CERRAR MES (AHORRAR)</button>
            <h3>Historial</h3>
            <div id="history-list"></div>
        </div>

        <div id="tab-stats" class="hidden">
            <h3>Distribución</h3>
            <div style="background:white; border-radius:15px; padding:15px"><canvas id="myChart"></canvas></div>
        </div>

        <div id="tab-calendar" class="hidden">
            <h3>Cierres Anteriores</h3>
            <div id="calendar-list"></div>
        </div>
    </div>

    <div id="tab-add" class="hidden">
        <h2>Cargar Dato</h2>
        <input type="number" id="amount" placeholder="Monto $" inputmode="decimal">
        <input type="text" id="desc" placeholder="Descripción">
        <select id="cat">
            <option value="Comida">Comida</option>
            <option value="Servicios">Servicios</option>
            <option value="Nafta">Nafta</option>
            <option value="Varios">Varios</option>
        </select>
        <div class="flex-row">
            <button onclick="addEntry('gasto')" style="background:var(--red)">GASTO</button>
            <button onclick="addEntry('ingreso')" style="background:var(--green)">INGRESO</button>
        </div>
        <button onclick="showTab('home')" style="background:#444">VOLVER</button>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    // JS CORREGIDO
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

    function selectProfile(name) {
        currentUser = name;
        document.getElementById('user-display').innerText = "Hola, " + name;
        document.getElementById('profile-selection').classList.add('hidden');
        document.getElementById('main-dashboard').classList.remove('hidden');
        iniciarEscuchas();
    }

    function showTab(t) {
        ['home', 'stats', 'calendar', 'add'].forEach(id => {
            const el = document.getElementById('tab-' + id);
            if(el) el.classList.add('hidden');
        });
        document.getElementById('tab-' + t).classList.remove('hidden');
        if(t === 'stats') updateChart();
    }

    function iniciarEscuchas() {
        db.collection("movimientos").where("perfil", "==", currentUser).orderBy("timestamp", "desc").onSnapshot(snap => {
            transactions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderUI();
        });
        db.collection("ahorros").doc(currentUser).onSnapshot(doc => {
            totalAhorrado = doc.exists ? doc.data().total : 0;
            document.getElementById('total-saved-big').innerText = "$" + totalAhorrado.toLocaleString();
        });
        db.collection("historial_cierres").where("perfil", "==", currentUser).orderBy("timestamp", "desc").onSnapshot(snap => {
            const list = document.getElementById('calendar-list');
            list.innerHTML = "";
            snap.forEach(doc => {
                const d = doc.data();
                list.innerHTML += `<div class="item-list" style="border-right: 4px solid var(--green)">
                    <strong>${d.mes} ${d.año}</strong>: +$${d.monto_final.toLocaleString()}</div>`;
            });
        });
    }

    function renderUI() {
        const list = document.getElementById('history-list');
        list.innerHTML = "";
        let inc = 0, exp = 0;
        transactions.forEach(t => {
            if (t.type === 'ingreso') inc += t.amount; else exp += t.amount;
            list.innerHTML += `<div class="item-list" style="border-left: 5px solid ${t.type==='ingreso'?'var(--green)':'var(--red)'}">
                <div style="display:flex; justify-content:space-between">
                    <span>${t.desc}</span>
                    <strong>$${t.amount.toLocaleString()}</strong>
                </div>
                <button class="btn-delete" onclick="borrarDato('${t.id}')">Borrar</button>
            </div>`;
        });
        currentSaldoNeto = inc - exp;
        document.getElementById('net-balance').innerText = "$" + currentSaldoNeto.toLocaleString();
    }

    function addEntry(type) {
        const amount = parseFloat(document.getElementById('amount').value);
        const desc = document.getElementById('desc').value;
        const cat = document.getElementById('cat').value;
        if (!amount || !desc) return alert("Faltan datos");
        db.collection("movimientos").add({ amount, desc, cat, type, perfil: currentUser, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        document.getElementById('amount').value = ""; document.getElementById('desc').value = "";
        showTab('home');
    }

    function updateChart() {
        const ctx = document.getElementById('myChart').getContext('2d');
        const totals = {};
        transactions.filter(t => t.type === 'gasto').forEach(t => totals[t.cat] = (totals[t.cat] || 0) + t.amount);
        if (myChart) myChart.destroy();
        myChart = new Chart(ctx, { type: 'doughnut', data: { labels: Object.keys(totals), datasets: [{ data: Object.values(totals), backgroundColor: ['#6c5ce7', '#00b894', '#fd79a8', '#fab1a0'] }] } });
    }

    window.borrarDato = id => { if(confirm("¿Borrar?")) db.collection("movimientos").doc(id).delete(); };
    window.transferBalanceToSavings = () => { /* Función de ahorro */ };
    function logout() { location.reload(); }
</script>
</body>
</html>
