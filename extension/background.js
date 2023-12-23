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

const startRecording = async () => {
  await chrome.tabs.query({'active': true, 'lastFocusedWindow': true, 'currentWindow': true}, async function (tabs) {
    // Get current tab to focus on it after start recording on recording screen tab
    const currentTab = tabs[0];

    // Create recording screen tab
    const tab = await chrome.tabs.create({
      url: chrome.runtime.getURL('recorder.html'),
      pinned: true,
      active: true,
    });

    // Wait for recording screen tab to be loaded and send message to it with the currentTab
    chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);

        await chrome.tabs.sendMessage(tabId, {
          name: 'startRecording',
          body: {
            currentTab: currentTab,
          },
        });
      }
    });
  });
};

// Listen for startRecording message from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.name === 'initiateRecording') {
    startRecording();
  }
});