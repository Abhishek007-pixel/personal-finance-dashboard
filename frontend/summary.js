//const API_URL = 'http://localhost:5000/api';

// Load everything on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadProfile();
    await loadSummaryData();
    await initCharts();
    setupTableSorting();
    setupAIAssistantModal();
  } catch (err) {
    console.error('Summary page initialization error:', err);
  }
});

// Load user profile
async function loadProfile() {
  try {
    const res = await fetch(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    document.getElementById('profile').innerHTML = `Hello, ${data.username} (${data.email})`;
  } catch (err) {
    console.error("Profile load error:", err);
    document.getElementById('profile').innerHTML = "Hello, User";
  }
}

// Load summary data
async function loadSummaryData() {
  try {
    const res = await fetch(`${API_URL}/summary`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();

    document.getElementById('total-income').textContent = `₹${data.totalIncome.toLocaleString()}`;
    document.getElementById('total-expense').textContent = `₹${data.totalExpense.toLocaleString()}`;
    document.getElementById('balance').textContent = `₹${data.balance.toLocaleString()}`;

    renderTransactions(data.recentTransactions || []);
  } catch (err) {
    console.error("Summary load error:", err);
  }
}

// Render transactions table
function renderTransactions(transactions) {
  const tableBody = document.getElementById('transactions-body');
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  tableBody.innerHTML = transactions.map(t => `
    <tr data-id="${t._id}" data-type="${t.type.toLowerCase()}">
      <td class="type-${t.type.toLowerCase()}">${t.type}</td>
      <td>${t.title || '-'}</td>
      <td>₹${t.amount?.toLocaleString() || 0}</td>
      <td>${t.date ? new Date(t.date).toLocaleDateString() : '-'}</td>
      <td><span class="category-tag">${t.category || '-'}</span></td>
      <td>
  <button class="delete-btn" data-id="${t._id}" data-type="${t.type.toLowerCase()}">Delete</button>
</td>

    </tr>
  `).join('');

  tableBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.id;
    const type = btn.dataset.type;

    if (btn.classList.contains('edit-btn')) {
      type === 'income' ? await editIncome(id) : await editExpense(id);
    } else if (btn.classList.contains('delete-btn')) {
      if (confirm('Are you sure?')) {
        type === 'income' ? await deleteIncome(id) : await deleteExpense(id);
      }
    }
    await refreshAll();
  });
}

// Init charts
async function initCharts() {
  try {
    const monthlyCtx = document.getElementById('monthlyTrendChart');
    const categoryCtx = document.getElementById('categoryChart');
    if (!monthlyCtx || !categoryCtx) return;

    const res = await fetch(`${API_URL}/summary/chart-data`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();

    safeDestroyChart(window.monthlyTrendChart);
    safeDestroyChart(window.categoryChart);

    window.monthlyTrendChart = new Chart(monthlyCtx, {
      type: 'line',
      data: {
        labels: data.monthlyTrends.labels || [],
        datasets: [
          {
            label: 'Income',
            data: data.monthlyTrends.income || [],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.3,
            borderWidth: 2
          },
          {
            label: 'Expenses',
            data: data.monthlyTrends.expenses || [],
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            tension: 0.3,
            borderWidth: 2
          }
        ]
      },
      options: { responsive: true }
    });

    window.categoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: data.categories.map(c => c.name),
        datasets: [{
          data: data.categories.map(c => c.value),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
        }]
      },
      options: { responsive: true }
    });
  } catch (err) {
    console.error('Chart initialization error:', err);
    showChartError();
  }
}

// Helpers
function safeDestroyChart(chart) {
  try { if (chart instanceof Chart) chart.destroy(); } catch (e) { console.warn('Error destroying chart:', e); }
}

function showChartError() {
  const container = document.getElementById('chart-error');
  if (container) {
    container.innerHTML = `<div class="alert alert-warning">Could not load chart data. Please refresh.</div>`;
  }
}

// Dummy functions you might already have
async function editIncome(id) { /* ... */ }
async function editExpense(id) { /* ... */ }
async function deleteIncome(id) { /* ... */ }
async function deleteExpense(id) { /* ... */ }
function setupTableSorting() { /* ... */ }
function getToken() { return localStorage.getItem('token'); }
async function refreshAll() { await loadSummaryData(); await initCharts(); }

// AI Assistant button
function setupAIAssistantModal() {
  const aiBtn = document.getElementById('aiAssistantIcon');
  if (aiBtn) {
    aiBtn.addEventListener('click', () => {
      window.location.href = 'http://localhost:4001'; // redirect to AI assistant page
    });
  }
}
