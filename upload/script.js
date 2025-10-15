// This function will run when the login button is clicked
function showPasswordPrompt() {
    // Show a popup asking for the password
    const password = prompt('Please enter the password:');

    // If the user entered a password (didn't click cancel)
    if (password) {
        // Send the password to our server API
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        })
        .then(response => response.json()) // Convert the server's answer to JSON
        .then(data => {
            // If the server sent back a token, login was successful
            if (data.token) {
                localStorage.setItem('authToken', data.token); // Store the token
                alert('Login successful!');
                // You can add code here to show the upload form
            } else {
                // If login failed, show an error
                alert('Login failed: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            // If there was a network error or something else went wrong
            console.error('Error during login:', error);
            alert('An error occurred during login. The server might be down.');
        });
    }
}

// This part of the code waits for the page to fully load
document.addEventListener('DOMContentLoaded', () => {
  // It finds the button with the ID "loginBtn"
  const loginButton = document.getElementById('loginBtn');
  // It tells the button to run our showPasswordPrompt function when clicked
  if (loginButton) {
    loginButton.addEventListener('click', showPasswordPrompt);
  }
});
