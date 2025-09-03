document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('.nav-button');

  pills.forEach(pill => {
    pill.addEventListener('click', (event) => {
      event.preventDefault();
      // TODO: implement navigation when sections are available
    });
  });
});
