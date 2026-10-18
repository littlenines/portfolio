import { mixRgb, readRgbToken, type Rgb } from '@scripts/lib/color';
import { onVisibilityChange } from '@scripts/lib/dom';
import { prefersReducedMotion } from '@scripts/lib/media';
import { onThemeChange } from '@scripts/theme/state';

const COLOR_TOKENS = ['--wave-1-rgb', '--wave-2-rgb', '--wave-3-rgb'] as const;

interface WaveLayer {
  alpha: number;
  amplitude: number;
  speed: number;
  frequency: number;
}

const LAYERS: readonly WaveLayer[] = [
  { alpha: 0.42, amplitude: 10, speed: 0.5, frequency: 1 },
  { alpha: 0.24, amplitude: 7, speed: -0.35, frequency: 1.6 },
  { alpha: 0.15, amplitude: 5, speed: 0.22, frequency: 2.4 },
];

const MAX_PIXEL_RATIO = 2;
const LINE_WIDTH = 1.2;
const SAMPLE_STEP_PX = 3;
const ENVELOPE_POWER = 1.2;
const ENVELOPE_FLOOR = 0.25;
const PRIMARY_RIPPLES = 14;
const SECONDARY_RIPPLES = 31;
const PRIMARY_SHARE = 0.62;
const SECONDARY_SHARE = 0.38;
const PRIMARY_SPEED = 2;
const SECONDARY_SPEED = 3;
const COLOR_EASING = 0.06;
const MAX_FRAME_SECONDS = 0.05;
const MS_PER_SECOND = 1000;
const START_TIME = 2;

const BLIP = {
  width: 0.05,
  strength: 1.1,
  crossingSeconds: 3.2,
  firstAfter: 3,
  minInterval: 4,
  intervalRange: 4,
  enterAt: -0.05,
  exitAt: 1.1,
} as const;
const NO_BLIP = -1;

const toRgba = ([red, green, blue]: Rgb, alpha: number) =>
  `rgba(${Math.round(red)},${Math.round(green)},${Math.round(blue)},${alpha})`;

const readTargetColors = (): Rgb[] => COLOR_TOKENS.map((token) => readRgbToken(token));

class FooterWave {
  readonly #canvas: HTMLCanvasElement;
  readonly #context: CanvasRenderingContext2D;
  #width = 0;
  #height = 0;
  #time = START_TIME;
  #lastFrame = 0;
  #isRunning = false;
  #isVisible = false;
  #blipPosition = NO_BLIP;
  #secondsToNextBlip: number = BLIP.firstAfter;
  #targetColors = readTargetColors();
  #colors = structuredClone(this.#targetColors);

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.#canvas = canvas;
    this.#context = context;

    new ResizeObserver(() => this.#fitToCanvas()).observe(canvas);

    onVisibilityChange(canvas, (isVisible) => {
      this.#isVisible = isVisible;

      if (isVisible) this.#start();
      else this.#isRunning = false;
    });

    onThemeChange(() => {
      this.#targetColors = readTargetColors();

      if (this.#isRunning) return;

      this.#colors = structuredClone(this.#targetColors);
      this.#draw();
    });
  }

  #draw() {
    const context = this.#context;

    this.#colors = this.#colors.map((color, index) => mixRgb(color, this.#targetColors[index], COLOR_EASING));

    const middle = this.#height / 2;

    context.clearRect(0, 0, this.#width, this.#height);
    context.lineWidth = LINE_WIDTH;

    for (const [index, layer] of LAYERS.entries()) {
      context.strokeStyle = toRgba(this.#colors[index], layer.alpha);
      context.beginPath();

      for (let x = 0; x <= this.#width; x += SAMPLE_STEP_PX) {
        const progress = x / this.#width;
        const envelope = Math.sin(Math.PI * progress) ** ENVELOPE_POWER;
        const blipDistance = (progress - this.#blipPosition) / BLIP.width;
        const blip = this.#blipPosition === NO_BLIP ? 0 : Math.exp(-(blipDistance ** 2)) * BLIP.strength;
        const amplitude = layer.amplitude * (envelope * (1 - ENVELOPE_FLOOR) + ENVELOPE_FLOOR) * (1 + blip);
        const phase = this.#time * layer.speed;

        const y =
          middle +
          amplitude *
            (PRIMARY_SHARE * Math.sin(progress * PRIMARY_RIPPLES * layer.frequency + phase * PRIMARY_SPEED) +
              SECONDARY_SHARE *
                Math.sin(progress * SECONDARY_RIPPLES * layer.frequency - phase * SECONDARY_SPEED + index));

        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }

      context.stroke();
    }
  }

  #fitToCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const { width, height } = this.#canvas.getBoundingClientRect();

    this.#width = width;
    this.#height = height;
    this.#canvas.width = Math.round(width * pixelRatio);
    this.#canvas.height = Math.round(height * pixelRatio);
    this.#context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    this.#draw();
  }

  #advanceBlip(seconds: number) {
    if (this.#blipPosition !== NO_BLIP) {
      this.#blipPosition += seconds / BLIP.crossingSeconds;

      if (this.#blipPosition > BLIP.exitAt) {
        this.#blipPosition = NO_BLIP;
        this.#secondsToNextBlip = BLIP.minInterval + Math.random() * BLIP.intervalRange;
      }
    } else {
      this.#secondsToNextBlip -= seconds;

      if (this.#secondsToNextBlip <= 0) this.#blipPosition = BLIP.enterAt;
    }
  }

  #tick = (now: number) => {
    if (!this.#isRunning) return;

    const seconds = Math.min(MAX_FRAME_SECONDS, (now - this.#lastFrame) / MS_PER_SECOND || 0);

    this.#lastFrame = now;
    this.#time += seconds;
    this.#advanceBlip(seconds);
    this.#draw();
    requestAnimationFrame(this.#tick);
  };

  #start() {
    if (prefersReducedMotion() || !this.#isVisible || this.#isRunning) return;

    this.#isRunning = true;
    this.#lastFrame = performance.now();
    requestAnimationFrame(this.#tick);
  }
}

export function initFooterWave(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');

  if (context) new FooterWave(canvas, context);
}
