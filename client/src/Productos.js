import React, { useEffect, useState } from 'react';

function Productos({ agregarAlCarrito }) {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/productos')
      .then(res => res.json())
      .then(data => setProductos(data));
  }, []);

  return (
    <div>
      <h2>Productos</h2>
      <ul>
        {productos.map(p => (
          <li key={p._id}>
            {p.nombre} - ${p.precio}
            <button onClick={() => agregarAlCarrito(p)}>Agregar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Productos;