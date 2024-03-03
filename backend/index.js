const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const config = require("./config.json");
const admin = require('firebase-admin');
const multer = require('multer');
const serviceAccount = require('./serviceAccountKey.json');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 8080;

app.use(express.json({ limit: '30mb' }));
app.use(cors());
app.use(bodyParser.json());
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'intuxforyou.appspot.com', //Firebase Storage bucket name
});

const storage = admin.storage();
const upload = multer();

uri = config.MONGO_URI;

const client = new MongoClient(uri);

const GazeDB = client.db("GazeDB2");
const ClickDB = client.db("ClickDB2");
const MetaDB = client.db('MetaDB2');
// const MetaDB = database.collection("ClickCollection");

const INTUX = client.db('INTUX2');

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

async function normalizeCollections(rollNo,screen_height,screen_width)
{
    GazeRoll = await GazeDB.collection(rollNo);
    ClickRoll  = await ClickDB.collection(rollNo);

    const result = await GazeRoll.updateMany({},
        [
            {
                $set: {
                    'normalizedX': { $divide: [{ $toDouble: '$x' }, { $toDouble: screen_width }] },
                    'normalizedY': { $divide: [{ $toDouble: '$y' }, { $toDouble: screen_height }] },
                    'rollNo': rollNo
            }
            }
        ],
        (err, result) => {
            if (err) {
                console.error(err);
            }
        }
    );

    res = await ClickRoll.updateMany({},
        [
            {
                $set: {
                    'normalizedX': { $divide: [{ $toDouble: '$x' }, { $toDouble: screen_width }] },
                    'normalizedY': { $divide: [{ $toDouble: '$y' }, { $toDouble: screen_height }] },
                    'rollNo': rollNo
            }
            }
        ],
        (err, result) => {
            if (err) {
                console.error(err);
            }
        }
    );

    console.log(res)

    // Find the minimum timestamp in the collection
    const minTimestampResult = await GazeRoll.aggregate([
        { $group: { _id: null, minTimestamp: { $min: '$timestamp' } } }
      ]).toArray();
  
      if (minTimestampResult.length === 0) {
        throw new Error('Collection is empty');
      }
  
      const minTimestamp = minTimestampResult[0].minTimestamp;
  
      // Update each document with the normalizedTimestamp field
      await GazeRoll.updateMany({}, [
        { $set: { normalizedTimestamp: { $subtract: ['$timestamp', minTimestamp] } } }
      ]);

      await ClickRoll.updateMany({}, [
        { $set: { normalizedTimestamp: { $subtract: ['$timestamp', minTimestamp] } } }
      ]);
}

async function moveNnormalize(rollNo)
{

    MetaCollection = MetaDB.collection(rollNo);

    GazeData = INTUX.collection("GazeData");
    MetaData = INTUX.collection("MetaData");
    ClickData = INTUX.collection("ClickData");

    var screen_height;
    var screen_width;

    const data = await MetaData.findOne({"rollNo": rollNo})

    console.log(data)

    if(data != null)  //logic to update
    {
        console.log(data)

        GazeData.deleteMany({ 'rollNo': rollNo }, (err, result) => {
            if (err) {
                console.error(err);
                return;
            }
        });

        ClickData.deleteMany({ 'rollNo': rollNo }, (err, result) => {
            if (err) {
                console.error(err);
                return;
            }
        });

        MetaData.deleteMany({ 'rollNo': rollNo }, (err, result) => {
            if (err) {
                console.error(err);
                return;
            }
        })

        console.log("Deleted em all");
        
    }

    screen_details = await MetaDB.collection(rollNo).findOne({ 'rollNo': rollNo})

    try{
    screen_height = screen_details.screenHeight;
    screen_width = screen_details.screenWidth;
    }
    catch(err){
        console.log(rollNo)
    }

    await normalizeCollections(rollNo,screen_height,screen_width)

    gazerolldata = await GazeDB.collection(rollNo).find({}).toArray();
    clickrolldata = await ClickDB.collection(rollNo).find({}).toArray();
    metarolldata = await MetaDB.collection(rollNo).find({}).toArray();

    console.log(gazerolldata);


    await GazeData.insertMany(gazerolldata);
    await ClickData.insertMany(clickrolldata);
    await MetaData.insertMany(metarolldata);

    //TODO: Logic for storing the values into ClickData and GazeData and MetaData

    // MetaDB.collection(rollNo).findOne({ 'rollNo': rollNo }, (err, result) => {
    //     if(err)
    //     {
    //         console.log(err)
    //     }
    //     else{
    //         screen_height = result.screenHeight;
    //         screen_width = result.screenWidth;

    //         console.log(screen_height,screen_width);
    //     }
    // })

    // await normalizeCollections(rollNo,screen_height,screen_width)
    
}

