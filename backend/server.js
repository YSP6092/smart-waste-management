const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://smart-waste-management-azure.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://smart-waste-management-azure.vercel.app"  // Add your Vercel URL
  ],
  credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// MongoDB Schema
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
// Reverse geocode - get location name from coordinates
async function getLocationName(lat, lng) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    
    if (response.data && response.data.address) {
      const addr = response.data.address;
      return addr.amenity || addr.building || addr.road || addr.suburb || addr.neighbourhood || 'Unknown Location';
    }
    return 'Unknown Location';
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return 'Unknown Location';
  }
}
// Auto-seed database if empty
async function seedIfEmpty() {
  try {
    const count = await Bin.countDocuments();
    
    if (count === 0) {
      console.log('📦 Database empty, seeding initial bins...');
      
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
      
      await Bin.insertMany(initialBins);
      console.log(' Seeded 10 bins successfully');
    } else {
      console.log(` Database has ${count} bins, skipping seed`);
    }
  } catch (error) {
    console.error(' Seeding error:', error);
  }
}
// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Waste Management API',
    status: 'Running',
    endpoints: {
      health: '/api/health',
      bins: '/api/bins',
      docs: 'https://github.com/YOUR_USERNAME/smart-waste-management'
    }
  });
});
// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running!',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Get all bins
app.get('/api/bins', async (req, res) => {
  try {
    const bins = await Bin.find();
    res.json(bins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new bin
app.post('/api/bins', async (req, res) => {
  try {
    const newBin = new Bin({
      ...req.body,
      lastUpdate: new Date()
    });
    await newBin.save();
    
    const allBins = await Bin.find();
    io.emit('binUpdate', allBins);
    
    res.status(201).json(newBin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update bin
app.put('/api/bins/:id', async (req, res) => {
  try {
    const bin = await Bin.findOneAndUpdate(
      { binId: req.params.id },
      { ...req.body, lastUpdate: new Date() },
      { new: true }
    );
    
    if (!bin) {
      return res.status(404).json({ message: 'Bin not found' });
    }
    
    const allBins = await Bin.find();
    io.emit('binUpdate', allBins);
    
    res.json(bin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete bin
app.delete('/api/bins/:id', async (req, res) => {
  try {
    const bin = await Bin.findOneAndDelete({ binId: req.params.id });
    
    if (!bin) {
      return res.status(404).json({ message: 'Bin not found' });
    }
    
    const allBins = await Bin.find();
    io.emit('binUpdate', allBins);
    
    res.json({ message: 'Bin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Update all bins with real location names
app.post('/api/bins/update-locations', async (req, res) => {
  try {
    const bins = await Bin.find();
    let updated = 0;
    
    for (let bin of bins) {
      const locationName = await getLocationName(bin.coordinates.lat, bin.coordinates.lng);
      await Bin.findOneAndUpdate(
        { binId: bin.binId },
        { location: locationName }
      );
      updated++;
      console.log(`✅ Updated ${bin.binId}: ${locationName}`);
      
      // Delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    const allBins = await Bin.find();
    io.emit('binUpdate', allBins);
    
    res.json({ message: `Updated ${updated} bins with real location names` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Socket.io connection
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Simulate IoT sensor updates
async function simulateSensorUpdates() {
  setInterval(async () => {
    try {
      const bins = await Bin.find();
      
      for (let bin of bins) {
        let newFillLevel = bin.fillLevel + (Math.random() * 3);
        
        if (newFillLevel >= 100) {
          newFillLevel = Math.random() * 15;
          console.log(`🗑️ ${bin.binId} collected - Reset to ${newFillLevel.toFixed(1)}%`);
        }
        
        let status = 'normal';
        if (newFillLevel >= 80) status = 'critical';
        else if (newFillLevel >= 60) status = 'warning';
        
        let newBattery = Math.max(20, bin.battery - (Math.random() * 0.5));
        let newTemp = 25 + (Math.random() * 8);
        
        await Bin.findOneAndUpdate(
          { binId: bin.binId },
          {
            fillLevel: parseFloat(newFillLevel.toFixed(1)),
            status: status,
            battery: parseFloat(newBattery.toFixed(1)),
            temperature: parseFloat(newTemp.toFixed(1)),
            lastUpdate: new Date()
          }
        );
      }
      
      const allBins = await Bin.find();
      io.emit('binUpdate', allBins);
    } catch (error) {
      console.error('Simulation error:', error);
    }
  }, 5000);
}

// Start simulation after MongoDB connects
// Start simulation and seed after MongoDB connects
mongoose.connection.once('open', async () => {
  await seedIfEmpty();
  simulateSensorUpdates();
  console.log('✅ IoT simulation started');
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});