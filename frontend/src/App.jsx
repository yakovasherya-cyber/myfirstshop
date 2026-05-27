import React, { useState } from 'react';

function App() {
  const [page, setPage] = useState('add');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price) return;

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: parseFloat(price) })
      });
      const data = await response.json();
      setMessage(data.message || "Product addition rejected. Avoid tags.!");
      setName('');
      setPrice('');
    } catch (err) {
      setMessage("Connection error to server");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/products/search?query=${searchQuery}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search error", err);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Product Management System</h1>
      
      <nav style={{ marginBottom: '20px' }}>
        <button onClick={() => { setPage('add'); setMessage(''); }} style={{ marginRight: '10px', padding: '8px 15px', fontWeight: page === 'add' ? 'bold' : 'normal' }}>
          Add Product
        </button>
        <button onClick={() => setPage('search')} style={{ padding: '8px 15px', fontWeight: page === 'search' ? 'bold' : 'normal' }}>
          Search Product
        </button>
      </nav>

      <hr />

      {page === 'add' && (
        <div style={{ marginTop: '20px' }}>
          <h2>Add New Product</h2>
          <form onSubmit={handleAddProduct}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Product Name:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '8px', width: '100%' }} required />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Price ($):</label>
              <input 
                type="number" 
                step="0.01" 
                min="0" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                className="no-spinners" 
                style={{ padding: '8px', width: '100%' }} 
                required 
              />
            </div>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
              Save Product
            </button>
          </form>
          {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red', marginTop: '15px', fontWeight: 'bold' }}>{message}</p>}
        </div>
      )}

      {page === 'search' && (
        <div style={{ marginTop: '20px' }}>
          <h2>Search Products</h2>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input type="text" placeholder="Type product name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '8px', flex: 1 }} />
            <button type="submit" style={{ padding: '8px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
              Search
            </button>
          </form>

          <h3>Results:</h3>
          {searchResults.length === 0 ? <p style={{ color: '#666' }}>No products found.</p> : (
            <ul style={{ paddingLeft: '20px' }}>
              {searchResults.map((product) => (
                <li key={product.id} style={{ marginBottom: '8px', fontSize: '18px' }}>
                  <strong>{product.name}</strong> - ${product.price}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
