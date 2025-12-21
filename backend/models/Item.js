const mongoose = require('mongoose');

// This is the blueprint for a single item (like a drill or a book)
const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // You can't list an item without a name
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String, 
    enum: ['Tools', 'Books', 'Electronics', 'Kitchen', 'Other'], // Only these options allowed
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['Available', 'Borrowed'],
    default: 'Available'
  },
  location: {
    type: {
      type: String,
      default: 'Point' // This is for Leaflet.js maps later
    },
    coordinates: {
      type: [Number], // [Longitude, Latitude]
      required: true
    }
  },
  owner: {
    type: String, // We will link this to a User later
    required: true
  }
}, { timestamps: true }); // This automatically adds "Created At" and "Updated At" dates

module.exports = mongoose.model('Item', ItemSchema);