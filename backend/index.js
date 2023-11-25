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

const database = client.db("intuxDB");
const EyeGazeCollection = database.collection("EyeGazeCollection");

app.post('/uploadData', (req, res) => {
    const receivedData = req.body.data;
    const rollNo = req.body.rollNo;
    
    receivedData.forEach((eyegaze, index) => {
        let objtoStore = {rollNo: rollNo, x: eyegaze.x, y: eyegaze.y, timestamp: eyegaze.timestamp};
        const result = EyeGazeCollection.insertOne(objtoStore);
    });

    res.json({ message: 'Data received successfully' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
