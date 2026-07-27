// ===============================
// DOMPETKU - SCRIPT PART 1
// ===============================

// ---------- DATA ----------
let data = JSON.parse(localStorage.getItem("dompetku")) || {
    cash: 0,
    income: [],
    expense: [],
    assets: [],
    liabilities: [],
    transactions: []
};

// ---------- ELEMENT ----------
const cashDisplay = document.getElementById("cashDisplay");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const totalAsset = document.getElementById("totalAsset");
const totalLiability = document.getElementById("totalLiability");

const incomeForm = document.getElementById("incomeForm");
const expenseForm = document.getElementById("expenseForm");

const assetForm = document.getElementById("assetForm");
const liabilityForm = document.getElementById("liabilityForm");

const transactionList = document.getElementById("transactionList");

// ---------- FORMAT ----------
function rupiah(angka) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);

}

// ---------- SIMPAN ----------
function saveData() {

    localStorage.setItem(
        "dompetku",
        JSON.stringify(data)
    );

}

// ---------- HITUNG ----------
function total(array) {

    return array.reduce((sum, item) => sum + item.nominal, 0);

}

// ---------- UPDATE ----------
function updateDashboard() {

    const pemasukan = total(data.income);
    const pengeluaran = total(data.expense);

    const aset = total(data.assets);
    const utang = total(data.liabilities);

    data.cash = pemasukan - pengeluaran;

    cashDisplay.textContent = rupiah(data.cash);

    totalIncome.textContent = rupiah(pemasukan);

    totalExpense.textContent = rupiah(pengeluaran);

    totalAsset.textContent = rupiah(aset);

    totalLiability.textContent = rupiah(utang);

    saveData();

}

// ---------- RIWAYAT ----------
function renderTransactions() {

    transactionList.innerHTML = "";

    if (data.transactions.length === 0) {

        transactionList.innerHTML =
            "<p class='empty'>Belum ada transaksi.</p>";

        return;

    }

    data.transactions
        .slice()
        .reverse()
        .forEach(item => {

            const div = document.createElement("div");

            div.className =
                item.tipe === "income"
                ? "transaction"
                : "transaction expense";

            div.innerHTML = `
                <div>
                    <strong>${item.kategori}</strong>
                    <br>
                    <small>${item.tanggal}</small>
                </div>

                <strong>
                    ${item.tipe === "income" ? "+" : "-"}
                    ${rupiah(item.nominal)}
                </strong>
            `;

            transactionList.appendChild(div);

        });

}

// ---------- PEMASUKAN ----------
incomeForm.addEventListener("submit", function(e){

    e.preventDefault();

    let nominal = Number(
        document.getElementById("incomeAmount").value
    );

    if(nominal <= 0){

        alert("Masukkan nominal yang benar.");

        return;

    }

    let kategori =
        document.getElementById("incomeCategory").value;

    if(kategori === "Lainnya"){

        kategori =
        document.getElementById("incomeOther").value || "Lainnya";

    }

    data.income.push({

        kategori,
        nominal

    });

    data.transactions.push({

        tipe:"income",

        kategori,

        nominal,

        tanggal:new Date().toLocaleString("id-ID")

    });

    incomeForm.reset();

    updateDashboard();

    renderTransactions();

});

// ---------- PENGELUARAN ----------
expenseForm.addEventListener("submit",function(e){

    e.preventDefault();

    let nominal = Number(
        document.getElementById("expenseAmount").value
    );

    if(nominal<=0){

        alert("Masukkan nominal yang benar.");

        return;

    }

    let kategori =
    document.getElementById("expenseCategory").value;

    if(kategori==="Lainnya"){

        kategori=
        document.getElementById("expenseOther").value || "Lainnya";

    }

    data.expense.push({

        kategori,

        nominal

    });

    data.transactions.push({

        tipe:"expense",

        kategori,

        nominal,

        tanggal:new Date().toLocaleString("id-ID")

    });

    expenseForm.reset();

    updateDashboard();

    renderTransactions();

});

// ---------- LOAD ----------
updateDashboard();

renderTransactions();
// ===============================
// DOMPETKU - SCRIPT PART 2
// ===============================

// ---------- LIST ASET ----------
const assetList = document.getElementById("assetList");

// ---------- LIST LIABILITAS ----------
const liabilityList = document.getElementById("liabilityList");

// ---------- RENDER ASET ----------
function renderAssets() {

    assetList.innerHTML = "";

    data.assets.forEach((item) => {

        const li = document.createElement("li");

        li.innerHTML = `
            <span>${item.jenis}</span>
            <strong>${rupiah(item.nominal)}</strong>
        `;

        assetList.appendChild(li);

    });

}

