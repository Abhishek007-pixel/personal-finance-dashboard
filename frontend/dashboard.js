const API_URL = 'http://localhost:5000/api';

// Token management functions (copied from script.js for completeness)
function getToken() {
  return localStorage.getItem('token');
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  // Verify token exists before loading anything
  if (!getToken()) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }

  try {
    await loadProfile();
    await fetchSummary();
  } catch (error) {
    console.error('Initialization error:', error);
    logout();
  }

  // Income form handler
  document.getElementById('income-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await addIncome();
      await fetchSummary();
      e.target.reset(); // Clear form after submission
    } catch (error) {
      console.error('Income submission error:', error);
      alert('Failed to add income');
    }
  });

  // Expense form handler (fixed typo in function name)
  document.getElementById('expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await addExpense(); // Fixed from addExpense() to match function name
      await fetchSummary();
      e.target.reset(); // Clear form after submission
    } catch (error) {
      console.error('Expense submission error:', error);
      alert('Failed to add expense');
    }
  });
});

async function loadProfile() {
  const token = getToken();
  if (!token) {
    throw new Error('No token found');
  }

  const res = await fetch(`${API_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 401) {
    logout();
    return;
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to load profile');
  }

  document.getElementById('profile').innerText = data.username && data.email 
    ? `Hello, ${data.username} (${data.email})` 
    : 'Hello, new user!';
}

async function fetchSummary() {
  const token = getToken();
  if (!token) {
    throw new Error('No token found');
  }

  const res = await fetch(`${API_URL}/summary`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 401) {
    logout();
    return;
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to load summary');
  }

  document.getElementById('total-income').innerText = `Total Income: ₹${data.totalIncome || 0}`;
  document.getElementById('total-expense').innerText = `Total Expense: ₹${data.totalExpense || 0}`;
  document.getElementById('balance').innerText = `Balance: ₹${data.balance || 0}`;
}

async function addIncome() {
  const token = getToken();
  if (!token) {
    throw new Error('No token found');
  }

  const incomeData = {
    title: document.getElementById('income-title').value,
    amount: parseFloat(document.getElementById('income-amount').value),
    date: document.getElementById('income-date').value,
    category: document.getElementById('income-category').value,
    description: document.getElementById('income-description').value
  };

  const res = await fetch(`${API_URL}/income/add-income`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(incomeData)
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to add income');
  }
}

async function addExpense() { // Fixed typo from addExpense() to addExpense()
  const token = getToken();
  if (!token) {
    throw new Error('No token found');
  }

  const expenseData = {
    title: document.getElementById('expense-title').value,
    amount: parseFloat(document.getElementById('expense-amount').value),
    date: document.getElementById('expense-date').value,
    category: document.getElementById('expense-category').value,
    description: document.getElementById('expense-description').value
  };

  const res = await fetch(`${API_URL}/expense/add-expense`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(expenseData)
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to add expense');
  }
}