import React from 'react';

function Carrito({ carrito }) {
  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  return (
    <div>
      <h2>Carrito</h2>
      <ul>
        {carrito.map(item => (
          <li key={item._id}>
            {item.nombre} x {item.cantidad} = ${item.precio * item.cantidad}
          </li>
        ))}
      </ul>
      <h3>Total: ${total}</h3>
    </div>
  );
}

export default Carrito;