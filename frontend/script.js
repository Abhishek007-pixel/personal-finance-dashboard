const API_URL = 'http://localhost:5000/api';

// Token helpers
function saveToken(token) {
  localStorage.setItem('token', token);
}
function getToken() {
  return localStorage.getItem('token');
}
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// Load user profile
async function loadProfile() {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data && data.username && data.email) {
      document.getElementById('profile').innerText = `Hello, ${data.username} (${data.email})`;
    } else {
      document.getElementById('profile').innerText = `Hello, new user!`;
    }
  } catch (err) {
    console.error('Failed to load profile:', err);
    alert('Failed to load profile');
  }
}

// Fetch summary data & populate table
async function fetchSummary() {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    document.getElementById('total-income').textContent = `Total Income: ₹${data.totalIncome}`;
    document.getElementById('total-expense').textContent = `Total Expense: ₹${data.totalExpense}`;
    document.getElementById('balance').textContent = `Balance: ₹${data.balance}`;

    const tableBody = document.getElementById('transactions-table');
    tableBody.innerHTML = '';

    data.incomes.forEach(item => {
      tableBody.innerHTML += `<tr>
        <td>Income</td>
        <td>${item.title}</td>
        <td>₹${item.amount}</td>
        <td>${new Date(item.date).toLocaleDateString()}</td>
        <td>${item.category}</td>
        <td>${item.description || ''}</td>
        <td>
          <button onclick="editIncome('${item._id}')">✏️ Edit</button>
          <button onclick="deleteIncome('${item._id}')">🗑 Delete</button>
        </td>
      </tr>`;
    });

    data.expenses.forEach(item => {
      tableBody.innerHTML += `<tr>
        <td>Expense</td>
        <td>${item.title}</td>
        <td>₹${item.amount}</td>
        <td>${new Date(item.date).toLocaleDateString()}</td>
        <td>${item.category}</td>
        <td>${item.description || ''}</td>
        <td>
          <button onclick="editExpense('${item._id}')">✏️ Edit</button>
          <button onclick="deleteExpense('${item._id}')">🗑 Delete</button>
        </td>
      </tr>`;
    });
  } catch (err) {
    console.error('Error fetching summary:', err);
  }
}

// Universal refresh: profile + summary + page-specific lists
async function refreshAllData() {
  try {
    await loadProfile();
    await fetchSummary();

    if (window.location.pathname.includes('income.html')) {
      if (typeof fetchIncomes === 'function') await fetchIncomes();
    }
    if (window.location.pathname.includes('expense.html')) {
      if (typeof fetchExpenses === 'function') await fetchExpenses();
    }
  } catch (err) {
    console.error('Refresh error:', err);
  }
}

// Add income
async function addIncome() {
  try {
    const title = document.getElementById('income-title').value;
    const amount = parseFloat(document.getElementById('income-amount').value);
    const date = document.getElementById('income-date').value;
    const category = document.getElementById('income-category').value;
    const description = document.getElementById('income-description').value;
    const token = getToken();

    await fetch(`${API_URL}/income/add-income`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, amount, date, category, description })
    });

    await refreshAllData();
  } catch (err) {
    console.error('Error adding income:', err);
  }
}

// Add expense
async function addExpense() {
  try {
    const title = document.getElementById('expense-title').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;
    const description = document.getElementById('expense-description').value;
    const token = getToken();

    await fetch(`${API_URL}/expense/add-expense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, amount, date, category, description })
    });

    await refreshAllData();
  } catch (err) {
    console.error('Error adding expense:', err);
  }
}

// Delete income
async function deleteIncome(id) {
  const token = getToken();
  if (confirm('Are you sure you want to delete this income?')) {
    try {
      await fetch(`${API_URL}/income/delete-income/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshAllData();
    } catch (err) {
      console.error('Error deleting income:', err);
    }
  }
}

// Delete expense
async function deleteExpense(id) {
  const token = getToken();
  if (confirm('Are you sure you want to delete this expense?')) {
    try {
      await fetch(`${API_URL}/expense/delete-expense/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshAllData();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  }
}

// Edit income
async function editIncome(id) {
  const title = prompt('New title:');
  const amount = prompt('New amount:');
  const date = prompt('New date (YYYY-MM-DD):');
  const category = prompt('New category:');
  const description = prompt('New description:');
  const token = getToken();
  try {
    await fetch(`${API_URL}/income/update-income/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, amount, date, category, description })
    });
    await refreshAllData();
  } catch (err) {
    console.error('Error editing income:', err);
  }
}

// Edit expense
async function editExpense(id) {
  const title = prompt('New title:');
  const amount = prompt('New amount:');
  const date = prompt('New date (YYYY-MM-DD):');
  const category = prompt('New category:');
  const description = prompt('New description:');
  const token = getToken();
  try {
    await fetch(`${API_URL}/expense/update-expense/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, amount, date, category, description })
    });
    await refreshAllData();
  } catch (err) {
    console.error('Error editing expense:', err);
  }
}

// Setup on page load
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('dashboard.html')) {
    loadProfile();
    fetchSummary();

    document.getElementById('income-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await addIncome();
    });

    document.getElementById('expense-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await addExpense();
    });
  }
});
