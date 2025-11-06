const express = require('express');
const router = express.Router();
const { Order, Product } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Obtener órdenes del usuario autenticado
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

// Obtener todas las órdenes (solo admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name image')
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

// Obtener orden por ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name image price');

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // Verificar que el usuario sea el dueño o admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({ error: 'Error al obtener orden' });
  }
});

// Crear orden
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, shippingAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'La orden debe tener al menos un producto' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'La dirección de envío es requerida' });
    }

    // Validar productos y calcular total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive) {
        return res.status(400).json({ error: `Producto ${item.product} no disponible` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}` 
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.image,
        size: item.size,
        color: item.color
      });

      totalAmount += product.price * item.quantity;

      // Reducir stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Crear orden
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      notes,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.populate('items.product', 'name image');

    res.status(201).json({
      message: 'Orden creada exitosamente',
      order
    });
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ error: 'Error al crear orden', details: error.message });
  }
});

// Actualizar estado de orden (solo admin)
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json({
      message: 'Estado actualizado exitosamente',
      order
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// Actualizar estado de pago (solo admin)
router.patch('/:id/payment', authenticate, requireAdmin, async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;

    if (!['pending', 'approved', 'rejected', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Estado de pago inválido' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentId },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json({
      message: 'Estado de pago actualizado exitosamente',
      order
    });
  } catch (error) {
    console.error('Error al actualizar pago:', error);
    res.status(500).json({ error: 'Error al actualizar pago' });
  }
});

module.exports = router;
