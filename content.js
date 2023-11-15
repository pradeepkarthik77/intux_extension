appendLoop = '';
eyeData = [];
runs = 0;

setTimeout(function (){
	initGazer();
},50);

function initGazer() {

            webgazer.setRegression('ridge')
            .setGazeListener(function(data,clock) {
                //     console.log(data,clock);
            })
            .begin();

            webgazer.showVideoPreview(true) /* shows all video previews */
            .showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
            .applyKalmanFilter(true); /* Ka*/

            // content-script.js

                // Create the overlay div
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