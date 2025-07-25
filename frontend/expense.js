let editExpenseId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  fetchExpenses();
});

// Fetch and display expenses
async function fetchExpenses() {
  try {
    const token = getToken();
    const table = document.getElementById('expenses-table');
    table.innerHTML = `<tr><td colspan="6" class="spinner">Loading...</td></tr>`;

    const res = await fetch(`${API_URL}/expense/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.length === 0) {
      table.innerHTML = `<tr><td colspan="6">No expenses yet.</td></tr>`;
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
            <button onclick="deleteExpense('${item._id}')">Delete</button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    document.getElementById('expenses-table').innerHTML = `<tr><td colspan="6">Error loading data</td></tr>`;
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

// Delete expense by ID and refresh dashboard
window.deleteExpense = async function(id) {
  if (confirm('Are you sure?')) {
    try {
      const token = getToken();
      await fetch(`${API_URL}/expense/delete-expense/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchExpenses();
      await refreshDashboard();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  }
}

// Show edit modal with current expense details
window.showEditModal = function(id, title, amount, date, category, description) {
  editExpenseId = id;
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

// Save updated expense and refresh dashboard
window.saveExpenseEdit = async function() {
  try {
    const token = getToken();
    const updated = {
      title: document.getElementById('edit-title').value,
      amount: parseFloat(document.getElementById('edit-amount').value),
      date: document.getElementById('edit-date').value,
      category: document.getElementById('edit-category').value,
      description: document.getElementById('edit-description').value
    };

    await fetch(`${API_URL}/expense/update-expense/${editExpenseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updated)
    });

    closeModal();
    await fetchExpenses();
    await refreshDashboard();
  } catch (err) {
    console.error('Error saving expense edit:', err);
  }
}
