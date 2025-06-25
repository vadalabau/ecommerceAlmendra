import React, { useState, useEffect } from 'react';
import './App.css';

import outfit2 from './img/outfit2.png';
import outfit1 from './img/outfit1.png';

import remeraroja from './img/remeraroja.png';
import remeraamarilla from './img/remeraamarilla.png';
import remeraverde from './img/remeraverde.png';
import remeraazul from './img/remeraazul.png';
import remeramarron from './img/remeramarron.png';
import remerablanca from './img/remerablanca.png';
import remeranegra from './img/remeranegra.png';
import remeragris from './img/remeragris.png';
import remeravioleta from './img/remeravioleta.png';
import remeraceleste from './img/remeraceleste.png';

import pantalonrojo from './img/pantalonrojo.png';
import pantalonamarillo from './img/pantalonamarillo.png';
import pantalonverde from './img/pantalonverde.png';
import pantalonazul from './img/pantalonazul.png';
import pantalonmarron from './img/pantalonmarron.png';
import pantalonblanco from './img/pantalonblanco.png';
import pantalonnegro from './img/pantalonnegro.png';
import pantalongris from './img/pantalongris.png';
import pantalonvioleta from './img/pantalonvioleta.png';
import pantalonceleste from './img/pantalonceleste.png';

function App() {
  const [user, setUser] = useState({ username: '', password: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Carga usuarios desde localStorage o valores iniciales
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('users');
    if (saved) return JSON.parse(saved);
    return [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'cliente', password: 'user123', role: 'user' }
    ];
  });

  // Guarda usuarios en localStorage al modificarse
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const [products] = useState([
    { id: 1, name: 'Outfit Classic', price: 100000, category: 'Outfits', image: outfit1 },
    { id: 2, name: 'Outfit Relaxed', price: 100000, category: 'Outfits', image: outfit2 },
    { id: 3, name: 'Remera Roja', price: 25000, category: 'Remeras', image: remeraroja },
    { id: 4, name: 'Remera Amarilla', price: 25000, category: 'Remeras', image: remeraamarilla },
    { id: 5, name: 'Remera Verde', price: 25000, category: 'Remeras', image: remeraverde },
    { id: 6, name: 'Remera Azul', price: 25000, category: 'Remeras', image: remeraazul },
    { id: 7, name: 'Remera Marron', price: 25000, category: 'Remeras', image: remeramarron },
    { id: 8, name: 'Remera Blanca', price: 25000, category: 'Remeras', image: remerablanca },
    { id: 9, name: 'Remera Negra', price: 25000, category: 'Remeras', image: remeranegra },
    { id: 10, name: 'Remera Gris', price: 25000, category: 'Remeras', image: remeragris },
    { id: 11, name: 'Remera Violeta', price: 25000, category: 'Remeras', image: remeravioleta },
    { id: 12, name: 'Remera Celeste', price: 25000, category: 'Remeras', image: remeraceleste },
    { id: 13, name: 'Pantalon Rojo', price: 25000, category: 'Pantalones', image: pantalonrojo },
    { id: 14, name: 'Pantalon Amarillo', price: 25000, category: 'Pantalones', image: pantalonamarillo },
    { id: 15, name: 'Pantalon Verde', price: 25000, category: 'Pantalones', image: pantalonverde },
    { id: 16, name: 'Pantalon Azul', price: 25000, category: 'Pantalones', image: pantalonazul },
    { id: 17, name: 'Pantalon Marron', price: 25000, category: 'Pantalones', image: pantalonmarron },
    { id: 18, name: 'Pantalon Blanco', price: 25000, category: 'Pantalones', image: pantalonblanco },
    { id: 19, name: 'Pantalon Negro', price: 25000, category: 'Pantalones', image: pantalonnegro },
    { id: 20, name: 'Pantalon Gris', price: 25000, category: 'Pantalones', image: pantalongris },
    { id: 21, name: 'Pantalon Violeta', price: 25000, category: 'Pantalones', image: pantalonvioleta },
    { id: 22, name: 'Pantalon Celeste', price: 25000, category: 'Pantalones', image: pantalonceleste }
  ]);

  const [cart, setCart] = useState([]);
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
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    const existing = cart.find(item => item.id === productId);
    if (existing.qty === 1) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item => item.id === productId ? { ...item, qty: item.qty - 1 } : item));
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Opcional: función para cerrar sesión
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    setUser({ username: '', password: '' });
    setCart([]);
    setError('');
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
            {isRegistering ? '¿Ya tenés cuenta? ' : '¿No tenés cuenta? '}
            <button
              className="link-button"
              onClick={() => {
                setError('');
                setIsRegistering(!isRegistering);
                setUser({ username: '', password: '' });
              }}
              type="button"
            >
              {isRegistering ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          </p>
          <p className="hint">admin: admin / admin123<br />cliente: cliente / user123</p>
        </div>
      ) : (
        <>
          <header className="header">
            <h1>🤎 Almendra</h1>
            <div>
              <button className="btn btn-logout" onClick={handleLogout}>Cerrar sesión</button>
            </div>
            <div className="cart-top">
              <h2>Carrito ({userRole})</h2>
              <div className="cart">
                {cart.length === 0 ? (
                  <p>El carrito está vacío.</p>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div className="cart-item" key={item.id}>
                        <img src={item.image} alt={item.name} className="cart-image" />
                        <div className="cart-info">
                          <strong>{item.name}</strong> – ${item.price.toLocaleString()} x {item.qty}
                        </div>
                        <div className="cart-controls">
                          <button className="btn btn-small" onClick={() => removeFromCart(item.id)}>-</button>
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

          <main className="catalog">
            {categories.map(category => (
              <div key={category}>
                <h2 className="category-title">{category}</h2>
                <div className="product-list">
                  {products
                    .filter(product => product.category === category)
                    .map(product => (
                      <div className="product-card" key={product.id}>
                        <img src={product.image} alt={product.name} className="product-image" />
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
