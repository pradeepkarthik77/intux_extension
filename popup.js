var button = document.getElementById('startTrackingBtn');

// Add a click event listener to the button
button.addEventListener('click', function () {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];

        var storedObject = JSON.parse(localStorage.getItem('ExtensionURL'));

         // Toggle tracking state in localStorage
         var trackingState = localStorage.getItem('trackingState');
         if (trackingState === 'enabled') {
             localStorage.setItem('trackingState', 'disabled');
            chrome.tabs.sendMessage(activeTab.id, { message: 'disabledWebgazer' });
         } else {
            localStorage.setItem('trackingState', 'enabled');
            chrome.tabs.sendMessage(activeTab.id, { message: 'enabledWebgazer' });
         }

         updateTrackingButton();

    });
});

function updateTrackingButton() {
    var trackingState = localStorage.getItem('trackingState');
    if (trackingState === 'enabled') {
        button.style.backgroundColor = 'red';
        button.textContent = 'Stop Tracking';
    } else {
        button.style.backgroundColor = '#4CAF50';
        button.textContent = 'Start Tracking';
    }
}

// Initialize button appearance
updateTrackingButton();

var startCalibration = document.getElementById('startCalibrationBtn');

// Add a click event listener to the button
startCalibration.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { message: 'enableCalibration' });
    });
});