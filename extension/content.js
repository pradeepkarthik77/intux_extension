appendLoop = '';
eyeData = [];
runs = 0;

var webgazerInitialized = false;

// if(sessionStorage.getItem("ExtensionURL") == window.location.hostname)
// {
//     console.log("Proceeding to continue");
//     if (!webgazerInitialized) {
//         setTimeout(initGazer,1000);
//         webgazerInitialized = true;
//     }
//     setTimeout(removeOverlay,500);
//     setTimeout(setDBstore,500);
// }

function initGazer() {

            webgazer.setRegression('ridge')
            .begin();

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
                // console.log(`Simulated click ${i + 1} on coordinates:`, { x, y });
            }, 50);
        }
    } else {
        // console.log('No element found at coordinates:', { x, y });
    }
}

function moveTarget(iteration,direction,limit,container,elem,currentValue)
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
            setTimeout(onStopCalibration,3000);  
            // delay(customTime).then(()=>{
            //     moveTarget(iteration+1,"left",container.offsetWidth/2,container,elem,getCenterCoordinates(elem).x);
            // })
        }

        if(iteration == 2)
        {
            delay(customTime).then(()=>{
                moveTarget(iteration+1,"left",container.offsetWidth*(0.75),container,elem,getCenterCoordinates(elem).x);
            })
        }

        if(iteration == 3)
        {
            delay(customTime).then(()=>{
                moveTarget(iteration+1,"left",container.offsetWidth-50,container,elem,getCenterCoordinates(elem).x);
            })
        }

        else if(iteration == 4)
        {
            delay(customTime).then(()=>{
                moveTarget(iteration+1,"bottom",container.offsetHeight/2,container,elem,getCenterCoordinates(elem).y);
            })
        }

        else if(iteration == 5)
        {
            delay(customTime).then(()=>{
                moveTarget(iteration+1,"right",container.offsetWidth*(0.75),container,elem,getCenterCoordinates(elem).x);
            })
        }

        else if(iteration == 6)
        {
            delay(customTime).then(()=>{
                moveTarget(iteration+1,"right",container.offsetWidth/2,container,elem,getCenterCoordinates(elem).x);
            })
        }

        else if(iteration == 7)
        {
            delay(customTime).then(()=>{
                moveTarget(iteration+1,"right",container.offsetWidth/4,container,elem,getCenterCoordinates(elem).x);
            })
        }

        else if(iteration == 8)
        {
            delay(customTime).then(()=>{
                moveTarget(iteration+1,"right",50,container,elem,getCenterCoordinates(elem).x);
            })
        }

        else if(iteration == 9)
        {
            delay(customTime).then(()=>{
                moveTarget(iteration+1,"bottom",container.offsetHeight-50,container,elem,getCenterCoordinates(elem).y);
            })
        }

        else if(iteration == 10)
        {
            delay(customTime).then(()=>{
                moveTarget(iteration+1,"left",container.offsetWidth/4,container,elem,getCenterCoordinates(elem).x);
            })
        }

        else if(iteration == 11)
        {
            delay(customTime).then(()=>{
                moveTarget(iteration+1,"left",container.offsetWidth/2,container,elem,getCenterCoordinates(elem).x);
            })
        }

        else if(iteration == 12)
        {
            delay(customTime).then(()=>{
                moveTarget(iteration+1,"left",container.offsetWidth*(0.75),container,elem,getCenterCoordinates(elem).x);
            })
        }

        else if(iteration == 13)
        {
            delay(customTime).then(()=>{
                moveTarget(iteration+1,"left",container.offsetWidth-50,container,elem,getCenterCoordinates(elem).x);
            })
        }
        else if(iteration == 14)
        {
            setTimeout(onStopCalibration,3000);
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

    if(!webgazerInitialized)
    {
        initGazer();
        webgazerInitialized = true;
    }

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

        delay(3000).then(()=>{moveTarget(1,"left",container.offsetWidth/4,container,calibrator,getCenterCoordinates(calibrator).x)});

    });

    // delay(5000).then(()=>{moveTarget(0,"left",getCenterCoordinates(calibrator).x,container,calibrator,getCenterCoordinates(calibrator).x);})
}

