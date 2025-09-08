const { MongoClient } = require('mongodb');

const buildings = [
  {
    _id: "bld-ch-01",
    name: "CH-A",
    city: "Chennai",
    capacityKw: 1200,
    expectedKw: 860,
    actualKw: 712,
    efficiency: 712 / 860,
    status: "warn",
    lastUpdated: new Date().toISOString(),
    coords: { lat: 13.0827, lng: 80.2707 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "bld-th-01",
    name: "Th-A",
    city: "Thiruvallur",
    capacityKw: 980,
    expectedKw: 730,
    actualKw: 710,
    efficiency: 710 / 730,
    status: "ok",
    lastUpdated: new Date().toISOString(),
    coords: { lat: 13.6288, lng: 79.8878 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "bld-ka-01",
    name: "ABC Block",
    city: "Kancheepuram",
    capacityKw: 1050,
    expectedKw: 800,
    actualKw: 590,
    efficiency: 590 / 800,
    status: "critical",
    lastUpdated: new Date().toISOString(),
    coords: { lat: 12.8185, lng: 79.7037 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "bld-che-01",
    name: "Lakeshore Campus",
    city: "Chengalpet",
    capacityKw: 1100,
    expectedKw: 810,
    actualKw: 725,
    efficiency: 725 / 810,
    status: "ok",
    lastUpdated: new Date().toISOString(),
    coords: { lat: 12.6819, lng: 79.9864 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "bld-tri-01",
    name: "Trinity Park Hub",
    city: "Trichy",
    capacityKw: 900,
    expectedKw: 670,
    actualKw: 510,
    efficiency: 510 / 670,
    status: "critical",
    lastUpdated: new Date().toISOString(),
    coords: { lat: 10.7905, lng: 78.7047 },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI environment variable is required. Please check your .env.local file');
    process.exit(1);
  }

  // Validate URI format
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error('Invalid MONGO_URI format. Must start with mongodb:// or mongodb+srv://');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    
    // Clear existing data
    await db.collection('buildings').deleteMany({});
    await db.collection('power_history').deleteMany({});
    await db.collection('alerts').deleteMany({});
    
    // Insert buildings
    await db.collection('buildings').insertMany(buildings);
    console.log('Inserted buildings data');

    // Create indexes
    await db.collection('buildings').createIndex({ city: 1 });
    await db.collection('buildings').createIndex({ status: 1 });
    await db.collection('power_history').createIndex({ buildingId: 1, timestamp: -1 });
    await db.collection('alerts').createIndex({ buildingId: 1, timestamp: -1 });
    await db.collection('alerts').createIndex({ severity: 1, acknowledged: 1 });
    
    console.log('Created indexes');
    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();