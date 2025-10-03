import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

// Configurar baseURL de axios con normalización para evitar URLs inválidas como ":5000"
(function configureAxiosBaseURL() {
  const envUrl = process.env.REACT_APP_API_URL;
  const fallback = 'http://localhost:5000';

  const normalize = (url) => {
    if (!url) return fallback;
    // Si ya incluye protocolo, usar tal cual
    if (/^https?:\/\//i.test(url)) return url;
    // Si empieza con ":" o solo un puerto, construir con host actual
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    const port = url.replace(/^:+/, '');
    return `${protocol}//${host}:${port}`;
  };

  axios.defaults.baseURL = normalize(envUrl);
})();

function App() {
  const [user, setUser] = useState({ username: '', password: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [page, setPage] = useState('catalog'); // 'catalog' | 'cart'

  // Usuarios guardados en localStorage
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('users');
    if (saved) return JSON.parse(saved);
    return [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'cliente', password: 'user123', role: 'user' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', image: '' });
  const [cart, setCart] = useState([]);

  useEffect(() => {
    axios.get('/api/productos')
      .then(res => {
        setProducts(res.data);
        console.log('Productos cargados:', res.data);
      })
      .catch(err => console.error('Error al cargar productos:', err?.message || err));
  }, []);

  const categories = [...new Set(products.map(p => p.category))];

  const handleLogin = (e) => {
    e.preventDefault();
    const found = users.find(u => u.username === user.username && u.password === user.password);
    if (found) {
      setIsLoggedIn(true);
      setUserRole(found.role);
      setError('');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleRegisterUser = (e) => {
    e.preventDefault();
    if (!user.username || !user.password) {
      setError('Complete todos los campos');
      return;
    }
    if (users.some(u => u.username === user.username)) {
      setError('El usuario ya existe');
      return;
    }
    const newUser = { username: user.username, password: user.password, role: 'user' };
    setUsers([...users, newUser]);
    setError('');
    alert('Usuario registrado con éxito. Ahora podés iniciar sesión.');
    setIsRegistering(false);
    setUser({ username: '', password: '' });
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      setCart(cart.map(item => item._id === product._id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    const existing = cart.find(item => item._id === productId);
    if (!existing) return;
    if (existing.qty === 1) {
      setCart(cart.filter(item => item._id !== productId));
    } else {
      setCart(cart.map(item => item._id === productId ? { ...item, qty: item.qty - 1 } : item));
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    setUser({ username: '', password: '' });
    setCart([]);
    setError('');
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.image) {
      alert('Complete todos los campos del producto.');
      return;
    }
    axios.post('/api/productos', newProduct)
      .then(res => {
        setProducts([...products, res.data]);
        setNewProduct({ name: '', price: '', category: '', image: '' });
      })
      .catch(err => alert('Error al subir producto'));
  };

  // Para mostrar bien la imagen, concatenamos con la URL base del backend
  const getImageSrc = (image) => {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    const base = (axios.defaults.baseURL || '').replace(/\/+$/,'');
    if (image.startsWith('/img/')) return `${base}${image}`;
    if (image.startsWith('img/')) return `${base}/${image}`;
    return `${base}/img/${image.replace(/^\/+/, '')}`;
  };

  return (
    <div className="container">
      {!isLoggedIn ? (
        <div className="login-box">
          <h2>{isRegistering ? 'Registrarse' : 'Iniciar sesión'}</h2>
          <form onSubmit={isRegistering ? handleRegisterUser : handleLogin}>
            <input
              type="text"
              placeholder="Usuario"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              required
            />
            <button className="btn" type="submit">{isRegistering ? 'Registrarse' : 'Entrar'}</button>
          </form>
          {error && <p className="error">{error}</p>}
          <p className="hint">
            {isRegistering ? 'Ya tenés cuenta? ' : 'No tenés cuenta? '}
            <button className="link-button" onClick={() => {
              setError('');
              setIsRegistering(!isRegistering);
              setUser({ username: '', password: '' });
            }}>{isRegistering ? 'Iniciar sesión' : 'Registrarse'}</button>
          </p>
        </div>
      ) : (
        <>
          <header className="site-header">
            <div className="brand">
              <span className="brand-mark">A</span>
              <span className="brand-name">Almendra</span>
            </div>
            <nav className="nav">
              <button className={`nav-link ${page==='catalog' ? 'active' : ''}`} onClick={() => setPage('catalog')}>Catálogo</button>
              <button className={`nav-link ${page==='cart' ? 'active' : ''}`} onClick={() => setPage('cart')}>Carrito</button>
            </nav>
            <div className="header-actions">
              <div className="mini-cart" title="Productos en carrito">
                <span className="mini-cart-count">{cart.reduce((s, i) => s + i.qty, 0)}</span>
              </div>
              <button className="btn btn-logout" onClick={handleLogout}>Cerrar sesión</button>
            </div>
          </header>

          {page === 'cart' && (
            <section className="cart-panel">
              <h2>Carrito ({userRole})</h2>
              <div className="cart">
                {cart.length === 0 ? (
                  <p>El carrito está vacío.</p>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div className="cart-item" key={item._id}>
                        <img src={getImageSrc(item.image)} alt={item.name} className="cart-image" />
                        <div className="cart-info">
                          <strong>{item.name}</strong> – ${item.price.toLocaleString()} x {item.qty}
                        </div>
                        <div className="cart-controls">
                          <button className="btn btn-small" onClick={() => removeFromCart(item._id)}>-</button>
                          <button className="btn btn-small" onClick={() => addToCart(item)}>+</button>
                        </div>
                      </div>
                    ))}
                    <div className="total">Total: ${total.toLocaleString()}</div>
                  </>
                )}
              </div>
            </section>
          )}

          {page === 'catalog' && userRole === 'admin' && (
            <section className="admin-panel">
              <h2>Agregar nuevo producto</h2>
              <form onSubmit={handleProductSubmit}>
                <input
                  placeholder="Nombre"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <input
                  placeholder="Precio"
                  type="number"
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                />
                <input
                  placeholder="Categoría"
                  value={newProduct.category}
                  onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                />
                <input
                  placeholder="Nombre archivo imagen"
                  value={newProduct.image}
                  onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                />
                <button className="btn" type="submit">Subir</button>
              </form>
            </section>
          )}

          {page === 'catalog' && (
            <>
              
              <main className="catalog" id="catalogo">
                {categories.length === 0 && (
                  <p className="empty">No hay productos disponibles.</p>
                )}
                {categories.sort().map(category => (
                  <div key={category}>
                    <h2 className="category-title">{category}</h2>
                    <div className="product-list">
                      {products.filter(p => p.category === category).map(product => (
                        <div className="product-card" key={product._id}>
                          <div className="product-media">
                            <img src={getImageSrc(product.image)} alt={product.name} className="product-image" />
                          </div>
                          <h3 className="product-title">{product.name}</h3>
                          <p className="product-price">${product.price.toLocaleString()}</p>
                          <button className="btn" onClick={() => addToCart(product)}>Agregar al carrito</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </main>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
