import { gsap } from './gsap';

const MS_PER_SECOND = 1000;

interface Track {
  animation: gsap.core.Animation;
  startOffset: number;
}

export interface AmbientClock {
  // startOffset > 0 starts the animation part-way through; < 0 holds it back like a delay
  add: (animation: gsap.core.Animation, startOffset?: number) => void;
  setRunning: (isRunning: boolean) => void;
  kill: () => void;
}

// Drives slow, looping background animations at a capped frame rate instead of every frame.
// Each change inside the skyline SVG makes the browser restyle the whole drawing, so at 60fps
// the hero kept a throttled phone's main thread busy most of the time, even with nothing moving fast.
export function createAmbientClock(framesPerSecond: number): AmbientClock {
  const tracks: Track[] = [];
  const frameSeconds = 1 / framesPerSecond;
  let elapsed = 0;
  let sinceLastRender = 0;
  let isRunning = false;

  const render = () => {
    for (const { animation, startOffset } of tracks) animation.totalTime(Math.max(0, elapsed + startOffset));
  };

  const onTick = (_time: number, deltaMs: number) => {
    const deltaSeconds = deltaMs / MS_PER_SECOND;

    elapsed += deltaSeconds;
    sinceLastRender += deltaSeconds;

    if (sinceLastRender < frameSeconds) return;

    sinceLastRender = 0;
    render();
  };

  return {
    add: (animation, startOffset = 0) => {
      animation.pause();
      tracks.push({ animation, startOffset });
      animation.totalTime(Math.max(0, elapsed + startOffset));
    },

    setRunning: (shouldRun) => {
      if (shouldRun === isRunning) return;

      isRunning = shouldRun;

      if (shouldRun) gsap.ticker.add(onTick);
      else gsap.ticker.remove(onTick);
    },

    kill: () => {
      gsap.ticker.remove(onTick);

      for (const { animation } of tracks) animation.kill();

      tracks.length = 0;
    },
  };
}
