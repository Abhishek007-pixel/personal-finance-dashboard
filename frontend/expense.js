const API_URL = 'http://localhost:5000/api';

let editExpenseId = null; // store current editing expense id

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  fetchExpenses();
});

async function fetchExpenses() {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/expense/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const table = document.getElementById('expenses-table');
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
            <button onclick="showEditModal('${item._id}', '${item.title}', '${item.amount}', '${item.date.substring(0,10)}', '${item.category}', '${item.description || ''}')">Edit</button>
            <button onclick="deleteExpense('${item._id}')">Delete</button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error(err);
  }
}

async function deleteExpense(id) {
  if (confirm('Are you sure?')) {
    const token = getToken();
    await fetch(`${API_URL}/expense/delete-expense/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchExpenses();
  }
}

function showEditModal(id, title, amount, date, category, description) {
  editExpenseId = id;
  document.getElementById('edit-title').value = title;
  document.getElementById('edit-amount').value = amount;
  document.getElementById('edit-date').value = date;
  document.getElementById('edit-category').value = category;
  document.getElementById('edit-description').value = description;
  document.getElementById('editModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

async function saveExpenseEdit() {
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
  fetchExpenses();
}