// async function iterateandNormalize()
// {
//     MetaData = INTUX.collection("MetaData");

//     rollNos = await MetaData.distinct("rollNo");

//     rollNos.forEach(async (rollNo) => {
//         await moveNnormalize(rollNo);
//     })

// }

// iterateandNormalize();

    // MetaData.findOne({"rollNo":rollNo}, (err, data) => {

    //     console.log("data",data)

        // if(err)
        // {
        //     console.log(err)
        // }
        // else{
        //     console.log(data)
            
        //     if(data != null)  //logic to update
        //     {
        //         console.log(data)

        //         GazeData.deleteMany({ 'rollNo': rollNo }, (err, result) => {
        //             if (err) {
        //                 console.error(err);
        //                 return;
        //             }
        //         });

        //         ClickData.deleteMany({ 'rollNo': rollNo }, (err, result) => {
        //             if (err) {
        //                 console.error(err);
        //                 return;
        //             }
        //         });

        //         MetaData.deleteMany({ 'rollNo': rollNo }, (err, result) => {
        //             if (err) {
        //                 console.error(err);
        //                 return;
        //             }
        //         })

        //         console.log("Deleted em all");
                
        //     }

        //     MetaDB.collection(rollNo).findOne({ 'rollNo': rollNo }, (err, result) => {
        //         if(err)
        //         {
        //             console.log(err)
        //         }
        //         else{
        //             screen_height = result.screenHeight;
        //             screen_width = result.screenWidth;

        //             console.log(screen_height,screen_width);
        //         }
        //     })

        //     await normalizeCollections(rollNo,screen_height,screen_width)
            
        // }
    // })

function convertTimeToSeconds(timeString) {
    const [minutes, seconds] = timeString.split(':');
    const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
    return totalSeconds;
}

