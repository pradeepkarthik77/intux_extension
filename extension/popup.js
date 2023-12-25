var startCalibration = document.getElementById('startCalibrationBtn');
var contentDiv = document.getElementById('content');

// Add a click event listener to the Start Calibration button
startCalibration.addEventListener('click', function () {
    // Update the content of the div with "Started Calibration"
    contentDiv.textContent = 'Started Calibration';

    contentDiv.classList.add('show');

    // Clear the content after 5 seconds
    setTimeout(function () {
        contentDiv.textContent = '';
        contentDiv.classList.remove('show');
    }, 2000);

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { message: 'enableCalibration' });
    });
});

// Save button click event
var saveBtn = document.getElementById('saveBtn');
var rollnoInput = document.getElementById('rollnoInput');

saveBtn.addEventListener('click', function () {
    var rollnoValue = rollnoInput.value;
    if (rollnoValue) {
        // Send the rollno value as a message to the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { message: 'saveRollNo', rollno: rollnoValue });
        });

        // Update the content of the div with "Saved RollNo"
        contentDiv.textContent = 'Saved RollNo';

        contentDiv.classList.add('show');

        // Clear the content after 5 seconds
        setTimeout(function () {
            contentDiv.textContent = '';
            contentDiv.classList.remove('show');
        }, 2000);

        startCalibration.disabled = false;
    }
});

startCalibration.disabled = true;