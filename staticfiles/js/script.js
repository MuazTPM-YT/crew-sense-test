function openTab(event, tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    const tabLinks = document.querySelectorAll('.tab-link');

    tabContents.forEach(content => content.style.display = 'none');
    tabLinks.forEach(link => link.classList.remove('active'));

    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.classList.add('active');
  }

const left_englishButton = document.getElementById('left-english-btn');
const left_brailleButton = document.getElementById('left-braille-btn');
const right_englishButton = document.getElementById('right-english-btn');
const right_brailleButton = document.getElementById('right-braille-btn');

left_englishButton.addEventListener('click', function () {
    left_englishButton.classList.add('selected');
    left_brailleButton.classList.remove('selected');
    right_brailleButton.classList.add('selected');
    right_englishButton.classList.remove('selected');
});

left_brailleButton.addEventListener('click', function () {
    left_brailleButton.classList.add('selected');
    left_englishButton.classList.remove('selected');
    right_englishButton.classList.add('selected');
    right_brailleButton.classList.remove('selected');
});