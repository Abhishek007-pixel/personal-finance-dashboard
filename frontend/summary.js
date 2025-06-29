document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();
  await loadSummary();
});

async function loadSummary() {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    document.getElementById('total-income').textContent = `Total Income: ₹${data.totalIncome}`;
    document.getElementById('total-expense').textContent = `Total Expense: ₹${data.totalExpense}`;
    document.getElementById('balance').textContent = `Balance: ₹${data.balance}`;
  } catch (err) {
    console.error('Error loading summary:', err);
  }
}
