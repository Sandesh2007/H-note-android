import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDXsOAriTKI7xQ79CemiNqZqZm8_ecBkpc",
    authDomain: "h-note-app.firebaseapp.com",
    databaseURL: "https://h-note-app-default-rtdb.firebaseio.com",
    projectId: "h-note-app",
    storageBucket: "h-note-app.appspot.com",
    messagingSenderId: "319394919884",
    appId: "1:319394919884:web:37be18cf2d8eba36e79969",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth();
const storage = getStorage(app);

function showError(message) {
    const errorBox = document.getElementById("error-box");
    errorBox.textContent = message;
    errorBox.style.display = "block";
    setTimeout(() => {
        errorBox.style.display = "none";
    }, 3000); // Hide the error box after 3 seconds
}

function showSuccess(message) {
    const successBox = document.getElementById("success-box");
    successBox.textContent = message;
    successBox.style.display = "block";
    setTimeout(() => {
        successBox.style.display = "none";
    }, 3000); // Hide the success box after 3 seconds
}

document.addEventListener("DOMContentLoaded", () => {
    const usernameElement = document.getElementById("username");
    const emailElement = document.querySelector(".email");
    const verificationStatusElement = document.getElementById("verification-status");
    const newUsernameInput = document.getElementById("new-username");
    const updateUsernameButton = document.getElementById("update-username");
    const showUsernameInputButton = document.getElementById("show-username-input");
    const usernameStatus = document.getElementById("username-status");
    const newPasswordInput = document.getElementById("new-password");
    const changePasswordButton = document.getElementById("change-password");
    const showPasswordInputButton = document.getElementById("show-password-input");
    const passwordStatus = document.getElementById("password-status");
    const reauthenticateContainer = document.getElementById("reauthenticate-container");
    const currentPasswordInput = document.getElementById("current-password");
    const reauthenticateButton = document.getElementById("reauthenticate");
    const editProfileButton = document.getElementById("edit-profile-button");
    const logoutButton = document.querySelector(".logout");
    const profileImageElement = document.getElementById("profile-image");

    let reauthCredential;

    // Toggle username input and update button visibility
    showUsernameInputButton.addEventListener("click", () => {
        newUsernameInput.classList.toggle("hidden");
        updateUsernameButton.classList.toggle("hidden");
    });

    // Toggle password input and change button visibility
    showPasswordInputButton.addEventListener("click", () => {
        newPasswordInput.classList.toggle("hidden");
        changePasswordButton.classList.toggle("hidden");
    });

    // Toggle profile sections
    editProfileButton.addEventListener("click", () => {
        document.querySelector(".update-username-section").classList.toggle("hidden");
        document.querySelector(".change-password-section").classList.toggle("hidden");
    });

    // Handle image selection button toggle
    const toggleButton = document.getElementById("toggleButton");
    const imageContainer = document.getElementById("imageContainer");

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            emailElement.textContent = user.email; // Display user's email

            // Update verification status
            if (user.emailVerified) {
                verificationStatusElement.textContent = "✔ Verified";
                verificationStatusElement.classList.add("verified");
                verificationStatusElement.classList.remove("not-verified");
            } else {
                verificationStatusElement.textContent = "✘ Not Verified";
                verificationStatusElement.classList.add("not-verified");
                verificationStatusElement.classList.remove("verified");
            }

            // Check for cached profile data
            const cachedProfile = JSON.parse(localStorage.getItem('userProfile'));
            if (cachedProfile) {
                usernameElement.textContent = cachedProfile.name || 'Please update your username';
                profileImageElement.src = cachedProfile.image || 'user.svg';
            } else {
                // Fetch and display user data
                const userRef = ref(database, 'users/' + user.uid);
                try {
                    const snapshot = await get(userRef);
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        usernameElement.textContent = userData.username || 'Please update your username';
                        if (userData.profilePictureUrl) {
                            profileImageElement.src = userData.profilePictureUrl;
                        }
                        // Cache the profile data
                        localStorage.setItem('userProfile', JSON.stringify({
                            name: userData.username,
                            image: userData.profilePictureUrl || 'user.svg'
                        }));
                    } else {
                        usernameElement.textContent = 'Please update your username';
                    }
                } catch (error) {
                    showError("Error loading username: " + error.message);
                    usernameElement.textContent = 'Error loading username';
                }
            }

            // Update username in Firebase
            let userRef;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        userRef = ref(database, 'users/' + user.uid);
        
        // Update username
        updateUsernameButton.addEventListener("click", async () => {
            const newUsername = newUsernameInput.value.trim();
            if (newUsername) {
                try {
                    const usernameRef = ref(database, 'users/');
                    const snapshot = await get(usernameRef);
                    let isUsernameAvailable = true;
                    snapshot.forEach((childSnapshot) => {
                        if (childSnapshot.val().username === newUsername && childSnapshot.key !== user.uid) {
                            isUsernameAvailable = false;
                        }
                    });

                    if (isUsernameAvailable) {
                        await update(userRef, { username: newUsername });
                        usernameElement.textContent = newUsername;
                        usernameStatus.textContent = 'Username updated successfully!';
                        usernameStatus.style.color = 'green';
                        localStorage.setItem('userProfile', JSON.stringify({
                            name: newUsername,
                            image: cachedProfile ? cachedProfile.image : 'user.svg'
                        }));
                        setTimeout(() => {
                            usernameStatus.textContent = '';
                        }, 2000);
                    } else {
                        usernameStatus.textContent = 'Username is already taken.';
                        usernameStatus.style.color = 'red';
                        setTimeout(() => {
                            usernameStatus.textContent = '';
                        }, 2000);
                    }
                } catch (error) {
                    showError("Error updating username: " + error.message);
                    usernameStatus.textContent = 'Error updating username.';
                    usernameStatus.style.color = 'red';
                    setTimeout(() => {
                        usernameStatus.textContent = '';
                    }, 2000);
                }
            } else {
                showError('Please enter a username.');
                usernameStatus.textContent = 'Please enter a username.';
                usernameStatus.style.color = 'red';
                setTimeout(() => {
                    usernameStatus.textContent = '';
                }, 2000);
            }
        });
    }
});


            // Re-authenticate user
            reauthenticateButton.addEventListener("click", async () => {
                const currentPassword = currentPasswordInput.value.trim();
                if (currentPassword) {
                    const credential = EmailAuthProvider.credential(user.email, currentPassword);
                    try {
                        await reauthenticateWithCredential(user, credential);
                        reauthCredential = credential;
                        reauthenticateContainer.classList.add("hidden");
                        passwordStatus.textContent = 'Re-authentication successful. You can now change your password.';
                        passwordStatus.style.color = 'green';
                        setTimeout(() => {
                            passwordStatus.textContent = '';
                        }, 2000);
                    } catch (error) {
                        showError("Error while re-authenticating: " + error.message);
                        passwordStatus.textContent = 'Error re-authenticating. Please check your current password.';
                        passwordStatus.style.color = 'red';
                        setTimeout(() => {
                            passwordStatus.textContent = '';
                        }, 2000);
                    }
                } else {
                    passwordStatus.textContent = 'Please enter your current password.';
                    passwordStatus.style.color = 'red';
                    setTimeout(() => {
                        passwordStatus.textContent = '';
                    }, 2000);
                }
            });

            // Change password
            changePasswordButton.addEventListener("click", async () => {
                const newPassword = newPasswordInput.value.trim();
                if (newPassword) {
                    if (!reauthCredential) {
                        reauthenticateContainer.classList.remove("hidden");
                        passwordStatus.textContent = 'Please re-authenticate to change your password.';
                        passwordStatus.style.color = 'red';
                        return;
                    }

                    try {
                        await updatePassword(user, newPassword);
                        passwordStatus.textContent = 'Password updated successfully!';
                        passwordStatus.style.color = 'green';
                        setTimeout(() => {
                            passwordStatus.textContent = '';
                        }, 2000);
                    } catch (error) {
                        showError("Error while updating password: " + error.message);
                        passwordStatus.textContent = 'Error updating password.';
                        passwordStatus.style.color = 'red';
                        setTimeout(() => {
                            passwordStatus.textContent = '';
                        }, 2000);
                    }
                } else {
                    passwordStatus.textContent = 'Please enter a password.';
                    passwordStatus.style.color = 'red';
                    setTimeout(() => {
                        passwordStatus.textContent = '';
                    }, 2000);
                }
            });

            // Log out user
            logoutButton.addEventListener("click", () => {
                signOut(auth).then(() => {
                    localStorage.removeItem('userProfile'); // Clear cached data
                    window.location.href = "../index.html";
                }).catch((error) => {
                    showError("Error signing out: " + error.message);
                });
            });

            // Handle profile picture change
            const imageElements = document.querySelectorAll(".selectable-image");
            imageElements.forEach((imageElement) => {
                imageElement.addEventListener("click", async () => {
                    const file = imageElement.src;
                    if (file) {
                        try {
                            // Save the selected image to Firebase Storage
                            const response = await fetch(file);
                            const blob = await response.blob();
                            const profilePictureRef = storageRef(storage, `profilePictures/${auth.currentUser.uid}`);
                            await uploadBytes(profilePictureRef, blob);
        
                            // Get the download URL and update the user's profile picture URL
                            const downloadURL = await getDownloadURL(profilePictureRef);
                            await update(ref(database, 'users/' + auth.currentUser.uid), { profilePictureUrl: downloadURL });
                            profileImageElement.src = downloadURL;
        
                            // Update the cached profile data
                            const cachedProfile = JSON.parse(localStorage.getItem('userProfile'));
                            localStorage.setItem('userProfile', JSON.stringify({
                                name: cachedProfile ? cachedProfile.name : 'Please update your username',
                                image: downloadURL
                            }));
        
                            showSuccess("Profile picture updated successfully!");
                        } catch (error) {
                            showError("Error while uploading profile picture: " + error.message);
                        }
                    }
                });
            });
        } else {
            usernameElement.textContent = 'User not signed in';
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const iconButtons = document.querySelectorAll('.icon-button');

    iconButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            iconButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to the clicked button
            button.classList.add('active');
        });
    });

    // Rotate settings icon on click
    document.getElementById('settings-button').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default anchor click behavior
        this.classList.toggle('rotate'); // Toggle the rotate class
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const genderSwitch = document.getElementById("gender-switch");
    const usernameElement = document.getElementById("username");
  
    // Set initial state based on user data
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          genderSwitch.checked = userData.gender === "female";
          updateDisplayNameWithGender(userData.username, userData.gender);
        }
      }
    });
  
    genderSwitch.addEventListener("change", async () => {
      const isFemale = genderSwitch.checked;
      const gender = isFemale ? "female" : "male";
      const user = auth.currentUser;
  
      try {
        if (user) {
          await update(ref(database, 'users/' + user.uid), { gender: gender });
          showSuccess(`Gender updated to ${gender}.`);
          // Update display name with gender symbol
          const snapshot = await get(ref(database, 'users/' + user.uid));
          if (snapshot.exists()) {
            const userData = snapshot.val();
            updateDisplayNameWithGender(userData.username, gender);
          }
        } else {
          showError("User is not authenticated.");
        }
      } catch (error) {
        showError("Error updating gender: " + error.message);
      }
    });
  
    function updateDisplayNameWithGender(username, gender) {
      let symbol = "♂️";
      if (gender === "male") {
        symbol = " ♂️";
      } else if (gender === "female") {
        symbol = " ♀️";
      }
      usernameElement.textContent = username + symbol;
    }
  });
  