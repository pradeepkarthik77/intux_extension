const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

uri = "mongodb://localhost:27017"

const client = new MongoClient(uri);

const GazeDB = client.db("GazeDB");
const ClickDB = client.db("ClickDB");
const MetaDB = client.db('MetaDB');
// const MetaDB = database.collection("ClickCollection");

async function deleteCollection(db,rollNo)
{
    const collectionExists = await db.listCollections({ name: rollNo }).hasNext();
    if (collectionExists) {
        // Delete the collection
        await db.collection(rollNo).drop();
        console.log(`Collection '${rollNo}' deleted successfully.`);
    } else {
        console.log(`Collection '${rollNo}' does not exist.`);
    }
}

async function createCollection(db,rollNo)
{
    await deleteCollection(db,rollNo);
    await db.createCollection(rollNo);
}


app.post('/uploadData',async (req, res) => {
    const gazeData = req.body.gazeData;
    const clickData = req.body.clickData;
    const rollNo = req.body.rollNo;

    console.log("Received request");

    res.json({ message: 'Data received successfully' });

    await createCollection(GazeDB,rollNo);
    await createCollection(ClickDB,rollNo);

    var GazeCollection = await GazeDB.collection(rollNo);
    var ClickCollection = await ClickDB.collection(rollNo);

    gazeData.forEach((eyegaze, index) => {
        const result = GazeCollection.insertOne(eyegaze);
    });

    clickData.forEach((click,index) => {
        const result = ClickCollection.insertOne(click);
    });
    
});

app.post('/metaData',async (req, res) => {
    const rollNo = req.body.rollNo;
    const q1 = req.body.q1;
    const q2 = req.body.q2;
    const q3 = req.body.q3;
    const q4 = req.body.q4;
    const q5 = req.body.q5;
    const clickCount = req.body.clickCount;
    const screenHeight = req.body.screenHeight;
    const screenWidth = req.body.screenWidth;
    const timeTaken = req.body.timeTaken;

    console.log("Received Metadata request");

    res.json({ message: 'Data received successfully' });

    await createCollection(MetaDB,rollNo);

    var MetaCollection = await MetaDB.collection(rollNo);

    await MetaCollection.insertOne({rollNo: rollNo,q1:q1,q2:q2,q3:q3,q4:q4,q5:q5,clickCount: clickCount,screenHeight: screenHeight,screenWidth: screenWidth,timeTaken: timeTaken});
    
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
