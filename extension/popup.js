var button = document.getElementById('startTrackingBtn');
var rollnoInput = document.getElementById('rollnoInput');

// Add a click event listener to the button
button.addEventListener('click', function () {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];

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

// Save button click event
var saveBtn = document.getElementById('saveBtn');
saveBtn.addEventListener('click', function () {
    var rollnoValue = rollnoInput.value;
    if (rollnoValue) {
        // Send the rollno value as a message to the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { message: 'saveRollNo', rollno: rollnoValue });
        });
    }
});

var startbtn = document.getElementById("startBtn");
startbtn.addEventListener('click',function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { message: 'startCalibration' });
    });
})