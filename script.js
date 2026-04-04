// CONFIGURACIÓN FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBCtAu5W-S48pICmS9H0k7mKLiJpNKHSoQ",
  authDomain: "finansas-ib.firebaseapp.com",
  projectId: "finansas-ib",
  storageBucket: "finansas-ib.firebasestorage.app",
  messagingSenderId: "699584425602",
  appId: "1:699584425602:web:0d793337469fbf02b00e9b"
};

// Inicializar Firebase si no está inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Variables Globales
let currentUser = "", currentType = 'gasto', totalAhorrado = 0, currentSaldoNeto = 0;
let transactions = [], myChart = null;
let unsubMov = null, unsubAhorro = null, unsubHistorial = null;

// --- FUNCIONES GLOBALES (Registradas en window para CodePen) ---

window.selectProfile = function(name) {
  currentUser = name;
  document.getElementById('user-display').innerText = "Hola, " + name;
  document.getElementById('profile-selection').classList.add('hidden');
  document.getElementById('main-dashboard').classList.remove('hidden');
  
  // Limpiar escuchas previas
  if (unsubMov) unsubMov();
  if (unsubAhorro) unsubAhorro();
  if (unsubHistorial) unsubHistorial();

  // Escuchar Movimientos
  unsubMov = db.collection("movimientos")
    .where("perfil", "==", currentUser)
    .orderBy("timestamp", "desc")
    .onSnapshot(snap => {
      transactions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateUI();
    });

  // Escuchar Ahorros
  unsubAhorro = db.collection("ahorros").doc(currentUser).onSnapshot(doc => {
    totalAhorrado = doc.exists ? doc.data().total : 0;
    document.getElementById('total-saved-big').innerText = "$" + totalAhorrado.toLocaleString();
  });

  // Escuchar Historial de Cierres
  unsubHistorial = db.collection("historial_cierres")
    .where("perfil", "==", currentUser)
    .orderBy("timestamp", "desc")
    .onSnapshot(snap => {
      const list = document.getElementById('calendar-list');
      list.innerHTML = "";
      snap.forEach(doc => {
        const d = doc.data();
        let gastosHtml = d.detalle_gastos ? d.detalle_gastos.map(g => `<div>${g.desc}: $${g.monto}</div>`).join('') : "";
        list.innerHTML += `<div class="month-card">
          <div style="display:flex; justify-content:space-between"><strong>${d.mes} ${d.año}</strong> <span style="color:var(--green)">+$${d.monto_final}</span></div>
          <div class="month-details">${gastosHtml}</div>
        </div>`;
      });
    });
};

window.showTab = function(t) { 
  document.querySelectorAll('.tab-content').forEach(x => x.classList.add('hidden')); 
  document.getElementById('tab-' + t).classList.remove('hidden'); 
  if(t === 'stats') updateChart(); 
};

window.setType = function(t) { 
  currentType = t; 
  document.getElementById('btn-gasto').classList.toggle('active', t === 'gasto');
  document.getElementById('btn-ingreso').classList.toggle('active', t === 'ingreso');
};

window.openAddTab = function() { window.showTab('add'); };

window.addEntry = function() {
  const amtInput = document.getElementById('amount');
  const dscInput = document.getElementById('desc');
  const amount = parseFloat(amtInput.value);
  const desc = dscInput.value;
  const cat = document.getElementById('cat').value;
  
  if (!amount || !desc) return alert("Por favor, completa los datos.");
  
  db.collection("movimientos").add({ 
    amount, desc, cat, 
    type: currentType, 
    perfil: currentUser, 
    timestamp: firebase.firestore.FieldValue.serverTimestamp() 
  });
  
  amtInput.value = "";
  dscInput.value = "";
  window.showTab('home');
};

window.transferBalanceToSavings = function() {
  if (currentSaldoNeto <= 0) return alert("No hay saldo positivo para cerrar.");
  const mesStr = new Date().toLocaleString('es-AR', { month: 'long' });
  
  if (confirm(`¿Cerrar el mes de ${mesStr} y archivar $${currentSaldoNeto}?`)) {
    const gastos = transactions.filter(t => t.type === 'gasto').map(t => ({ desc: t.desc, monto: t.amount }));
    
    // 1. Guardar en historial
    db.collection("historial_cierres").add({ 
      perfil: currentUser, mes: mesStr, año: 2026, 
      monto_final: currentSaldoNeto, detalle_gastos: gastos, 
      timestamp: firebase.firestore.FieldValue.serverTimestamp() 
    });
    
    // 2. Sumar a la caja de ahorros
    db.collection("ahorros").doc(currentUser).set({ total: totalAhorrado + currentSaldoNeto });
    
    // 3. Borrar movimientos del mes actual
    transactions.forEach(t => db.collection("movimientos").doc(t.id).delete());
    
    window.showTab('calendar');
  }
};

window.manualSavingsChange = function(modo) {
  const input = document.getElementById('manual-savings-amount');
  const monto = parseFloat(input.value);
  if(!monto) return;
  const nuevoTotal = modo === 'suma' ? totalAhorrado + monto : totalAhorrado - monto;
  db.collection("ahorros").doc(currentUser).set({ total: nuevoTotal });
  input.value = "";
};

window.logout = function() {
  // En CodePen evitamos location.reload() para no tener errores
  currentUser = "";
  if (unsubMov) unsubMov();
  document.getElementById('main-dashboard').classList.add('hidden');
  document.getElementById('profile-selection').classList.remove('hidden');
  console.log("Sesión cerrada");
};

// --- LÓGICA DE INTERFAZ ---

function updateUI() {
  const list = document.getElementById('history-list'); 
  list.innerHTML = "";
  let inc = 0, exp = 0;
  
  transactions.forEach(item => {
    if (item.type === 'ingreso') inc += item.amount; else exp += item.amount;
    list.innerHTML += `
      <div class="item-card ${item.type}">
        <div><strong>${item.desc}</strong><br><small>${item.cat}</small></div>
        <div>$${item.amount.toLocaleString()}</div>
      </div>`;
  });
  
  currentSaldoNeto = inc - exp;
  document.getElementById('net-balance').innerText = "$" + currentSaldoNeto.toLocaleString();
  document.getElementById('total-income').innerText = "$" + inc.toLocaleString();
  document.getElementById('total-expense').innerText = "$" + exp.toLocaleString();
}

function updateChart() {
  const ctx = document.getElementById('myChart').getContext('2d');
  const totals = {};
  
  transactions.filter(t => t.type === 'gasto').forEach(t => { 
    totals[t.cat] = (totals[t.cat] || 0) + t.amount; 
  });
  
  if (myChart) myChart.destroy();
  if (Object.keys(totals).length === 0) return;

  myChart = new Chart(ctx, {
    type: 'doughnut',
    data: { 
      labels: Object.keys(totals), 
      datasets: [{ 
        data: Object.values(totals), 
        backgroundColor: ['#6c5ce7', '#00b894', '#fd79a8', '#fab1a0', '#0984e3'] 
      }] 
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });
}