for (const controls of document.querySelectorAll('[data-controls-for]')) {
  const rail = document.getElementById(controls.dataset.controlsFor);
  const buttons = [...controls.querySelectorAll('button')];
  if (!rail || buttons.length !== 2) continue;

  const update = () => {
    const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
    buttons[0].disabled = rail.scrollLeft <= 2;
    buttons[1].disabled = rail.scrollLeft >= max - 2;
    controls.hidden = max <= 2;
  };

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const card = rail.firstElementChild;
      const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0;
      rail.scrollBy({ left: Number(button.dataset.direction) * ((card?.getBoundingClientRect().width || rail.clientWidth) + gap), behavior: 'smooth' });
    });
  }

  rail.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
}
