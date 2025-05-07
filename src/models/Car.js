const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
  name: { type: String, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  transmission: { type: String, required: true, enum: ['Automatic', 'Manual', 'CVT', 'Semi-Automatic'] },
  engineSize: { type: String, required: true },
  condition: { type: String, required: true, enum: ['New', 'Used', 'Certified Pre-Owned'] },
  price: { type: Number, required: true },
  mileage: { type: Number, required: true },
  fuelType: { type: String, required: true, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'] },
  bodyType: { type: String, required: true, enum: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Truck'] },
  color: { type: String, required: true },
  features: [{ type: String }],
  images: [{ type: String }], // Array of S3 URLs
  status: { type: String, default: 'Available', enum: ['Available', 'Sold', 'Reserved'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp on save
carSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for commonly queried fields
carSchema.index({ make: 1 });
carSchema.index({ model: 1 });
carSchema.index({ year: 1 });
carSchema.index({ price: 1 });
carSchema.index({ dealer: 1 });
carSchema.index({ status: 1 });

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
