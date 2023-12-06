function createOverlay() {
    // Create the overlay div
    const overlayDiv = document.createElement('div');
  
    // Set styles for the overlay to cover the entire screen
    overlayDiv.style.position = 'fixed';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.width = '100%';
    overlayDiv.style.height = '100%';
    overlayDiv.style.backgroundColor = 'transparent'; // Set the background color as needed
    overlayDiv.style.pointerEvents = 'auto'; // Make the overlay div non-blocking for clicks
  
    // Append the overlay div to the body of the document
    document.body.appendChild(overlayDiv);
  
    // Add click event listener to the overlay div
    overlayDiv.addEventListener('click', function (event) {
      // Get the x, y coordinates of the click event
      const x = event.clientX;
      const y = event.clientY;
  
      // Log or perform actions with the x, y coordinates as needed
      console.log(`Clicked at coordinates: (${x}, ${y})`);

    //   alert(`Clicked at coordinates: (${x}, ${y})`)
  
      // Disable clickability on the overlay div temporarily
      overlayDiv.style.pointerEvents = 'none';
  
      // Get the underlying element at the clicked coordinates
      const underlyingElement = document.elementFromPoint(x, y);
  
      // Trigger a click event on the underlying element
      if (underlyingElement) {
        underlyingElement.click();
        // overlayDiv.style.pointerEvents = 'auto';
      }
  
      // Set a timeout to reset the clickability after a short delay
      setTimeout(function () {
        overlayDiv.style.pointerEvents = 'auto';
      }, 100);
    });
  }
  
  // Call the function to create the overlay when the content script is executed
  createOverlay();
  