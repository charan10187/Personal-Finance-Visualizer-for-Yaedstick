// Toggle Light/Dark Mode 
const modeToggle = document.getElementById('mode-toggle');
modeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', modeToggle.checked);
});

// Load Transactions from Server
async function loadTransactions() {
    const response = await fetch('/api/transactions'); // ✅ updated URL
    transactions = await response.json();
    renderTransactions();
}

// Render Transactions List
function renderTransactions() {
    const transactionList = document.getElementById('transactions');
    transactionList.innerHTML = '';
    transactions.forEach((transaction) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${transaction.date} - ${transaction.description} - ₹${transaction.amount}</span>
            <button onclick="deleteTransaction('${transaction.id}')">Delete</button> <!-- ✅ use id -->
        `;
        transactionList.appendChild(li);
    });
}

// Add Transaction
document.getElementById('transaction-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const date = document.getElementById('transaction-date').value;
    const description = document.getElementById('transaction-description').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);

    if (date && description && amount) {
        await fetch('/api/transactions', { // ✅ updated URL
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, description, amount })
        });

        event.target.reset();
        await loadTransactions();
        await updateFinancialSummary();
    } else {
        alert('Please fill all fields.');
    }
});

// Delete Transaction
async function deleteTransaction(id) { // ✅ accept id not index
    await fetch(`/api/transactions?id=${id}`, { // ✅ updated URL and method
        method: 'DELETE'
    });
    await loadTransactions();
    await updateFinancialSummary();
}

// Update Financial Summary
let monthlyChart;
let categoryChart;

async function updateFinancialSummary() {
    const response = await fetch('/api/summary'); // ✅ updated URL
    const summary = await response.json();

    const monthlyExpenses = summary.monthly_expenses;
    const categoryExpenses = summary.category_expenses;

    // Text summary
    document.getElementById('monthly-expenses').innerHTML = `
        <strong>Monthly Expenses:</strong>
        <ul>
            ${Object.entries(monthlyExpenses).map(([month, amount]) => `<li>${month}: ₹${amount}</li>`).join('')}
        </ul>
    `;

    document.getElementById('category-expenses').innerHTML = `
        <strong>Category Expenses:</strong>
        <ul>
            ${Object.entries(categoryExpenses).map(([category, amount]) => `<li>${category}: ₹${amount}</li>`).join('')}
        </ul>
    `;

    // Destroy previous charts if they exist
    if (monthlyChart) monthlyChart.destroy();
    if (categoryChart) categoryChart.destroy();

    // Bar Chart for Monthly Expenses
    const monthlyCtx = document.getElementById('monthly-expenses-chart').getContext('2d');
    monthlyChart = new Chart(monthlyCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(monthlyExpenses),
            datasets: [{
                label: 'Monthly Expenses (₹)',
                data: Object.values(monthlyExpenses),
                backgroundColor: '#4CAF50'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Pie Chart for Category Expenses
    const categoryCtx = document.getElementById('category-expenses-chart').getContext('2d');
    categoryChart = new Chart(categoryCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryExpenses),
            datasets: [{
                data: Object.values(categoryExpenses),
                backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#FF5722']
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Initial Rendering
let transactions = [];
loadTransactions();
updateFinancialSummary();

// Refresh Button
document.getElementById('refresh-btn').addEventListener('click', async () => {
    await loadTransactions();
    await updateFinancialSummary();
});
