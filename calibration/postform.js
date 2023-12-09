function createFormFloatingDialog() {
    // Create a container for the floating dialog
    const dialogContainer = document.createElement('div');
    dialogContainer.id = 'floating-dialog-container';
  
    // Add styles to the container
    dialogContainer.style.position = 'fixed';
    dialogContainer.style.top = '50%';
    dialogContainer.style.left = '50%';
    dialogContainer.style.transform = 'translate(-50%, -50%)';
    dialogContainer.style.background = '#f8f8f8';
    dialogContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    dialogContainer.style.zIndex = '10000';
    dialogContainer.style.padding = '20px';
    dialogContainer.style.borderRadius = '15px';
  
    // Set the innerHTML of the div with your form content
    dialogContainer.innerHTML = `
      <h5>Post Task Survey</h5>
      <form id="feedbackForm">
        <label>
          Q1. Were you able to complete the given task? 
          <input type="radio" name="q1" value="yes"> Yes
          <input type="radio" name="q1" value="no"> No
        </label>
  
        <label>
          Q2. How difficult would you rate the task?  (With 1 being easy and 5 being very difficult)
          <input id="q2slide" type="range" name="q2" min="1" max="5" step="1" value="3">
          <span id="q2Value">3</span>
        </label>
  
        <label>
          Q3. Have you performed this task before? 
          <input type="radio" name="q3" value="yes"> Yes
          <input type="radio" name="q3" value="no"> No
          <input type="radio" name="q3" value="maybe"> Maybe
        </label>
  
        <label>
          Q4. Were you able to navigate to the subsequent steps seamlessly? (With 1 being with utmost ease and 5 being with utmost difficulty)
          <input id="q4slide" type="range" name="q4" min="1" max="5" step="1" value="3">
          <span id="q4Value">3</span>
        </label>
  
        <label>
          Q5. How relevant do you think the completed task is to the overall goal of the website? (With 1 being highly irrelevant and 5 being highly relevant)
          <br/>
          <input id="q5slide" type="range" name="q5" min="1" max="5" step="1" value="3">
          <span id="q5Value">3</span>
        </label>
  
        <button type="button" onclick="submitForm()">Submit</button>
      </form>
    `;
  
    // Append the form container to the body
    document.body.appendChild(dialogContainer);
  
    // Add event listeners for range inputs
    const q2 = document.getElementById('q2slide');
    const q2val = document.getElementById('q2Value');
    q2.addEventListener('input', function () {
      q2val.textContent = this.value;
    });
  
    const q4 = document.getElementById('q4slide');
    const q4val = document.getElementById('q4Value');
    q4.addEventListener('input', function () {
      q4val.textContent = this.value;
    });
  
    const q5 = document.getElementById('q5slide');
    const q5val = document.getElementById('q5Value');
    q5.addEventListener('input', function () {
      q5val.textContent = this.value;
    });
  }
  
  createFormFloatingDialog();
  