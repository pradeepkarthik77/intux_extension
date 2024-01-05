const { MongoClient } = require('mongodb');

async function deleteDocuments() {
  const uri = 'mongodb://localhost:27017/';

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();

    const INTUX = client.db('INTUX');

    const GazeData = INTUX.collection('GazeData');
    const ClickData = INTUX.collection('ClickData');
    const MetaData = INTUX.collection('MetaData');

    // Delete all documents where the specified field starts with "TEST"
    deleteResult = await GazeData.deleteMany({ rollNo: /^TEST/ });
    deleteResult = await ClickData.deleteMany({ rollNo: /^TEST/ });
    deleteResult = await MetaData.deleteMany({ rollNo: /^TEST/ });


    console.log(`documents deleted successfully in INTUX!`);

    const GazeDB = client.db("GazeDB");
    const ClickDB = client.db("ClickDB");
    const MetaDB = client.db("MetaDB");

    const collections = await MetaDB.listCollections().toArray();

    for (const collection of collections) {
        const collectionName = collection.name;
  
        if (collectionName.startsWith('TEST')) {
          await MetaDB.dropCollection(collectionName);
          await GazeDB.dropCollection(collectionName);
          await ClickDB.dropCollection(collectionName);

          console.log(`Collection ${collectionName} dropped successfully!`);
        }
      }

  } finally {
    await client.close();
  }
}

// Call the function to delete documents
deleteDocuments();