function executeIndividualHeatmapUpload(rollNo)
{

    const command = `cd "${path.join(__dirname, 'Heatmap')}" && python3 IndividualHeatmap.py ${rollNo}`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

function executeIndividualClickmapUpload(rollNo)
{

    const command = `cd "${path.join(__dirname, 'Clickmap')}" && python3 clickmap.py ${rollNo}`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

function executeCumulativeHeatmap()
{

    const command = `cd "${path.join(__dirname, 'Heatmap')}" && python3 CumulativeHeatmap.py`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

function executeCumulativeClickmap()
{

    const command = `cd "${path.join(__dirname, 'Clickmap')}" && python3 Cumulative-clickmap.py`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

function executeIndividualFixationMap(rollNo)
{

    const command = `cd "${path.join(__dirname, 'Fixation')}" && python3 fixation.py ${rollNo}`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
}

app.post("/returnMetaData",async (req, res) => {
    try {
        
        // Fetch data from MetaData collection
        const metaDataCollection = INTUX.collection('MetaData');
        const metaData = await metaDataCollection.find({}).toArray();

        // Calculate total users
        const totalUsers = metaData.length;

        // Construct the response object
        const userData = {};
        metaData.forEach(entry => {
            const { rollNo, timeTaken, clickCount } = entry;
            if (!userData[rollNo]) {
                userData[rollNo] = [];
            }
            userData[rollNo].push(convertTimeToSeconds(timeTaken), clickCount);
        });

        // Send response
        res.json({ totalUsers, userData });

        // Close MongoDB connection
        client.close();
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.post("/distinctRollNos", async (req, res) => {
    try {
        // Fetch distinct roll numbers from MetaData collection
        const metaDataCollection = INTUX.collection('MetaData');
        const distinctRollNos = await metaDataCollection.distinct('rollNo');

        // Send response
        res.json({ distinctRollNos });

        // Close MongoDB connection
        client.close();
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
})


app.post('/saveRecording', upload.single('recording'), async (req, res) => {
    try {
        console.log('In Server Saving recording')
        const rollNo = req.body.rollNo;

        const fileRef = storage.bucket().file(`recordings/${rollNo}.webm`);
        await fileRef.save(req.file.buffer);

        // Get the download URL of the uploaded file
        const fileUrl = await fileRef.getSignedUrl({ action: 'read', expires: '03-09-2491' });

        // You can also store additional metadata if needed
        const metadata = {
            contentType: req.file.mimetype,
            // Add more metadata properties as needed
        };

        await fileRef.setMetadata(metadata);
        console.log("fileURl", fileUrl[0] )

        res.json({ success: true, fileUrl: fileUrl[0] });
    } catch (error) {
        console.error("error in server wjile save recording", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/uploadData',upload.single('file'), async (req, res) => {
    try {
        var gazeData = JSON.parse(req.body.gazeData);
        var clickData = JSON.parse(req.body.clickData);
        var rollNo = req.body.rollNo;
        var clickCount = req.body.clickCount;
        var screenHeight = req.body.screenHeight;
        var screenWidth = req.body.screenWidth;
        var timeTaken = req.body.timeTaken;

        console.log(typeof gazeData)

        try {
            console.log('In Server Saving recording')
            // const rollNo = req.body.rollNo;
    
            // const fileRef = storage.bucket().file(`recordings/${rollNo}.webm`);
            // await fileRef.save(req.file.buffer);
    
            // // Get the download URL of the uploaded file
            // const fileUrl = await fileRef.getSignedUrl({ action: 'read', expires: '03-09-2491' });
    
            // // You can also store additional metadata if needed
            // const metadata = {
            //     contentType: req.file.mimetype,
            //     // Add more metadata properties as needed
            // };
    
            // await fileRef.setMetadata(metadata);
            // console.log("fileURl", fileUrl[0] )

            } catch (error) {
                console.error("error in server wjile save recording", error);
                res.status(500).json({ success: false, error: error.message });
                return;
            }
            
            await createCollection(GazeDB,rollNo);
            await createCollection(ClickDB,rollNo);
            await createCollection(MetaDB,rollNo);

            var GazeCollection = await GazeDB.collection(rollNo);
            var ClickCollection = await ClickDB.collection(rollNo);
            var MetaCollection = await MetaDB.collection(rollNo);

            await MetaCollection.insertOne({rollNo: rollNo,clickCount: clickCount,screenHeight: screenHeight,screenWidth: screenWidth,timeTaken: timeTaken});

            gazeData.forEach(async (eyegaze, index) => {
                const result = await GazeCollection.insertOne(eyegaze);
            });

            clickData.forEach(async (click,index) => {
                const result = await ClickCollection.insertOne(click);
            });

            console.log("Done");

        res.json({ message: 'Data received successfully' });

        await moveNnormalize(rollNo);

        console.log("Finished normalzation")

        // executeIndividualHeatmapUpload(rollNo)

        // executeCumulativeHeatmap()

        // executeIndividualFixationMap(rollNo)

        // executeIndividualClickmapUpload(rollNo)
        
        // executeCumulativeClickmap()


    } catch (error) {
        console.error("Error in server while processing request", error);
        res.status(500).json({ success: false, error: error.message });
    }
});



// app.post('/uploadData',async (req, res) => {
//     const gazeData = req.body.gazeData;
//     const clickData = req.body.clickData;
//     const rollNo = req.body.rollNo;
//     const q1 = req.body.q1;
//     const q2 = req.body.q2;
//     const q3 = req.body.q3;
//     const q4 = req.body.q4;
//     const q5 = req.body.q5;
//     const videoURL = req.body.videoURL;
//     const clickCount = req.body.clickCount;
//     const screenHeight = req.body.screenHeight;
//     const screenWidth = req.body.screenWidth;
//     const timeTaken = req.body.timeTaken;

//     console.log("Received request");

//     console.log(req.body)

//     res.json({ message: 'Data received successfully' });

//     return;

//     await createCollection(GazeDB,rollNo);
//     await createCollection(ClickDB,rollNo);
//     await createCollection(MetaDB,rollNo);

//     var GazeCollection = await GazeDB.collection(rollNo);
//     var ClickCollection = await ClickDB.collection(rollNo);
//     var MetaCollection = await MetaDB.collection(rollNo);

//     await MetaCollection.insertOne({rollNo: rollNo,q1:q1,q2:q2,q3:q3,q4:q4,q5:q5,clickCount: clickCount,screenHeight: screenHeight,screenWidth: screenWidth,timeTaken: timeTaken});

//     gazeData.forEach(async (eyegaze, index) => {
//         const result = await GazeCollection.insertOne(eyegaze);
//     });

//     clickData.forEach(async (click,index) => {
//         const result = await ClickCollection.insertOne(click);
//     });

//     // try {
//     //     console.log('In Server Saving recording')

//     //     const fileRef = storage.bucket().file(`recordings/${rollNo}.webm`);
//     //     await fileRef.save(req.file.buffer);

//     //     // Get the download URL of the uploaded file
//     //     const fileUrl = await fileRef.getSignedUrl({ action: 'read', expires: '03-09-2491' });

//     //     // You can also store additional metadata if needed
//     //     const metadata = {
//     //         contentType: req.file.mimetype,
//     //         // Add more metadata properties as needed
//     //     };

//     //     await fileRef.setMetadata(metadata);
//     //     console.log("fileURl", fileUrl[0] )

//     //     res.json({ success: true, fileUrl: fileUrl[0] });
//     // } catch (error) {
//     //     console.error("error in server wjile save recording", error);
//     //     res.status(500).json({ success: false, error: error.message });
//     // }

//     console.log("Done");
    
// });

// app.post('/metaData',async (req, res) => {
    

//     console.log("Received Metadata request");

//     res.json({ message: 'Data received successfully' });

// });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});