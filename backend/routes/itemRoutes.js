const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// ROUTE 1: Get all items in the neighborhood
router.get('/all', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ROUTE 2: Post a new item to lend
router.post('/add', async (req, res) => {
  const newItem = new Item({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    owner: req.body.owner,
    location: {
      coordinates: req.body.coordinates // Expecting [lng, lat]
    }
  });

  try {
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;