async function createClickOverlay() {
    // Create the overlay div
    const overlayDiv = document.createElement('div');

    overlayDiv.id = 'click-listener-div';
  
    // Set styles for the overlay to cover the entire screen
    overlayDiv.style.position = 'fixed';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.width = '100%';
    overlayDiv.style.height = '100%';
    overlayDiv.style.backgroundColor = 'transparent'; // Set the background color as needed
    overlayDiv.style.pointerEvents = 'auto'; // Make the overlay div non-blocking for clicks
    overlayDiv.style.zIndex = '10000';
  
    // Append the overlay div to the body of the document
    document.body.appendChild(overlayDiv);

    var db = await openDatabase('EyeGaze');
  
    // Add click event listener to the overlay div
    overlayDiv.addEventListener('click',async function (event) {
      // Get the x, y coordinates of the click event
      const x = event.clientX;
      const y = event.clientY;
  
      console.log(`Clicked at coordinates: (${x}, ${y})`);

      overlayDiv.style.pointerEvents = 'none';
  
      const underlyingElement = document.elementFromPoint(x, y);
  
      if (underlyingElement) {
        underlyingElement.click();
        // overlayDiv.style.pointerEvents = 'auto';
      }
  
      setTimeout(function () {
        overlayDiv.style.pointerEvents = 'auto';
      }, 500);

      ClickStore = await openStore(db, 'ClickStore');

      let date = new Date();
  
      let time = date.getTime();

      storeDataInStore(ClickStore, { timestamp: time, x: x, y: y });
    });
  }

