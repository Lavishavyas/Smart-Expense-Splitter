// script.js

let members = JSON.parse(localStorage.getItem("members")) || [];
let balances = JSON.parse(localStorage.getItem("balances")) || {};
let history = JSON.parse(localStorage.getItem("history")) || [];
let totalExpense = JSON.parse(localStorage.getItem("totalExpense")) || 0;

let expenseChart = null;

// ==========================
// ELEMENTS
// ==========================
const memberInput = document.getElementById("memberInput");
const descInput = document.getElementById("descInput");
const amountInput = document.getElementById("amountInput");

const memberList = document.getElementById("memberList");
const payerSelect = document.getElementById("payerSelect");
const balanceList = document.getElementById("balanceList");
const historyList = document.getElementById("historyList");

const totalMembers = document.getElementById("totalMembers");
const totalExpenses = document.getElementById("totalExpenses");
const totalEntries = document.getElementById("totalEntries");

const themeBtn = document.getElementById("themeBtn");
const aiInsights = document.getElementById("aiInsights");

// ==========================
// INIT
// ==========================
renderAll();


// ==========================
// ADD MEMBER
// ==========================
function addMember() {

  const name = memberInput.value.trim();

  if (!name) {
    alert("Please enter member name");
    return;
  }

  if (members.includes(name)) {
    alert("Member already exists");
    return;
  }

  members.push(name);
  balances[name] = 0;

  memberInput.value = "";

  saveData();
}


// ==========================
// SMART CATEGORY DETECTION
// ==========================
function detectCategory(text) {

  text = text.toLowerCase();

  if (
    text.includes("food") ||
    text.includes("pizza") ||
    text.includes("burger") ||
    text.includes("lunch") ||
    text.includes("dinner") ||
    text.includes("snacks") ||
    text.includes("tea") ||
    text.includes("coffee") ||
    text.includes("canteen") ||
    text.includes("zomato") ||
    text.includes("swiggy")
  ) return "Food";

  if (
    text.includes("uber") ||
    text.includes("ola") ||
    text.includes("taxi") ||
    text.includes("auto") ||
    text.includes("bus") ||
    text.includes("train") ||
    text.includes("fuel") ||
    text.includes("petrol")
  ) return "Travel";

  if (
    text.includes("rent") ||
    text.includes("hostel") ||
    text.includes("pg") ||
    text.includes("room") ||
    text.includes("flat") ||
    text.includes("wifi") ||
    text.includes("electricity")
  ) return "Rent";

  if (
    text.includes("movie") ||
    text.includes("party") ||
    text.includes("game") ||
    text.includes("netflix")
  ) return "Entertainment";

  if (
    text.includes("shopping") ||
    text.includes("amazon") ||
    text.includes("flipkart") ||
    text.includes("cloth") ||
    text.includes("shoes")
  ) return "Shopping";

  return "Other";
}


// ==========================
// ADD EXPENSE
// ==========================
function addExpense() {

  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const payer = payerSelect.value;

  if (members.length < 2) {
    alert("Please add at least 2 members");
    return;
  }

  if (!desc || isNaN(amount) || amount <= 0) {
    alert("Enter valid expense details");
    return;
  }

  const split = amount / members.length;

  balances[payer] += amount;

  members.forEach(member => {
    balances[member] -= split;
  });

  const category = detectCategory(desc);

  totalExpense += amount;

  history.unshift({
    desc,
    amount,
    payer,
    category,
    date: new Date().toLocaleString()
  });

  descInput.value = "";
  amountInput.value = "";

  saveData();
}


// ==========================
// SAVE DATA
// ==========================
function saveData() {

  localStorage.setItem("members", JSON.stringify(members));
  localStorage.setItem("balances", JSON.stringify(balances));
  localStorage.setItem("history", JSON.stringify(history));
  localStorage.setItem("totalExpense", JSON.stringify(totalExpense));

  renderAll();
}


// ==========================
// RENDER ALL
// ==========================
function renderAll() {
  renderMembers();
  renderPayers();
  renderBalances();
  renderHistory();
  renderStats();
  renderInsights();
  renderChart();
}


// ==========================
// MEMBERS
// ==========================
function renderMembers() {

  memberList.innerHTML = "";

  if (members.length === 0) {
    memberList.innerHTML = "<li>No members yet</li>";
    return;
  }

  members.forEach(member => {
    memberList.innerHTML += `<li>${member}</li>`;
  });
}


