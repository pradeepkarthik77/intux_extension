appendLoop = '';
eyeData = [];
runs = 0;

var webgazerInitialized = false;

if(sessionStorage.getItem("ExtensionURL") == window.location.hostname)
{
    console.log("Proceeding to continue");
    setTimeout(initGazer,1000);
    setTimeout(removeOverlay,500);
    setTimeout(setDBstore,500);
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === 'enabledWebgazer') {

            var hostname = window.location.hostname;
            sessionStorage.setItem('ExtensionURL', hostname);

            if (!webgazerInitialized) {
                initGazer();
                webgazerInitialized = true;
            }

            setTimeout(removeOverlay,500);
            setTimeout(setDBstore,500);
            // createCalibration();
        }
        else if(request.message === 'enableCalibration')
        {
            var hostname = window.location.hostname;
            sessionStorage.setItem('ExtensionURL', hostname);

            createCalibration();
        }
        else if(request.message === 'disabledWebgazer') {
            endGazer();
        }
        else if(request.message === 'saveRollNo')
        {
            localStorage.setItem('rollNo',request.rollno);
            console.log("saved value "+request.rollno);
        }
    }
);

function initGazer() {

            localStorage.setItem('hasEnteredListener', 'false');

            webgazer.setRegression('ridge')
            .begin();

            console.log("Ridge regression");

            webgazer.showVideoPreview(true) /* shows all video previews */
            .showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
            .applyKalmanFilter(true); /* Ka*/
}


function getCenterCoordinates(element) {
    // Get the bounding box of the element
    const rect = element.getBoundingClientRect();

    // Calculate the center coordinates relative to the viewport
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    return { x: centerX, y: centerY };
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    }

function simulateClick(x, y) {
    // Find the element at the specified coordinates
    const element = document.elementFromPoint(x, y);


    console.log("Called me");

    // Check if the element is found
    if (element) {
        // Simulate 10 clicks with intervals
        for (let i = 0; i < 10; i++) {
            // Use setTimeout to introduce a delay between clicks
            setTimeout(() => {
                // Create a new MouseEvent with the type 'click' and appropriate coordinates
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    clientX: x,
                    clientY: y
                });

                // Dispatch the click event to the element
                element.dispatchEvent(clickEvent);

                // Log information about the simulated click
                console.log(`Simulated click ${i + 1} on coordinates:`, { x, y });
            }, 50);
        }
    } else {
        console.log('No element found at coordinates:', { x, y });
    }
}

function goUntilMidTop(iteration,direction,limit,container,elem,currentValue)
{
    var newvalue = currentValue;

    var speed = 10;

    let timer = setInterval(function() {

    if(direction == "left")
    {
        newvalue+=speed;
        elem.style.left = newvalue+'px';
    }
    else if(direction == "bottom")
    {
        newvalue+=speed;
        elem.style.top = newvalue+'px';
    }
    else if(direction == "right")
    {
        newvalue-=speed;
        elem.style.left = newvalue+'px';
    }

    centerCoord = getCenterCoordinates(elem);

    var compareVal = 0;

    if(direction == "left")
    {
        compareVal = centerCoord.x;
    }
    else if(direction == "bottom")
    {
        compareVal = centerCoord.y;
    }
    else if(direction == "right")
    {
        compareVal = centerCoord.x;
    }

    var boole = false;

    if(direction == "left")
    {
        boole = compareVal >=limit;
    }
    else if(direction == "bottom")
    {
        boole = compareVal >= limit;
    }
    else if(direction == "right")
    {
        boole = compareVal <= limit;
    }

    if(boole)
    {
        clearInterval(timer);

        customTime = 2000;

        simulateClick(centerCoord.x,centerCoord.y);

        let start = Date.now();
        
        let innertimer = setInterval(function() {
            let timePassed = Date.now() - start;
        
            // Calculate rotation angle based on timePassed
            let rotationAngle = (timePassed / customTime) * 360; // 360 degrees for 2 seconds
        
            // Apply rotation to the element
            elem.style.transform = 'rotate(' + rotationAngle + 'deg)';
        
            if (timePassed > customTime) clearInterval(innertimer);
        
        }, 50);

        if(iteration == 1)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"left",container.offsetWidth/2,container,elem,getCenterCoordinates(elem).x);
            })
        }

        if(iteration == 2)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"left",container.offsetWidth*(0.75),container,elem,getCenterCoordinates(elem).x);
            })
        }

        if(iteration == 3)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"left",container.offsetWidth-50,container,elem,getCenterCoordinates(elem).x);
            })
        }

        //above code is until first line


        else if(iteration == 4)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"bottom",container.offsetHeight/2,container,elem,getCenterCoordinates(elem).y);
            })
        }

        else if(iteration == 5)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"right",container.offsetWidth*(0.75),container,elem,getCenterCoordinates(elem).x);
            })
        }

        else if(iteration == 6)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"right",container.offsetWidth/2,container,elem,getCenterCoordinates(elem).x);
            })
        }

        else if(iteration == 7)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"right",container.offsetWidth/4,container,elem,getCenterCoordinates(elem).x);
            })
        }

        else if(iteration == 8)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"right",50,container,elem,getCenterCoordinates(elem).x);
            })
        }

        //above code for 5 point calibration in line 2

        else if(iteration == 9)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"bottom",container.offsetHeight-50,container,elem,getCenterCoordinates(elem).y);
            })
        }

        else if(iteration == 10)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"left",container.offsetWidth/4,container,elem,getCenterCoordinates(elem).x);
            })
        }

        else if(iteration == 11)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"left",container.offsetWidth/2,container,elem,getCenterCoordinates(elem).x);
            })
        }

        else if(iteration == 12)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"left",container.offsetWidth*(0.75),container,elem,getCenterCoordinates(elem).x);
            })
        }

        else if(iteration == 13)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"left",container.offsetWidth-50,container,elem,getCenterCoordinates(elem).x);
            })
        }
        else if(iteration == 14)
        {
            setTimeout(removeOverlay,3000);
        }
    }

    }, 20);

}