function createCalibrationDialog() {
    // Create a modal dialog
    const dialog = document.createElement('div');
    dialog.id = 'calibration-dialog';
    dialog.innerHTML = `
        <h2 id="calibration-heading" style="text-align: center;">Instructions</h2>
        <div id="calibration-instructions">
            <ul style="font-size: 1.2em;">
                <li>Click on Start Calibration after you see prediction points overlay on your face in the video.</li>
                <li>Make sure to look at the target and not blink when it is rotating.</li>
                <li>Make sure to not intercept clicks on the screen once calibration has started</li>
                <li>It is advisied to sit in a well-lit environment and have the light source in front of your face.</li>
            </ul>
        </div>
        <button id="start-calibration-btn">Begin Calibration</button>
    `;

    // Add styles to the modal dialog
    dialog.style.position = 'fixed';
    dialog.style.width = '500px';
    dialog.style.height = '350px';
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

function onStopCalibration()
{
    setTimeout(removeOverlay,3000);
    setTimeout(createFloatingDialog,3000);
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
    var gazePredictionStore;
    var ClickStore;

    // document.addEventListener('click',async function(event) {
    //     // Handle the click event
    //     const clickCoordinates = {
    //     x: event.clientX,
    //     y: event.clientY
    //     };

    //     ClickStore = await openStore(db, 'ClickStore');

    //     let date = new Date();
    
    //     let time = date.getTime();

    //     console.log(clickCoordinates.x,clickCoordinates.y);

    //     storeDataInStore(ClickStore, { timestamp: time, x: clickCoordinates.x, y: clickCoordinates.y });

    // });

    webgazer.setGazeListener(async function(data, clock) {
        
        gazePredictionStore = await openStore(db, 'GazePrediction');
        
        let date = new Date();
    
        let time = date.getTime();

        storeDataInStore(gazePredictionStore, { timestamp: time, x: data.x, y: data.y });
    });
}


function openDatabase(databaseName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, 2); // Increment the version number

        request.onerror = function(event) {
            reject(`Error opening database: ${event.target.error}`);
        };

        request.onsuccess = function(event) {
            const db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = function(event) {
            const db = event.target.result;

            // Create or upgrade the existing object store
            if (!db.objectStoreNames.contains('GazePrediction')) {
                const gazePredictionStore = db.createObjectStore('GazePrediction', { autoIncrement: true });
                gazePredictionStore.createIndex('timestamp', 'timestamp', { unique: false });
            }

            // Add the ClickStore object store
            if (!db.objectStoreNames.contains('ClickStore')) {
                const clickStore = db.createObjectStore('ClickStore', { autoIncrement: true });
                clickStore.createIndex('clickTimestamp', 'clickTimestamp', { unique: false });
            }
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

async function uploadDataToBackend(gazeData,clickData) {
    const url = 'http://146.148.46.216:8080/uploadData'; // Replace with your actual backend endpoint

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({gazeData: gazeData,rollNo: localStorage.getItem('rollNo'),clickData: clickData}),
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

async function startForm(gazeData,clickData) {
    // Get screen sizes
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const timeTaken = document.getElementById('task-timer').textContent;

    const rollNo = localStorage.getItem('rollNo');

    if (rollNo != null) {
        // Count the number of records in the 'ClickStore' object store
        const db = await openDatabase('EyeGaze');
        const clickStore = await openStore(db, 'ClickStore');
        const clickCount = await getCountFromStore(clickStore);

        // Send data to options page
        chrome.runtime.sendMessage({
            action: 'openOptionsPage',
            data: {
                rollNo: rollNo,
                screenWidth: screenWidth,
                screenHeight: screenHeight,
                clickCount: clickCount,
                timeTaken: timeTaken,
                gazeData: gazeData,
                clickData: clickData
            },
        });
    } else {
        console.log("Enter proper rollNo");
        alert('Enter a proper rollNo before starting the task');
    }
}

async function getCountFromStore(store) {
    return new Promise((resolve, reject) => {
        const request = store.count();

        request.onerror = function (event) {
            reject(`Error counting records in store: ${event.target.error}`);
        };

        request.onsuccess = function (event) {
            const count = event.target.result;
            resolve(count);
        };
    });
}

async function endGazer() {
    webgazer.end();

    const db = await openDatabase('EyeGaze');

    // Open a transaction that includes both GazePrediction and ClickStore
    const transaction = db.transaction(['GazePrediction', 'ClickStore'], 'readwrite');

    const gazePredictionStore = transaction.objectStore('GazePrediction');
    const clickStore = transaction.objectStore('ClickStore');

    const gazeData = await readAllDataFromStore(gazePredictionStore);
    const clickData = await readAllDataFromStore(clickStore);

    // await uploadDataToBackend(gazeData,clickData);

    console.log('All data from GazePrediction store:', gazeData);
    console.log('All data from ClickStore:', clickData);

    await startForm(gazeData,clickData);

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

function updateTimer() {
    let seconds = 0;

    let timerElement = document.getElementById('task-timer');

    // Update the timer every second
    const timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const formattedSeconds = seconds % 60;

        // Update the timer text content
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${formattedSeconds.toString().padStart(2, '0')}`;
    }, 1000);

    // Function to stop the timer (you can call this when needed)
    function stopTimer() {
        clearInterval(timerInterval);
    }

    return stopTimer;
}

var stopTimerFunction;

function startTask()
{
    if (!webgazerInitialized) {
        initGazer();
        webgazerInitialized = true;
    }

    setTimeout(removeOverlay,500);
    setTimeout(setDBstore,500);
    setTimeout(createClickOverlay,500);

    // Start or resume the timer
    stopTimerFunction = updateTimer();
}

function stopTask()
{
    // Stop the timer
    if (stopTimerFunction) {
        stopTimerFunction();
    }

    endGazer();
}

function createFloatingDialog() {
    // Create a container for the floating dialog
    const dialogContainer = document.createElement('div');
    dialogContainer.id = 'floating-dialog-container';

    // Add styles to the container
    dialogContainer.style.position = 'fixed';
    dialogContainer.style.top = '0';
    dialogContainer.style.left = '50%';
    dialogContainer.style.transform = 'translateX(-50%)';
    dialogContainer.style.background = 'white';
    dialogContainer.style.border = '1px solid #ccc';
    dialogContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    dialogContainer.style.zIndex = '10000';
    dialogContainer.style.display = 'flex';
    dialogContainer.style.justifyContent = 'space-between';
    dialogContainer.style.alignItems = 'center';
    dialogContainer.style.padding = '10px';
    dialogContainer.style.borderRadius = '5px';

    // Create a timer element
    const timerElement = document.createElement('div');
    timerElement.id = 'task-timer';
    timerElement.textContent = '00:00';

    // Add styles to the timer element
    timerElement.style.fontSize = '16px';
    timerElement.style.marginRight = '10px'; // Added margin to space from the button

    // Create a button element
    const buttonElement = document.createElement('button');
    buttonElement.id = 'action-button';
    buttonElement.textContent = 'Start Task';

    // Add styles to the button element
    buttonElement.style.padding = '8px 16px';
    buttonElement.style.backgroundColor = '#4CAF50'; // Green background color for Start Task
    buttonElement.style.color = 'white';
    buttonElement.style.border = 'none';
    buttonElement.style.borderRadius = '5px';
    buttonElement.style.cursor = 'pointer';

    // Append the timer and button elements to the container
    dialogContainer.appendChild(timerElement);
    dialogContainer.appendChild(buttonElement);

    // Append the container to the body
    document.body.appendChild(dialogContainer);

    // Function to handle button click
    function handleButtonClick() {
        const actionButton = document.getElementById('action-button');

        actionButton.addEventListener('click', () => {

            if (actionButton.textContent === 'Start Task') {
                // Change button text to 'Stop Task'

                
                chrome.runtime.sendMessage({ name: 'initiateRecording',rollNo:  localStorage.getItem('rollNo')});

                actionButton.textContent = 'Stop Task';
                actionButton.style.backgroundColor = '#FF0000'; // Red background color for Stop Task

                var hostname = window.location.hostname;
                sessionStorage.setItem('ExtensionURL', hostname);

            } else {
                // Change button text to 'Start Task'
                actionButton.textContent = 'Start Task';
                actionButton.style.backgroundColor = '#4CAF50'; // Green background color for Start Task

                chrome.runtime.sendMessage({ name: 'stopRecording' });

                stopTask();
            }
        });
    }

    handleButtonClick();
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if(request.message === 'enableCalibration')
        {
            var hostname = window.location.hostname;
            sessionStorage.setItem('ExtensionURL', hostname);
            createCalibration();
        }
        // else if(request.message === 'disabledWebgazer') {
        //     endGazer();
        // }
        else if(request.message === 'saveRollNo')
        {
            localStorage.setItem('rollNo',request.rollno);
            console.log("saved value "+request.rollno);
        }
        else if(request.message === 'screenShared')
        {
            startTask();
        }
    }
);