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
    // const form = document.getElementById('feedbackForm');
    var formData = new FormData();

    if(!globalFile)
    {
        alert("Choose a file before submission")
        return;
    }

    formData.append('file', globalFile, globalFile.name);

    // // Convert FormData to JSON
    // const jsonData = {};
    // formData.forEach((value, key) => {
    //     jsonData[key] = value;
    // });

    // Loop through optionsPageData and add key-value pairs to jsonData
    for (const key in optionsPageData) {
        if (optionsPageData.hasOwnProperty(key)) {
            // jsonData[key] = optionsPageData[key];
            if(key == "gazeData" || key == "clickData")
            {
                await formData.append(key,JSON.stringify(optionsPageData[key]));
            }
            else{
            await formData.append(key,optionsPageData[key]);
            }
        }
    }

    // jsonData["videoURL"] = videoUrl;

    // Adjust the endpoint URL to your backend
    const endpointURL = 'http://localhost:8080/uploadData';

    // Perform a POST request to the backend
    fetch(endpointURL, {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            alert("Data Submitted Successfully. You can Close this tab");
            console.log('Data submitted successfully');
            // You can perform additional actions after successful submission
        })
        .catch(error => {
            console.error('Error submitting data:', error);
            alert("Cannot Submit Data. Try Again!")
            // Handle errors as needed
        });
}

document.getElementById("submitbtn").addEventListener('click', function () {
    submitForm();
});
