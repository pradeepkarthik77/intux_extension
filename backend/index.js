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
const ClickCollection = database.collection("ClickCollection");

app.post('/uploadData', (req, res) => {
    const gazeData = req.body.gazeData;
    const clickData = req.body.clickData;
    const rollNo = req.body.rollNo;
    
    gazeData.forEach((eyegaze, index) => {
        let objtoStore = {rollNo: rollNo, x: eyegaze.x, y: eyegaze.y, timestamp: eyegaze.timestamp};
        const result = EyeGazeCollection.insertOne(objtoStore);
    });

    clickData.forEach((click,index) => {
        let objtoStore = {rollNo: rollNo, x: click.x, y: click.y, timestamp: click.timestamp};
        const result = ClickCollection.insertOne(objtoStore);
    });

    res.json({ message: 'Data received successfully' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