function createCalibration()
{
    
    const overlayDiv = document.createElement('div');
    overlayDiv.id = 'calibration-overlay';
    document.body.appendChild(overlayDiv);

    // Add styles to make the overlay transparent and cover the entire page
    overlayDiv.style.position = 'fixed';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.width = '100%';
    overlayDiv.style.height = '100%';
    overlayDiv.style.background = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black background
    overlayDiv.style.zIndex = '9999'; // Ensure the overlay is on top of other elements

    
    webgazer.clearData();
    
    initGazer();

    // webgazer.setRegression('weightedRidge');

    createImage();
    createCalibrationDialog();
    
    overlayDiv.addEventListener('click', function(event) {
            // Handle the click event
            const clickCoordinates = {
            x: event.clientX,
            y: event.clientY
            };
    
            // Perform any necessary actions, such as updating the model
            console.log('Clicked on coordinates:', clickCoordinates);

    });
}


function startCalibration()
{ 
    var container = document.getElementById('calibration-overlay');
    var calibrator = document.getElementById('calibration-image');

    delay(5000).then(()=>{

        let centerCoord = getCenterCoordinates(calibrator);

        simulateClick(centerCoord.x,centerCoord.y);

        let start = Date.now();

        customTime = 2000;
        
        let innertimer = setInterval(function() {
            let timePassed = Date.now() - start;
        
            // Calculate rotation angle based on timePassed
            let rotationAngle = (timePassed / customTime) * 360; // 360 degrees for 2 seconds
        
            // Apply rotation to the element
            calibrator.style.transform = 'rotate(' + rotationAngle + 'deg)';
        
            if (timePassed > customTime) clearInterval(innertimer);
        
        }, 50);

        delay(3000).then(()=>{goUntilMidTop(1,"left",container.offsetWidth/4,container,calibrator,getCenterCoordinates(calibrator).x)});

    });

    // delay(5000).then(()=>{goUntilMidTop(0,"left",getCenterCoordinates(calibrator).x,container,calibrator,getCenterCoordinates(calibrator).x);})
}

function createCalibrationDialog() {
    // Create a modal dialog
    const dialog = document.createElement('div');
    dialog.id = 'calibration-dialog';
    dialog.innerHTML = `
        <h2 id="calibration-heading" style="text-align: center;">Instructions</h2>
        <div id="calibration-instructions">
            <ul style="font-size: 1.2em;">
                <li>Click Start Calibration After you see a red prediction point in your screen.</li>
                <li>Make sure to look at the target and not blink when it is rotating.</li>
                <li>Make sure to not intercept clicks on the screen once calibration has started</li>
                <!-- Add more instructions as needed -->
            </ul>
        </div>
        <button id="start-calibration-btn">Begin Calibration</button>
    `;

    // Add styles to the modal dialog
    dialog.style.position = 'fixed';
    dialog.style.width = '500px';
    dialog.style.height = '300px';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.background = 'white';
    dialog.style.borderRadius = '10px'; // Rounded edges
    dialog.style.padding = '20px';
    dialog.style.border = '1px solid #ccc';
    dialog.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    dialog.style.zIndex = '10000';

    // Add styles to the instructions
    const instructions = dialog.querySelector('#calibration-instructions');
    instructions.style.marginBottom = '20px';

    // Add styles to the "Begin Calibration" button
    const startButton = dialog.querySelector('#start-calibration-btn');
    startButton.style.width = '100%';
    startButton.style.padding = '10px';
    startButton.style.backgroundColor = '#4CAF50'; // Green background color
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '5px';
    startButton.style.cursor = 'pointer';

    // Add event listener to the "Begin Calibration" button
    startButton.addEventListener('click', () => {
        removeDialog();
        startCalibration();
    });

    document.getElementById('calibration-overlay').appendChild(dialog);
}

