const wheel = document.getElementById("wheel");
const ctx = wheel.getContext("2d");
const spinBtn = document.getElementById("spin");
const resultDiv = document.getElementById("result");

const prizes = [
  { label: "(Kámen)", icon: "🪨" },
  { label: "(Dřevo)", icon: "🪵" },
  { label: "(2x Dřevo)", icon: "🪵🪵" },
  { label: "(2x Kámen)", icon: "🪨🪨" },
  { label: "(Dřevo + $1)", icon: "🪵 + 💰" },
  { label: "(Kámen + $1)", icon: "🪨 + 💰" },
  { label: "(Kámen + Dřevo)", icon: "🪨 + 🪵" },
  { label: "(Nic 😢)", icon: "😢" },
];

const colors = [
  "#f7ca88",
  "#e67e22",
  "#b5651d",
  "#f9e4b7",
  "#f7ca88",
  "#e67e22",
  "#b5651d",
  "#f9e4b7",
];

const pandaImg = new Image();
pandaImg.src = "panda.png"; // Obrázek pandy

// Funkční zvuky z veřejných CDN
const sounds = {
  spin: new Audio("spin.mp3"),
  win: new Audio("win.mp3"),
  bigwin: new Audio("bigwin.mp3"),
  lose: new Audio("lose.mp3"),
};
sounds.spin.volume = 0.5;
sounds.win.volume = 0.7;
sounds.bigwin.volume = 1.0;
sounds.lose.volume = 0.7;

// Zvětšení plátna
wheel.width = 600;
wheel.height = 600;

function drawWheel(angle = 0, highlightIndex = null) {
  ctx.clearRect(0, 0, wheel.width, wheel.height);
  const centerX = wheel.width / 2;
  const centerY = wheel.height / 2;
  const radius = 270;
  const segAngle = (2 * Math.PI) / prizes.length;
  for (let i = 0; i < prizes.length; i++) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(
      centerX,
      centerY,
      radius,
      angle + i * segAngle,
      angle + (i + 1) * segAngle
    );
    ctx.closePath();
    // Zvýraznění vybraného segmentu
    if (highlightIndex !== null && i === highlightIndex) {
      ctx.shadowColor = "#00ff00";
      ctx.shadowBlur = 40;
      ctx.fillStyle = "#00ff00";
    } else {
      ctx.shadowBlur = 0;
      ctx.fillStyle = colors[i];
    }
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle + (i + 0.5) * segAngle);
    ctx.textAlign = "center";
    ctx.font = "bold 32px Comic Sans MS";
    ctx.fillStyle = "#222";
    ctx.fillText(prizes[i].icon, radius - 80, 10);
    ctx.font = "20px Comic Sans MS";
    ctx.fillText(prizes[i].label, radius - 80, 40);
    ctx.restore();
    ctx.restore();
  }
  // Panda obrázek uprostřed - vykreslit pouze pokud je načtený a validní
  if (pandaImg.complete && pandaImg.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 90, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(pandaImg, centerX - 90, centerY - 90, 180, 180);
    ctx.restore();
  }
}

drawWheel();

let spinning = false;
let currentAngle = 0; // Uchovává aktuální úhel kola

spinBtn.onclick = function () {
  if (spinning) return;
  spinning = true;
  resultDiv.textContent = "";
  resultDiv.className = "";
  let angle = currentAngle; // Začínáme z aktuální pozice
  let speed = Math.random() * 0.2 + 0.35;
  let deceleration = 0.97 + Math.random() * 0.002;
  let totalSpins = Math.floor(Math.random() * 4) + 4;
  let spins = 0;
  let spinSoundPlayed = false;
  function animate() {
    angle += speed;
    speed *= deceleration;
    // Výpočet aktuálně vybraného segmentu (vždy nahoře pod šipkou)
    const segAngle = (1 * Math.PI) / prizes.length;
    let selected =
      Math.floor(((angle % (2 * Math.PI)) + 2 * Math.PI) / segAngle) %
      prizes.length;
    selected = (prizes.length - selected) % prizes.length;
    drawWheel(angle, selected);
    if (!spinSoundPlayed) {
      sounds.spin.currentTime = 0;
      sounds.spin.play();
      spinSoundPlayed = true;
    }
    if (speed > 0.01 || spins < totalSpins) {
      if (speed < 0.01) spins++;
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      sounds.spin.pause();
      sounds.spin.currentTime = 0;
      // Efekty podle výhry
      let effect = "";
      let sound = sounds.win;
      if (
        selected === 2 ||
        selected === 3 ||
        selected === 4 ||
        selected === 5 ||
        selected === 6
      ) {
        effect = "bigwin";
        sound = sounds.bigwin;
      } else if (selected === 7) {
        effect = "lose";
        sound = sounds.lose;
      } else {
        effect = "win";
        sound = sounds.win;
      }
      resultDiv.className = effect;
      resultDiv.innerHTML = `<strong>Výhra:</strong> ${prizes[selected].icon} ${prizes[selected].label}`;
      sound.currentTime = 0;
      sound.play();
      currentAngle = angle % (2 * Math.PI); // Uložíme aktuální pozici kola
      // Po zastavení zvýrazni segment
      drawWheel(currentAngle, selected);
    }
  }
  animate();
};
