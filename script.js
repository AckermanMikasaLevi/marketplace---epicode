const apiUrl = 'https://striveschool-api.herokuapp.com/api/product/';
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzFmNjc5ZWFmNWE2MjAwMTVlZWJhMTYiLCJpYXQiOjE3MzAxMTEzOTAsImV4cCI6MTczMTMyMDk5MH0.PWCQiWcYJTfBUZU8uZuq72ybXCneKYdJ8U4JyYQAX3c';

const getProducts = async () => {
  try {
    const response = await fetch(apiUrl, { headers: { 'Authorization': token } });
    if (!response.ok) throw new Error('Errore nel recupero dei prodotti');
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const displayProducts = async (filter = '') => {
  try {
    const products = await getProducts();
    const container = document.getElementById('productsContainer');
    const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(filter.toLowerCase()) ||
      product.description.toLowerCase().includes(filter.toLowerCase())
    );

    container.innerHTML = filteredProducts.map(product => `
      <div class="col-12 col-md-4 mb-4">
        <div class="card">
          <img src="${product.imageUrl}" alt="${product.name}" class="card-img-top">
          <div class="card-body">
            <h5>${product.name}</h5>
            <p>${product.description}</p>
            <a href="prodotto.html?id=${product._id}" class="btn btn-primary">Dettagli</a>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Errore nel caricamento dei prodotti:', error);
  }
};

const displayProductDetail = async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id'); 
    const response = await fetch(apiUrl + productId, { headers: { 'Authorization': token } });
    if (!response.ok) throw new Error('Errore nel recupero dei dettagli del prodotto');
    const product = await response.json();

    document.getElementById('productDetailContainer').innerHTML = `
      <h1>${product.name}</h1>
      <img src="${product.imageUrl}" alt="${product.name}" class="img-fluid">
      <p>${product.description}</p>
      <p>Brand: ${product.brand}</p>
      <p>Prezzo: €${product.price}</p>
    `;
  } catch (error) {
    console.error('Errore nel caricamento del dettaglio del prodotto:', error);
  }
};

const addOrUpdateProduct = async (event) => {
  event.preventDefault();
  const productId = document.getElementById('productId').value;
  const product = {
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    brand: document.getElementById('brand').value,
    price: parseFloat(document.getElementById('price').value),
    imageUrl: document.getElementById('imageUrl').value,
  };

  try {
    const method = productId ? 'PUT' : 'POST';
    const url = productId ? `${apiUrl}${productId}` : apiUrl;
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Errore durante l\'aggiunta/modifica del prodotto');

    document.getElementById('productForm').reset();
    displayBackOfficeProducts();
  } catch (error) {
    console.error('Errore:', error);
  }
};

const deleteProduct = async (productId) => {
  try {
    const response = await fetch(`${apiUrl}${productId}`, { 
      method: 'DELETE', 
      headers: { 'Authorization': token } 
    });
    if (!response.ok) throw new Error('Errore nella cancellazione del prodotto');

    displayBackOfficeProducts();
  } catch (error) {
    console.error('Errore nella cancellazione del prodotto:', error);
  }
};

const displayBackOfficeProducts = async () => {
  try {
    const products = await getProducts();
    const container = document.getElementById('backOfficeProductsContainer');
    container.innerHTML = products.map(product => `
      <div class="col-12 col-md-4 mb-4">
        <div class="card">
          <img src="${product.imageUrl}" alt="${product.name}" class="card-img-top">
          <div class="card-body">
            <h5>${product.name}</h5>
            <p>${product.description}</p>
            <button class="btn btn-primary" onclick="editProduct('${product._id}')">Modifica</button>
            <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Cancella</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Errore nel caricamento dei prodotti nel back office:', error);
  }
};

const editProduct = async (productId) => {
  try {
    const response = await fetch(`${apiUrl}${productId}`, { headers: { 'Authorization': token } });
    if (!response.ok) throw new Error('Errore nel recupero del prodotto da modificare');
    const product = await response.json();
    
    document.getElementById('productId').value = product._id;
    document.getElementById('name').value = product.name;
    document.getElementById('description').value = product.description;
    document.getElementById('brand').value = product.brand;
    document.getElementById('price').value = product.price;
    document.getElementById('imageUrl').value = product.imageUrl;
  } catch (error) {
    console.error('Errore nel caricamento del prodotto per la modifica:', error);
  }
};

const handleSearch = () => {
  const searchInput = document.getElementById('searchInput').value;
  displayProducts(searchInput);
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('index.html')) {
    displayProducts(); 
    document.getElementById('searchInput').addEventListener('input', handleSearch); 
    document.getElementById('searchButton').addEventListener('click', handleSearch); 
  }
  if (window.location.pathname.includes('prodotto.html')) {
    displayProductDetail(); 
  }
  if (window.location.pathname.includes('backoffice.html')) {
    displayBackOfficeProducts(); 
    document.getElementById('productForm').addEventListener('submit', addOrUpdateProduct);
  }
});
