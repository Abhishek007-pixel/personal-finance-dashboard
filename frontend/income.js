let editIncomeId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  fetchIncomes();
});

// Fetch and display incomes
async function fetchIncomes() {
  try {
    const token = getToken();
    const table = document.getElementById('incomes-table');
    table.innerHTML = `<tr><td colspan="6" class="spinner">Loading...</td></tr>`;

    const res = await fetch(`${API_URL}/income/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.length === 0) {
      table.innerHTML = `<tr><td colspan="6">No incomes yet.</td></tr>`;
      return;
    }

    table.innerHTML = '';
    data.forEach(item => {
      table.innerHTML += `
        <tr>
          <td>${item.title}</td>
          <td>₹${item.amount}</td>
          <td>${new Date(item.date).toLocaleDateString()}</td>
          <td>${item.category}</td>
          <td>${item.description || ''}</td>
          <td>
            <button onclick="showEditModal('${item._id}', '${escape(item.title)}', '${item.amount}', '${item.date.substring(0,10)}', '${escape(item.category)}', '${escape(item.description || '')}')">Edit</button>
            <button onclick="deleteIncome('${item._id}')">Delete</button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error('Error fetching incomes:', err);
    document.getElementById('incomes-table').innerHTML = `<tr><td colspan="6">Error loading data</td></tr>`;
  }
}

// Refresh dashboard summary if on dashboard page
async function refreshDashboard() {
  try {
    const token = getToken();
    await fetch(`${API_URL}/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (window.location.pathname.includes('dashboard.html')) {
      window.location.reload();
    }
  } catch (err) {
    console.error('Error refreshing dashboard:', err);
  }
}

// Delete income by ID
window.deleteIncome = async function(id) {
  if (confirm('Are you sure?')) {
    try {
      const token = getToken();
      await fetch(`${API_URL}/income/delete-income/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchIncomes();
      await refreshDashboard();
    } catch (err) {
      console.error('Error deleting income:', err);
    }
  }
}

// Show edit modal with current income details
window.showEditModal = function(id, title, amount, date, category, description) {
  editIncomeId = id;
  document.getElementById('edit-title').value = unescape(title);
  document.getElementById('edit-amount').value = amount;
  document.getElementById('edit-date').value = date;
  document.getElementById('edit-category').value = unescape(category);
  document.getElementById('edit-description').value = unescape(description);
  document.getElementById('editModal').style.display = 'block';
}

// Close the edit modal
window.closeModal = function() {
  document.getElementById('editModal').style.display = 'none';
}

// Save updated income
window.saveIncomeEdit = async function() {
  try {
    const token = getToken();
    const updated = {
      title: document.getElementById('edit-title').value,
      amount: parseFloat(document.getElementById('edit-amount').value),
      date: document.getElementById('edit-date').value,
      category: document.getElementById('edit-category').value,
      description: document.getElementById('edit-description').value
    };

    await fetch(`${API_URL}/income/update-income/${editIncomeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updated)
    });

    closeModal();
    await fetchIncomes();
    await refreshDashboard();
  } catch (err) {
    console.error('Error saving income edit:', err);
  }
}
