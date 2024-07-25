import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, set, ref, get } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXsOAriTKI7xQ79CemiNqZqZm8_ecBkpc",
  authDomain: "h-note-app.firebaseapp.com",
  databaseURL: "https://h-note-app-default-rtdb.firebaseio.com",
  projectId: "h-note-app",
  storageBucket: "h-note-app.appspot.com",
  messagingSenderId: "319394919884",
  appId: "1:319394919884:web:37be18cf2d8eba36e79969",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

document.getElementById('signin').addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const username = document.getElementById('username').value;

  // Check if username is available
  const usernameRef = ref(database, 'users/');
  try {
    const snapshot = await get(usernameRef);
    let isUsernameAvailable = true;
    snapshot.forEach((childSnapshot) => {
      if (childSnapshot.val().username === username) {
        isUsernameAvailable = false;
      }
    });

    if (!isUsernameAvailable) {
      showError('Username is already taken.');
      return;
    }

    // Proceed with user creation if the username is available
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        showSuccess('User created. Verification email sent!');

        // Send verification email
        sendEmailVerification(user).then(() => {
          // Email sent.
          console.log('Verification email sent.');

          // Save user data in the database
          set(ref(database, 'users/' + user.uid), {
            username: username,
            email: email
          });
          setTimeout(() => {
            window.location.href = 'profile/profile.html';  
          }, 2000); // Redirect after 2 seconds

        }).catch((error) => {
          showError('Error sending verification email: ' + error.message);
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        showError(errorMessage);
      });

  } catch (error) {
    showError('Error checking username availability: ' + error.message);
  }
});

document.getElementById('google-signin').addEventListener('click', async (e) => {
  e.preventDefault();

  const auth = getAuth();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Save user data in the database
    const username = user.displayName || user.email.split('@')[0];
    const email = user.email;

    // Check if username is already taken
    const usernameRef = ref(database, 'users/');
    const snapshot = await get(usernameRef);
    let isUsernameAvailable = true;
    snapshot.forEach((childSnapshot) => {
      if (childSnapshot.val().username === username) {
        isUsernameAvailable = false;
      }
    });

    if (!isUsernameAvailable) {
      // Generate a unique username if necessary
      username += '_' + Date.now();
    }

    // Save user data
    await set(ref(database, 'users/' + user.uid), {
      username: username,
      email: email
    });

    showSuccess('Logged in successfully!');
    setTimeout(() => {
      window.location.href = 'profile/profile.html';  
    }, 2000);

  } catch (error) {
    showError('Error during Google sign-in: ' + error.message);
  }
});

function showError(message) {
  const errorBox = document.getElementById("error-box");
  errorBox.textContent = message;
  errorBox.style.display = "block";
  setTimeout(() => {
    errorBox.style.display = "none";
  }, 5000); // Hide the error box after 5 seconds
}

function showSuccess(message) {
  const successBox = document.getElementById("success-box");
  successBox.textContent = message;
  successBox.style.display = "block";
  setTimeout(() => {
      successBox.style.display = "none";
  }, 3000); // Hide the success box after 3 seconds
}
