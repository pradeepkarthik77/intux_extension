var button = document.getElementById('startTrackingBtn');

// Add a click event listener to the button
button.addEventListener('click', function () {
    console.log("hello");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { message: 'enabledWebgazer' });
    });
});

var startCalibration = document.getElementById('startCalibrationBtn');

// Add a click event listener to the button
startCalibration.addEventListener('click', function () {
    console.log("hello");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { message: 'enableCalibration' });
    });
});