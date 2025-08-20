import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [user, setUser] = useState({ username: '', password: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

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
    axios.get('http://localhost:5000/api/productos')
      .then(res => {
        setProducts(res.data);
        console.log('Productos cargados:', res.data);
      })
      .catch(err => console.error('Error al cargar productos:', err));
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
    axios.post('http://localhost:5000/api/productos', newProduct)
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
    if (image.startsWith('/img/')) return `http://localhost:5000${image}`;
    return `http://localhost:5000/img/${image}`;
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
          <header className="header">
            <h1>🤎 Almendra</h1>
            <button className="btn btn-logout" onClick={handleLogout}>Cerrar sesión</button>
            <div className="cart-top">
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
            </div>
          </header>

          {userRole === 'admin' && (
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

          <main className="catalog">
            {categories.map(category => (
              <div key={category}>
                <h2 className="category-title">{category}</h2>
                <div className="product-list">
                  {products.filter(p => p.category === category).map(product => (
                    <div className="product-card" key={product._id}>
                      <img src={getImageSrc(product.image)} alt={product.name} className="product-image" />
                      <h3>{product.name}</h3>
                      <p>${product.price.toLocaleString()}</p>
                      <button className="btn" onClick={() => addToCart(product)}>Agregar al carrito</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
