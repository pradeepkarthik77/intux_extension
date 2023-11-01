appendLoop = '';
eyeData = [];
runs = 0;

setTimeout(function (){
	initGazer();
},50);

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