const mongoose = require('mongoose');
require('dotenv').config();

const binSchema = new mongoose.Schema({
  binId: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  fillLevel: { type: Number, default: 0 },
  battery: { type: Number, default: 100 },
  temperature: { type: Number, default: 25 },
  status: { type: String, default: 'normal' },
  lastUpdate: { type: Date, default: Date.now }
});

const Bin = mongoose.model('Bin', binSchema);

const initialBins = [
  {
    binId: 'BIN001',
    location: 'Park Avenue',
    coordinates: { lat: 21.1458, lng: 79.0882 },
    fillLevel: 25,
    battery: 85,
    temperature: 28,
    status: 'normal'
  },
  {
    binId: 'BIN002',
    location: 'Main Street',
    coordinates: { lat: 21.1498, lng: 79.0915 },
    fillLevel: 45,
    battery: 90,
    temperature: 26,
    status: 'normal'
  },
  {
    binId: 'BIN003',
    location: 'Central Plaza',
    coordinates: { lat: 21.1478, lng: 79.0898 },
    fillLevel: 75,
    battery: 65,
    temperature: 30,
    status: 'warning'
  },
  {
    binId: 'BIN004',
    location: 'East Zone Mall',
    coordinates: { lat: 21.1428, lng: 79.0865 },
    fillLevel: 15,
    battery: 95,
    temperature: 25,
    status: 'normal'
  },
  {
    binId: 'BIN005',
    location: 'West Market',
    coordinates: { lat: 21.1438, lng: 79.0845 },
    fillLevel: 88,
    battery: 70,
    temperature: 29,
    status: 'critical'
  },
  {
    binId: 'BIN006',
    location: 'North Station',
    coordinates: { lat: 21.1508, lng: 79.0888 },
    fillLevel: 55,
    battery: 80,
    temperature: 27,
    status: 'warning'
  },
  {
    binId: 'BIN007',
    location: 'South Garden',
    coordinates: { lat: 21.1398, lng: 79.0875 },
    fillLevel: 35,
    battery: 88,
    temperature: 26,
    status: 'normal'
  },
  {
    binId: 'BIN008',
    location: 'City Hospital',
    coordinates: { lat: 21.1468, lng: 79.0910 },
    fillLevel: 92,
    battery: 55,
    temperature: 31,
    status: 'critical'
  },
  {
    binId: 'BIN009',
    location: 'University Campus',
    coordinates: { lat: 21.1488, lng: 79.0855 },
    fillLevel: 40,
    battery: 92,
    temperature: 25,
    status: 'normal'
  },
  {
    binId: 'BIN010',
    location: 'Sports Complex',
    coordinates: { lat: 21.1448, lng: 79.0920 },
    fillLevel: 68,
    battery: 75,
    temperature: 28,
    status: 'warning'
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected to MongoDB');
    
    await Bin.deleteMany({});
    console.log(' Cleared existing bins');
    
    await Bin.insertMany(initialBins);
    console.log('Seeded', initialBins.length, 'bins');
    
    process.exit(0);
  } catch (error) {
    console.error(' Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();