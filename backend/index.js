const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const config = require("./config.json");
const admin = require('firebase-admin');
const multer = require('multer');
const serviceAccount = require('./serviceAccountKey.json');

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

uri = config.MONGO_LOCAL;

const client = new MongoClient(uri);

const GazeDB = client.db("GazeDB");
const ClickDB = client.db("ClickDB");
const MetaDB = client.db('MetaDB');
// const MetaDB = database.collection("ClickCollection");

const INTUX = client.db('INTUX');

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

    screen_height = screen_details.screenHeight;
    screen_width = screen_details.screenWidth;

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
