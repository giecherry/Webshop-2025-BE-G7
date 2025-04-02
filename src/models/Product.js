import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: ''
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);