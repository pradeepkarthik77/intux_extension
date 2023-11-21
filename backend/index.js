const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/uploadData', (req, res) => {
    const receivedData = req.body.data;
    const rollNo = req.body.rollNo;
    
    console.log('Received data:', receivedData);
    console.log(rollNo);

    res.json({ message: 'Data received successfully' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
