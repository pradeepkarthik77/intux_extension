var mediaRecorder = null;
var chunks = [];

chrome.runtime.onMessage.addListener((message) => {
  if (message.name == 'startRecording') {
    startRecording(message.body.currentTab.id,message.body.rollNo)
  }
  if (message.name == 'stopRecording') {
    stopRecording();
  }
});

async function saveRecording(blob, rollNo) {
  console.log('Saving recording blob')
  const formData = new FormData();
  formData.append('recording', blob);
  formData.append('rollNo', rollNo);


  await fetch('http://localhost:8080/saveRecording', {
    method: 'POST',
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      console.log('Recording saved:', data);
      return data
    })
    .catch(error => {
      console.error('Error saving recording:', error);
      return error.message
    });
}

function startRecording(currentTabId,rollNo) {
  // Prompt user to choose screen or window
  chrome.desktopCapture.chooseDesktopMedia(
    ['screen', 'window'],
    function (streamId) {
      if (streamId == null) {
        return;
      }

      // Once the user has chosen screen or window, create a stream from it and start recording
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {  
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: streamId,
          }
        }
      }).then(stream => {
        mediaRecorder = new MediaRecorder(stream);

        chunks = [];

        mediaRecorder.ondataavailable = function (e) {
          chunks.push(e.data);
        };

        mediaRecorder.onstop = async function (e) {
          stream.getTracks().forEach(track => track.stop());
          const blobFile = new Blob(chunks, { type: "video/webm" });
          const recordRes= await saveRecording(blobFile,rollNo);
          // await chrome.tabs.sendMessage(currentTabId, { message: "VideoURL", fileLink: recordRes });

          // // Stop all tracks of stream

          // const downloadLink = document.createElement('a');
          // // Set the anchor's attributes
          // downloadLink.href = url;
          // downloadLink.download = `${rollNo}.mp4`; // Specify the desired filename

          // // Programmatically trigger a click event on the anchor to initiate the download
          // downloadLink.click();
          window.close();
        };

        mediaRecorder.start();

        chrome.tabs.sendMessage(currentTabId, { message: "screenShared" });

      }).finally(async () => {
        // After all setup, focus on the previous tab (where the recording was requested)
        await chrome.tabs.update(currentTabId, { active: true, selected: true });
      });
    }
  );
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}
