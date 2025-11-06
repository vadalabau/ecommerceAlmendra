const express = require('express');
const router = express.Router();
const { Product, Category } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Obtener todos los productos (público)
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, featured, limit = 50, page = 1 } = req.query;
    
    const query = { isActive: true };
    
    // Filtros
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener producto por ID o slug (público)
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const product = await Product.findOne({
      $or: [
        { _id: identifier },
        { slug: identifier }
      ],
      isActive: true
    }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Crear producto (solo admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    await product.populate('category', 'name slug');
    
    res.status(201).json({
      message: 'Producto creado exitosamente',
      product
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(400).json({ error: 'Error al crear producto', details: error.message });
  }
});

// Actualizar producto (solo admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({
      message: 'Producto actualizado exitosamente',
      product
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(400).json({ error: 'Error al actualizar producto', details: error.message });
  }
});

// Eliminar producto (solo admin) - soft delete
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
