// background.js

// Event listener for messages from content scripts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // Check if the message is to open the options page
    if (request.action === 'openOptionsPage') {
        // Open the options page and pass data
        chrome.runtime.openOptionsPage(function () {
            // Send the data to the options page using chrome.storage.local
            chrome.storage.local.set({ optionsPageData: request.data });
        });
    }
});

// Event listener for the extension installed or updated
chrome.runtime.onInstalled.addListener(function () {
    // Your logic on extension installed or updated, if needed
});
