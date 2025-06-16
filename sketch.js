let waves = {};
let labels = ['delta', 'theta', 'alpha', 'beta'];
let baseFreqs = {
  delta: 1,
  theta: 4,
  alpha: 8,
  beta: 16
};
let baseAmps = {
  delta: 50,
  theta: 40,
  alpha: 35,
  beta: 30
};
let noiseOffsets = {};
let harmonicFreqs = {};
let harmonicPhases = {};

let capturer;
let capturing = true;
let captureDuration = 5 * 60; // 5 seconds at 60 FPS

function setup() {
  createCanvas(900, 600);
  frameRate(60);
  textFont('Helvetica');
  textSize(14);

  for (let label of labels) {
    waves[label] = [];
    noiseOffsets[label] = random(1000);
    harmonicFreqs[label] = [random(0.5, 2), random(0.5, 2)];
    harmonicPhases[label] = [random(TWO_PI), random(TWO_PI)];
  }

  capturer = new CCapture({ format: 'gif', workersPath: './' });
  capturer.start();
}

function draw() {
  background(255);
  let spacing = height / labels.length;
  let t = millis() / 1000;

  for (let i = 0; i < labels.length; i++) {
    let label = labels[i];
    let centerY = (i + 0.5) * spacing;

    let ampMod = map(noise(noiseOffsets[label]), 0, 1, 0.6, 1.4);
    noiseOffsets[label] += 0.005;

    let baseFreq = baseFreqs[label] * 0.6;
    let baseAmp = baseAmps[label] * ampMod;

    let wave =
      sin(TWO_PI * baseFreq * t) +
      0.5 * sin(TWO_PI * baseFreq * harmonicFreqs[label][0] * t + harmonicPhases[label][0]) +
      0.3 * sin(TWO_PI * baseFreq * harmonicFreqs[label][1] * t + harmonicPhases[label][1]);

    wave *= baseAmp;

    waves[label].unshift(wave);
    if (waves[label].length > width / 2) {
      waves[label].pop();
    }

    noStroke();
    fill(0);
    text(label, 10, centerY - baseAmps[label] - 10);

    noFill();
    stroke(0);
    beginShape();
    for (let j = 0; j < waves[label].length; j++) {
      vertex(width - j * 2, centerY + waves[label][j]);
    }
    endShape();
  }

  if (capturing) {
    capturer.capture(canvas);
    if (frameCount >= captureDuration) {
      capturer.stop();
      capturer.save();
      capturing = false;
      console.log("🎉 GIF saved!");
    }
  }
}
