const API_URL = 'http://localhost:5000/api';

let editIncomeId = null; // store current editing id

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  fetchIncomes();
});

async function fetchIncomes() {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/income/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const table = document.getElementById('incomes-table');
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
            <button onclick="deleteIncome('${item._id}')">Delete</button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error(err);
  }
}

async function deleteIncome(id) {
  if (confirm('Are you sure?')) {
    const token = getToken();
    await fetch(`${API_URL}/income/delete-income/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchIncomes();
  }
}

function showEditModal(id, title, amount, date, category, description) {
  editIncomeId = id;
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

async function saveIncomeEdit() {
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
  fetchIncomes();
}
