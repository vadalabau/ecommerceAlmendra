const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Obtener todas las categorías (público)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Obtener categoría por ID o slug (público)
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const category = await Category.findOne({
      $or: [
        { _id: identifier },
        { slug: identifier }
      ],
      isActive: true
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
});

// Crear categoría (solo admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = await Category.create(req.body);
    
    res.status(201).json({
      message: 'Categoría creada exitosamente',
      category
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(400).json({ error: 'Error al crear categoría', details: error.message });
  }
});

// Actualizar categoría (solo admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({
      message: 'Categoría actualizada exitosamente',
      category
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(400).json({ error: 'Error al actualizar categoría', details: error.message });
  }
});

// Eliminar categoría (solo admin) - soft delete
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

module.exports = router;