function removeDialog()
{
    const dialog = document.getElementById('calibration-dialog');
    document.getElementById('calibration-overlay').removeChild(dialog);
}

function createImage() {
    // Create an img element for the image
    const img = document.createElement('img');
    img.id = 'calibration-image';
    img.style.position = 'absolute';
    img.style.width = '100px'; // Adjust the width and height as needed
    img.style.height = '100px';

    img.src = chrome.runtime.getURL('red_target.png')

    // Set the initial position to leftmost-top
    img.style.left = '0';
    img.style.top = '0';

    // Add the image to the overlay
    document.getElementById('calibration-overlay').appendChild(img);
}

function removeOverlay() {

    webgazer.showVideoPreview(false);
    const overlayDiv = document.getElementById('calibration-overlay');
    if (overlayDiv) {
        overlayDiv.parentNode.removeChild(overlayDiv);
        console.log("Calibration Done");
    }
}

async function setDBstore() {
    
    var db = await openDatabase('EyeGaze');
    var date = new Date();
    var gazePredictionStore;

    webgazer.setGazeListener(async function(data, clock) {
        
        gazePredictionStore = await openStore(db, 'GazePrediction');
    
        let time = date.getTime();

        storeDataInStore(gazePredictionStore, { timestamp: time, x: data.x, y: data.y });
    });
}


function openDatabase(databaseName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, 1);

        request.onerror = function(event) {
            reject(`Error opening database: ${event.target.error}`);
        };

        request.onsuccess = function(event) {
            const db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = function(event) {
            const db = event.target.result;

            const gazePredictionStore = db.createObjectStore('GazePrediction', { autoIncrement: true });
            gazePredictionStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
    });
}

function openStore(db, storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        resolve(store);
    });
}

function storeDataInStore(store, data) {
    return new Promise((resolve, reject) => {
        const request = store.add(data);

        request.onerror = function(event) {
            console.log(event.target.error);
            reject(`Error adding data to store: ${event.target.error}`);
        };

        request.onsuccess = function(event) {
            resolve();
        };
    });
}


function readAllDataFromStore(store) {
    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onerror = function (event) {
            reject(`Error reading data from store: ${event.target.error}`);
        };

        request.onsuccess = function (event) {
            const data = event.target.result;
            resolve(data);
        };
    });
}

async function uploadDataToBackend(allData) {
    const url = 'http://localhost:5000/uploadData'; // Replace with your actual backend endpoint

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({data: allData,rollNo: localStorage.getItem('rollNo')}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Data uploaded successfully:', responseData);
    } catch (error) {
        console.error('Error uploading data to backend:', error);
    }
}

async function endGazer() {
    webgazer.end();
    localStorage.setItem('hasEnteredListener', 'false');

    alert("Webgazer ended");

    const db = await openDatabase('EyeGaze');
    const gazePredictionStore = await openStore(db, 'GazePrediction');

    const allData = await readAllDataFromStore(gazePredictionStore);

    await uploadDataToBackend(allData);

    console.log('All data from GazePrediction store:', allData);

    await deleteDatabase();
}

async function deleteDatabase() {
    try {
        // Open a connection to the database
        const db = await openDatabase('EyeGaze');

        // Close the connection to the database to ensure it's not in use
        db.close();

        // Delete the database
        await new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase('EyeGaze');

            deleteRequest.onerror = function (event) {
                reject(`Error deleting database: ${event.target.error}`);
            };

            deleteRequest.onsuccess = function () {
                resolve();
            };
        });

        console.log('EyeGaze database deleted successfully');
    } catch (error) {
        console.error('Error deleting EyeGaze database:', error);
    }
}