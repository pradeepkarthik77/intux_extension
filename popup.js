var button = document.getElementById('sendMessageButton');

// Add a click event listener to the button
button.addEventListener('click', function () {
    console.log("hello");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { message: 'enabledWebgazer' });
    });
});