import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true
});


categorySchema.pre('save', function(next) {
  if (!this.isModified('name') && this.slug) return next();
  
  // Normalisera unicode-tecken och ta bort diakritiska tecken
  let slugText = this.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/å/gi, 'a')
    .replace(/ä/gi, 'a')
    .replace(/ö/gi, 'o')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  this.slug = slugText;
  next();
});

export default mongoose.model('Category', categorySchema); 