// ==========================
// DROPDOWN
// ==========================
function renderPayers() {

  payerSelect.innerHTML = "";

  members.forEach(member => {
    payerSelect.innerHTML += `<option>${member}</option>`;
  });
}


// ==========================
// WHO OWES WHOM
// ==========================
function renderBalances() {

  balanceList.innerHTML = "";

  let creditors = [];
  let debtors = [];

  members.forEach(member => {

    let amt = parseFloat(balances[member].toFixed(2));

    if (amt > 0) creditors.push({name: member, amount: amt});
    if (amt < 0) debtors.push({name: member, amount: Math.abs(amt)});

  });

  let i = 0;
  let j = 0;
  let results = [];

  while (i < debtors.length && j < creditors.length) {

    let pay = Math.min(debtors[i].amount, creditors[j].amount);

    results.push(`${debtors[i].name} owes ₹${pay.toFixed(2)} to ${creditors[j].name}`);

    debtors[i].amount -= pay;
    creditors[j].amount -= pay;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  if (results.length === 0) {
    balanceList.innerHTML = "<li>Everyone is settled 🎉</li>";
    return;
  }

  results.forEach(item => {
    balanceList.innerHTML += `<li class="negative">${item}</li>`;
  });
}


// ==========================
// HISTORY
// ==========================
function renderHistory() {

  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.innerHTML = "<li>No expense history yet</li>";
    return;
  }

  history.forEach(item => {
    historyList.innerHTML += `
      <li>
        <strong>${item.desc}</strong> - ₹${item.amount}<br>
        <small>${item.category} • Paid by ${item.payer}</small>
      </li>
    `;
  });
}


// ==========================
// STATS
// ==========================
function renderStats() {
  totalMembers.textContent = members.length;
  totalExpenses.textContent = "₹" + totalExpense.toFixed(2);
  totalEntries.textContent = history.length;
}


// ==========================
// BETTER AI INSIGHTS
// ==========================
function renderInsights() {

  if (!aiInsights) return;

  if (history.length === 0) {
    aiInsights.innerHTML = `
      <h2>🤖 AI Insights</h2>
      <p>No insights yet.</p>
    `;
    return;
  }

  let highestExpense = history[0];

  history.forEach(item => {
    if (item.amount > highestExpense.amount) {
      highestExpense = item;
    }
  });

  let avg = totalExpense / history.length;

  aiInsights.innerHTML = `
    <h2>🤖 AI Insights</h2>

    <p>💸 Highest expense: 
    <strong>${highestExpense.desc}</strong> (₹${highestExpense.amount})</p>

    <p>📂 Category: <strong>${highestExpense.category}</strong></p>

    <p>📊 Average spend per expense: 
    <strong>₹${avg.toFixed(2)}</strong></p>

    <p>🧠 Suggestion: Reduce unnecessary spending in 
    <strong>${highestExpense.category}</strong>.</p>
  `;
}


// ==========================
// CHART
// ==========================
function renderChart() {

  const canvas = document.getElementById("expenseChart");

  if (!canvas) return;

  let totals = {
    Food: 0,
    Travel: 0,
    Rent: 0,
    Shopping: 0,
    Entertainment: 0,
    Other: 0
  };

  history.forEach(item => {
    let cat = item.category || "Other";
    totals[cat] += Number(item.amount);
  });

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: Object.keys(totals),
      datasets: [{
        data: Object.values(totals)
      }]
    },
    options: {
      responsive: true
    }
  });
}


// ==========================
// RESET
// ==========================
function resetApp() {

  const ok = confirm("Delete all data permanently?");

  if (!ok) return;

  members = [];
  balances = {};
  history = [];
  totalExpense = 0;

  saveData();
}


// ==========================
// THEME
// ==========================
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
});


// ==========================
// MULTI TAB SYNC
// ==========================
window.addEventListener("storage", () => {

  members = JSON.parse(localStorage.getItem("members")) || [];
  balances = JSON.parse(localStorage.getItem("balances")) || {};
  history = JSON.parse(localStorage.getItem("history")) || [];
  totalExpense = JSON.parse(localStorage.getItem("totalExpense")) || 0;

  renderAll();

});
