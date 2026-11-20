const segments = [
  { label: 'DRAW 2',        color: '#ed1c24' },
  { label: 'TRADE HANDS',   color: '#0072bc' },
  { label: 'DISCARD COLOR', color: '#00a651' },
  { label: 'UNO WAR',       color: '#ffde00' },
  { label: 'ALMOST UNO',    color: '#ed1c24' },
  { label: 'SHOW HAND',     color: '#0072bc' },
  { label: 'DISCARD NUM',   color: '#00a651' },
  { label: 'DRAW RED',      color: '#ffde00' }
];
const spinAudio = new Audio('./wheel-spin-uno.mp3');
spinAudio.preload = 'auto';



const wheelSvg = document.getElementById('wheel-svg');
const spinBtn = document.getElementById('spin-btn');
const resultBox = document.getElementById('result-box');

const numSegments = segments.length;
const sliceAngle = 360 / numSegments;
const radius = 195;

let currentRotation = 0;
let isSpinning = false;
const wedgeGroups = [];

function buildWheel() {
  segments.forEach(function(seg, index) {
    const startAngle = index * sliceAngle;
    const endAngle = startAngle + sliceAngle;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = radius * Math.cos(startRad);
    const y1 = radius * Math.sin(startRad);
    const x2 = radius * Math.cos(endRad);
    const y2 = radius * Math.sin(endRad);
    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    const pathData = 'M 0 0 L ' + x1 + ' ' + y1 + ' A ' + radius + ' ' + radius + ' 0 ' + largeArcFlag + ' 1 ' + x2 + ' ' + y2 + ' Z';

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.classList.add('wedge-group');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', seg.color);
    path.classList.add('wedge-path');

    const midAngle = startAngle + sliceAngle / 2;
    const textRad = (midAngle - 90) * (Math.PI / 180);
    const textRadius = radius * 0.64;
    const tx = textRadius * Math.cos(textRad);
    const ty = textRadius * Math.sin(textRad);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', tx);
    text.setAttribute('y', ty);
    text.setAttribute('transform', 'rotate(' + midAngle + ', ' + tx + ', ' + ty + ')');
    text.classList.add('wedge-label');
    text.textContent = seg.label;

    group.appendChild(path);
    group.appendChild(text);
    wheelSvg.appendChild(group);
    wedgeGroups.push(group);
  });
}

function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;
  spinBtn.disabled = true;
  resultBox.textContent = 'Spinning...';

  wheelSvg.classList.remove('wheel-has-winner');
  wedgeGroups.forEach(function(g) { g.classList.remove('winner'); });

  const extraDegrees = Math.floor(Math.random() * 360);
  const totalSpin = 1800 + extraDegrees;
  currentRotation += totalSpin;

  wheelSvg.style.transform = 'rotate(' + currentRotation + 'deg)';
  spinAudio.currentTime = 0;
  spinAudio.play().catch(() => {});
}

wheelSvg.addEventListener('transitionend', function(event) {
  if (event.propertyName !== 'transform') return;
  spinAudio.pause();
  spinAudio.currentTime = 0;
  isSpinning = false;
  spinBtn.disabled = false;

  const normalizedAngle = currentRotation % 360;
  const pointerAngle = (360 - normalizedAngle) % 360;
  const winningIndex = Math.floor(pointerAngle / sliceAngle);

  wheelSvg.classList.add('wheel-has-winner');
  wedgeGroups[winningIndex].classList.add('winner');

  const winner = segments[winningIndex];
  resultBox.textContent = 'Landed on: ' + winner.label + '!';
  resultBox.style.borderColor = winner.color;
});

spinBtn.addEventListener('click', spinWheel);
buildWheel();
