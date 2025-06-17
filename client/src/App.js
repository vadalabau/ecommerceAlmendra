import React, { useState } from 'react';

const products = [
  { id: 1, name: 'Remera', price: 5000 },
  { id: 2, name: 'Pantalón', price: 8500 },
  { id: 3, name: 'Zapatillas', price: 12000 },
];

function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const exists = prevCart.find((item) => item.id === product.id);
      if (exists) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Mi E-Commerce</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Productos */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Productos</h2>
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white shadow-md rounded p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-medium">{product.name}</h3>
                  <p className="text-gray-600">${product.price}</p>
                </div>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => addToCart(product)}
                >
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Carrito */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Carrito</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">El carrito está vacío.</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white shadow-md rounded p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <p className="text-gray-600">
                      ${item.price} x {item.qty}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      onClick={() => removeFromCart(item.id)}
                    >
                      -
                    </button>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      onClick={() => addToCart(item)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <div className="text-right font-bold text-lg">
                Total: ${total}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;