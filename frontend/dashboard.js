const apiBaseUrl = 'http://localhost:3001';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in to access the dashboard.');
    window.location.href = 'index.html';
    return;
  }

  const logoutBtn = document.getElementById('logout-btn');
  const addItemForm = document.getElementById('add-item-form');
  const itemsList = document.getElementById('items-list');

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

  async function fetchItems() {
    try {
      const response = await fetch(`${apiBaseUrl}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch items');
      const items = await response.json();
      renderItems(items);
    } catch (error) {
      alert('Error fetching items');
      console.error(error);
    }
  }

  function renderItems(items) {
    itemsList.innerHTML = '';
    if (items.length === 0) {
      itemsList.innerHTML = '<p>No items found.</p>';
      return;
    }
    items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item-card';
      itemDiv.innerHTML = `
        <h3>${item.title}</h3>
        <div class="item-images">
          ${item.images && item.images.length > 0 ? item.images.map(img => `<img src="${img}" alt="${item.title}" />`).join('') : '<p>No images</p>'}
        </div>
        <p>${item.description}</p>
        <p><strong>Features:</strong> ${item.features ? item.features.join(', ') : 'None'}</p>
        <p><strong>Discounts:</strong> ${item.discounts ? item.discounts.map(d => d.days + ' days: ' + d.percentage + '%').join(', ') : 'None'}</p>
      `;
      itemsList.appendChild(itemDiv);
    });
  }

  addItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('item-title').value.trim();
    const imagesInput = document.getElementById('item-images').value.trim();
    const description = document.getElementById('item-description').value.trim();
    const featuresInput = document.getElementById('item-features').value.trim();
    const discountInput = document.getElementById('item-discount').value.trim();

    const images = imagesInput ? imagesInput.split(',').map(s => s.trim()) : [];
    const features = featuresInput ? featuresInput.split(',').map(s => s.trim()) : [];
    const discounts = discountInput ? discountInput.split(',').map(s => {
      const [days, percentage] = s.split(':').map(str => str.trim());
      return { days: parseInt(days), percentage: parseFloat(percentage) };
    }) : [];

    try {
      const response = await fetch(`${apiBaseUrl}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, images, description, features, discounts }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      const newItem = await response.json();
      alert('Item added successfully');
      addItemForm.reset();
      fetchItems();
    } catch (error) {
      alert('Error adding item');
      console.error(error);
    }
  });

  fetchItems();
});
