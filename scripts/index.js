const menu = document.getElementById('menu');
const menuToggle = document.getElementById('menu-toggle');
const closeMenu = document.getElementById('close-menu');

const openMenu = () => {
  menu.classList.remove('w-0');
  menu.classList.add('w-1/2');
  closeMenu.classList.remove('rotate-45');
};

const closeMenuFunc = () => {
  menu.classList.add('w-0');
  menu.classList.remove('w-1/2');
  closeMenu.classList.add('rotate-45');
};

menuToggle.addEventListener('click', openMenu);
closeMenu.addEventListener('click', closeMenuFunc);
window.addEventListener('click', (e) => {
  if (!menu.contains(e.target) && e.target !== menuToggle && e.target !== closeMenu) {
    closeMenuFunc();
  }
});

const detailsForm = document.getElementById('details-form');
const responseForm = document.getElementById('response-form');
let globalName = '';
let globalEmail = '';

detailsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nameField = document.getElementById('name');
  const emailField = document.getElementById('email');
  if (nameField.value && emailField.value) {
    globalName = nameField.value;
    globalEmail = emailField.value;
    const carousel = new bootstrap.Carousel('#carouselExample');
    carousel.next();
  }
});

responseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const responseField = document.getElementById('response');
  const answer = responseField.value;
  if (!answer) {
    alert('Please enter a response!');
    return;
  }
  try {
    const backendURL = 'https://puzzles-backend.onrender.com/submit';
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
      alert(data.error || 'Unknown error occurred.');
    }
  } catch (err) {
    console.error('Error during submission:', err);
    alert('Server error. Please try again later.');
  }
});
