appendLoop = '';
eyeData = [];
runs = 0;

// content.js
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === 'enabledWebgazer') {
            initGazer();
            createCalibration();
        }
    }
);

// content.js
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === 'enableCalibration') {
            createCalibration();
        }
    }
);

function initGazer() {

            webgazer.setRegression('ridge')
            .setGazeListener(function(data,clock) {
                    console.log(data,clock);
            })
            .begin();

            webgazer.showVideoPreview(true) /* shows all video previews */
            .showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
            .applyKalmanFilter(true); /* Ka*/
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

    // content-script.js

    createDots();

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

function createDots() {
    // Define the number of dots and their colors
    const numDots = 9;
    const dotColors = ['red', 'yellow'];

    for (let i = 0; i < numDots; i++) {
        const dot = document.createElement('div');
        dot.className = 'calibration-dot';
        dot.style.position = 'absolute';
        dot.style.width = '15px'; // Adjust the width and height as needed
        dot.style.height = '15px';
        dot.style.borderRadius = '50%'; // Make the dot round
        dot.style.transition = 'background-color 0.3s'; // Add transition for color change

        // Set initial click count to 0 for each dot
        dot.clickCount = 0;

        // Set dot color based on the number of clicks
        dot.style.background = dotColors[0];

        // Add the dot to the overlay
        document.getElementById('calibration-overlay').appendChild(dot);

        // Add click event listener to each dot
        dot.addEventListener('click', function () {
            handleDotClick(dot);
        });
    }

    // Position the dots at the edges of the screen
    positionDots();
}

function positionDots() {
    const dots = document.getElementsByClassName('calibration-dot');
    const numDots = dots.length;

    // Set positions for each dot
    const positions = [
        { top: 0, left: 0 },           // Top-left
        { top: 0, right: 0 },          // Top-right
        { top: '50%', left: 0 },       // Middle-left
        { top: '50%', right: 0 },      // Middle-right
        { bottom: 0, left: 0 },        // Bottom-left
        { bottom: 0, right: 0 },       // Bottom-right
        { top: 0, left: '50%' },       // Top-center
        { bottom: 0, left: '50%' },    // Bottom-center
        { top: '50%', left: '50%' }    // Center
    ];

    for (let i = 0; i < numDots; i++) {
        const dot = dots[i];
        const position = positions[i];

        // Apply position styles to each dot
        Object.assign(dot.style, position);
    }
}

let clickCount = 0; // Variable to track the number of clicks

function handleDotClick(dot) {
    dot.clickCount++;

    // Change color after 10 clicks
    if (dot.clickCount === 10) {
        dot.style.background = 'yellow';
    }

    if (areAllDotsClickedEnough()) {

        setTimeout(removeOverlay, 500);
        
    }

    // Perform any additional actions needed for calibration
    console.log('Dot clicked:', dot.style.background);
}

function areAllDotsClickedEnough() {
    const dots = document.getElementsByClassName('calibration-dot');
    const numDots = dots.length;

    for (let i = 0; i < numDots; i++) {
        if (dots[i].clickCount < 9) {
            return false; // At least one dot has not been clicked 9 times
        }
    }

    return true; // All dots have been clicked 9 times
}

function removeOverlay() {
    const overlayDiv = document.getElementById('calibration-overlay');
    if (overlayDiv) {
        overlayDiv.parentNode.removeChild(overlayDiv);
        alert("All Dots are clicked and calibration is finished")
    }
}