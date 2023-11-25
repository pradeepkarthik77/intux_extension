chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if(request.message === 'enableCalibration')
        {
            var hostname = window.location.hostname;
            sessionStorage.setItem('ExtensionURL', hostname);

            createCalibration();
        }
    }
);

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
    overlayDiv.style.background = 'rgba(0, 0, 0, 0.8)'; // Semi-transparent black background
    overlayDiv.style.zIndex = '9999'; // Ensure the overlay is on top of other elements

    createImage();

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
        for (let i = 0; i < 20; i++) {
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
            }, 100);
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

        customTime = 5000;

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
                goUntilMidTop(iteration+1,"left",container.offsetWidth-50,container,elem,getCenterCoordinates(elem).x);
            })
        }
        else if(iteration == 2)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"bottom",container.offsetHeight/2,container,elem,getCenterCoordinates(elem).y);
            })
        }
        else if(iteration == 3)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"right",container.offsetWidth/2,container,elem,getCenterCoordinates(elem).x);
            })
        }
        else if(iteration == 4)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"right",50,container,elem,getCenterCoordinates(elem).x);
            })
        }
        else if(iteration == 5)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"bottom",container.offsetHeight-50,container,elem,getCenterCoordinates(elem).y);
            })
        }
        else if(iteration == 6)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"left",container.offsetWidth/2,container,elem,getCenterCoordinates(elem).x);
            })
        }
        else if(iteration == 7)
        {
            delay(customTime).then(()=>{
                goUntilMidTop(iteration+1,"left",container.offsetWidth-50,container,elem,getCenterCoordinates(elem).x);
            })
        }
    }

    }, 20);

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

    var image = document.getElementById('calibration-image');

        var container = document.getElementById('calibration-overlay');
        var calibrator = document.getElementById('calibration-image');

        delay(5000).then(()=>{

        let centerCoord = getCenterCoordinates(calibrator);

        simulateClick(centerCoord.x,centerCoord.y);

        let start = Date.now();

        let elem = centerCoord;

        customTime = 5000;
        
        let innertimer = setInterval(function() {
            let timePassed = Date.now() - start;
        
            // Calculate rotation angle based on timePassed
            let rotationAngle = (timePassed / customTime) * 360; // 360 degrees for 2 seconds
        
            // Apply rotation to the element
            elem.style.transform = 'rotate(' + rotationAngle + 'deg)';
        
            if (timePassed > customTime) clearInterval(innertimer);
        
        }, 50);

        delay(5000).then(()=>{goUntilMidTop(1,"left",container.offsetWidth/2,container,calibrator,getCenterCoordinates(calibrator).x)});

        })
}

function initGazer() {

    webgazer.setRegression('ridge')
    .begin();

    webgazer.clearData();

    webgazer.showVideoPreview(true) /* shows all video previews */
    .showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
    .applyKalmanFilter(true); /* Ka*/
}

setTimeout(initGazer,1000);