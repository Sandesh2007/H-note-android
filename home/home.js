
document.addEventListener('DOMContentLoaded', () => {
    const iconButtons = document.querySelectorAll('.icon-button');
  
    iconButtons.forEach(button => {
      button.addEventListener('click', () => {
        // remove active class from all buttons
        iconButtons.forEach(btn => btn.classList.remove('active'));
  
        // add active class to the clicked button
        button.classList.add('active');
      });
    });
  });
  
//   rotate setting icon on click

document.getElementById('settings-button').addEventListener('click', function(event) {
    event.preventDefault(); // prevent default anchor click behavior
    this.classList.toggle('rotate'); // toggle the rotate class
});
