document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['optionsPageData'], function (result) {
        const data = result.optionsPageData;

        console.log('Data from content script:', data);
    });
});
