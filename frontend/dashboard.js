document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();
  await fetchSummary();

  document.getElementById('income-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await addIncome();
    await fetchSummary();
  });

  document.getElementById('expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await addExpense();
    await fetchSummary();
  });
});

async function loadProfile() {
  try {
    const res = await fetch(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (data.username && data.email) {
      document.getElementById('profile').innerText = `Hello, ${data.username} (${data.email})`;
    } else {
      document.getElementById('profile').innerText = `Hello, new user!`;
    }
  } catch (err) {
    console.error(err);
    alert('Failed to load profile');
  }
}

async function fetchSummary() {
  try {
    const res = await fetch(`${API_URL}/summary`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    document.getElementById('total-income').innerText = `Total Income: ₹${data.totalIncome}`;
    document.getElementById('total-expense').innerText = `Total Expense: ₹${data.totalExpense}`;
    document.getElementById('balance').innerText = `Balance: ₹${data.balance}`;
  } catch (err) {
    console.error('Error fetching summary', err);
  }
}

async function addIncome() {
  const title = document.getElementById('income-title').value;
  const amount = parseFloat(document.getElementById('income-amount').value);
  const date = document.getElementById('income-date').value;
  const category = document.getElementById('income-category').value;
  const description = document.getElementById('income-description').value;
  await fetch(`${API_URL}/income/add-income`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ title, amount, date, category, description })
  });
}

async function addExpense() {
  const title = document.getElementById('expense-title').value;
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const date = document.getElementById('expense-date').value;
  const category = document.getElementById('expense-category').value;
  const description = document.getElementById('expense-description').value;
  await fetch(`${API_URL}/expense/add-expense`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ title, amount, date, category, description })
  });
}