// ---------- RENDER LIABILITAS ----------
function renderLiabilities() {

    liabilityList.innerHTML = "";

    data.liabilities.forEach((item) => {

        const li = document.createElement("li");

        li.innerHTML = `
            <span>Liabilitas</span>
            <strong>${rupiah(item.nominal)}</strong>
        `;

        liabilityList.appendChild(li);

    });

}

// ---------- TAMBAH ASET ----------
assetForm.addEventListener("submit", function(e){

    e.preventDefault();

    const jenis =
        document.getElementById("assetType").value;

    const nominal =
        Number(document.getElementById("assetValue").value);

    if(nominal <= 0){

        alert("Masukkan nominal aset.");

        return;

    }

    data.assets.push({

        jenis,

        nominal

    });

    assetForm.reset();

    renderAssets();

    updateDashboard();

});

// ---------- TAMBAH LIABILITAS ----------
liabilityForm.addEventListener("submit", function(e){

    e.preventDefault();

    const nominal =
        Number(document.getElementById("liabilityValue").value);

    if(nominal <= 0){

        alert("Masukkan nominal liabilitas.");

        return;

    }

    data.liabilities.push({

        nominal

    });

    liabilityForm.reset();

    renderLiabilities();

    updateDashboard();

});

// ---------- CHART ----------
const ctx = document.getElementById("financeChart");

const financeChart = new Chart(ctx,{

    type:"doughnut",

    data:{

        labels:[
            "Pemasukan",
            "Pengeluaran"
        ],

        datasets:[{

            data:[0,0],

            backgroundColor:[
                "#22c55e",
                "#ef4444"
            ],

            borderWidth:0

        }]

    },

    options:{

        responsive:true,

        plugins:{

            legend:{
                position:"bottom"
            }

        }

    }

});

// ---------- UPDATE CHART ----------
function updateChart(){

    financeChart.data.datasets[0].data = [

        total(data.income),

        total(data.expense)

    ];

    financeChart.update();

}

// ---------- OVERRIDE DASHBOARD ----------
const oldUpdateDashboard = updateDashboard;

updateDashboard = function(){

    oldUpdateDashboard();

    renderAssets();

    renderLiabilities();

    updateChart();

};

// ---------- REFRESH ----------
updateDashboard();
renderAssets();
renderLiabilities();
updateChart();
// ===============================
// DOMPETKU - SCRIPT PART 3
// ===============================

// Tombol hapus semua data
const resetButton = document.createElement("button");

resetButton.innerHTML = "🗑 Hapus Semua Data";

resetButton.style.marginTop = "20px";

resetButton.style.background = "#dc2626";

document.querySelector(".container").appendChild(resetButton);

resetButton.addEventListener("click", () => {

    const konfirmasi = confirm(
        "Yakin ingin menghapus seluruh data keuangan?"
    );

    if (!konfirmasi) return;

    data = {
        cash: 0,
        income: [],
        expense: [],
        assets: [],
        liabilities: [],
        transactions: []
    };

    localStorage.removeItem("dompetku");

    updateDashboard();

    renderTransactions();

    renderAssets();

    renderLiabilities();

    updateChart();

});


// ===============================
// RINGKASAN STATUS
// ===============================

const statusCard = document.createElement("div");

statusCard.className = "card";

statusCard.style.marginTop = "20px";

statusCard.innerHTML = `
<h2>Status Keuangan</h2>
<h3 id="financialStatus">Sehat ✅</h3>
`;

document.querySelector(".container").appendChild(statusCard);

const financialStatus =
document.getElementById("financialStatus");


// ===============================
// UPDATE STATUS
// ===============================

const oldDashboard2 = updateDashboard;

updateDashboard = function(){

    oldDashboard2();

    const pemasukan = total(data.income);

    const pengeluaran = total(data.expense);

    if(pemasukan===0 && pengeluaran===0){

        financialStatus.innerHTML =
        "Belum ada data.";

        return;

    }

    if(pemasukan>pengeluaran){

        financialStatus.innerHTML =
        "🟢 Surplus";

    }

    else if(pemasukan<pengeluaran){

        financialStatus.innerHTML =
        "🔴 Defisit";

    }

    else{

        financialStatus.innerHTML =
        "🟡 Impas";

    }

};


// ===============================
// LOAD ULANG
// ===============================

updateDashboard();

renderTransactions();

renderAssets();

renderLiabilities();

updateChart();
