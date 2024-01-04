var optionsPageData;
var submitButton
var videoUrl;
var globalFile;

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['optionsPageData'], function (result) {
         submitButton = document.getElementById('submitbtn');
        const data = result.optionsPageData;
        optionsPageData = data;
    });

    document.getElementById('videoStatus').style.display = "none";

    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileSelect);

});

function handleFileSelect(event) {
    const file = event.target.files[0];
    const videoStatus = document.getElementById('videoStatus');

    if (file) {
        globalFile = file;
        videoStatus.style.display = "block";
        videoStatus.textContent = "Video is uploading. Please wait...";
    } else {
        videoStatus.style.display = "none";
        alert("Please choose a video file before submitting.");
    }
}


// Add event listeners for range inputs
// document.addEventListener('DOMContentLoaded', function () {
//     const q2 = document.getElementById('q2slide');
//     const q2val = document.getElementById('q2Value');
//     q2.addEventListener('input', function () {
//         q2val.textContent = this.value;
//     });

//     const q4 = document.getElementById('q4slide');
//     const q4val = document.getElementById('q4Value');
//     q4.addEventListener('input', function () {
//         q4val.textContent = this.value;
//     });

//     const q5 = document.getElementById('q5slide');
//     const q5val = document.getElementById('q5Value');
//     q5.addEventListener('input', function () {
//         q5val.textContent = this.value;
//     });
// });

// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//     if (message.message === "VideoURL") {
//         console.log("VideoURL response", message.response);
//         videoUrl= message.response.fileUrl;
//         // submitButton.removeAttribute('disabled');
//         // document.getElementById('videoStatus').style.display = "none";
//     }
// });


async function submitForm() {
    var formData = new FormData();

    if (!globalFile) {
        alert("Choose a file before submission");
        return;
    }

    // Disable submit button and change its text
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    formData.append('file', globalFile, globalFile.name);

    for (const key in optionsPageData) {
        if (optionsPageData.hasOwnProperty(key)) {
            if (key == "gazeData" || key == "clickData") {
                await formData.append(key, JSON.stringify(optionsPageData[key]));
            } else {
                await formData.append(key, optionsPageData[key]);
            }
        }
    }

    const endpointURL = 'http://localhost:8080/uploadData';

    try {
        const response = await fetch(endpointURL, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // Data submitted successfully
            alert("Data Submitted Successfully. You can Close this tab");
            console.log('Data submitted successfully');
            // Keep the button disabled and change its text
            submitButton.textContent = "Submitted Successfully";
        } else {
            // Enable the button and change its color and text
            submitButton.disabled = false;
            submitButton.style.backgroundColor = "#4CAF50";
            submitButton.textContent = "Submit again";
            alert("Cannot Submit Data. Try Again!");
        }
    } catch (error) {
        console.error('Error submitting data:', error);
        // Enable the button and change its color and text
        submitButton.disabled = false;
        submitButton.style.backgroundColor = "#4CAF50";
        submitButton.textContent = "Submit again";
        alert("Error submitting data. Try Again!");
    }
}


document.getElementById("submitbtn").addEventListener('click', function () {
    submitForm();
});
