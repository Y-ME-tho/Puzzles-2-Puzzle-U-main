/* CLIENT SIDE FRONTEND LOGIC */     
const menu = document.getElementById('menu');
const menuToggle = document.getElementById('menu-toggle'); 
const closeMenu = document.getElementById('close-menu'); 

// Toggle menu open/close
const openMenu = () => {
    menu.classList.remove('w-0');
    menu.classList.add('w-1/2'); // Open menu
    closeMenu.classList.remove('rotate-45'); // Reset cross rotation
};

const closeMenuFunc = () => {
    menu.classList.add('w-0');
    menu.classList.remove('w-1/2'); // Close menu
    closeMenu.classList.add('rotate-45'); // Rotate cross button
};

// Toggle menu
menuToggle.addEventListener('click', openMenu);

// Close menu with close button
closeMenu.addEventListener('click', closeMenuFunc);

// Close menu if clicking outside
window.addEventListener('click', (e) => {
    if (
        !menu.contains(e.target) &&
        e.target !== menuToggle &&
        e.target !== closeMenu
    ) {
        closeMenuFunc();
    }
});

const detailsForm = document.getElementById('details-form');
const responseForm = document.getElementById('response-form');

let globalName = '';
let globalEmail = '';

// 1) Name/Email submission
detailsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');

    if (nameField.value && emailField.value) {
        globalName = nameField.value;
        globalEmail = emailField.value;

        const carousel = new bootstrap.Carousel('#carouselExample');
        carousel.next(); // Move to the next slide
    }
});

// 2) Puzzle response submission
responseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const responseField = document.getElementById('response');
    const answer = responseField.value;

    if (!answer) {
      alert('Please enter a response!');
      return;
    }

    try {
      // *** IMPORTANT: Adjust if your server is deployed somewhere else ***
      // e.g. if running locally: http://localhost:3000/submit
      const backendURL = 'http://localhost:3000/submit';

      const res = await fetch(backendURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: globalName,
          email: globalEmail,
          answer,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.isCorrect) {
          alert('🎉 Correct! Your response has been recorded.');
        } else {
          alert('❌ Incorrect! Try again (if you still have attempts left).');
        }
      } else {
        // e.g. "Max attempts reached"
        alert(data.error || 'Unknown error occurred.');
      }
    } catch (err) {
      console.error('Error during submission:', err);
      alert('Server error. Please try again later.');
    }
});
