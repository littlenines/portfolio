import { STREAM_BEAM_THEME } from '@lib/themes';
import { watchActivity, type ActivityState } from '@scripts/lib/activity';
import { currentTheme, onThemeChange } from '@scripts/theme/state';
import { createAmbientClock } from '../ambient-clock';
import { addInNextTask, whenMotionAllowed } from '../gsap';
import { addAmbientLoops } from './ambient-loops';
import { playIntro } from './intro';
import { createMeteorShower } from './meteor';
import { addScrollEffects } from './scroll-effects';
import { createStreamBeams } from './stream-beams';

const AMBIENT_FPS = 15;

function startAmbience(hero: HTMLElement, context: gsap.Context): () => void {
  const ambient = createAmbientClock(AMBIENT_FPS);
  const streamBeams = createStreamBeams(hero, context);
  const meteors = createMeteorShower(hero);

  addAmbientLoops(ambient, hero);

  let activity: ActivityState = { isShown: false, isScrolling: false };

  const sync = () => {
    const isCalm = activity.isShown && !activity.isScrolling;

    ambient.setRunning(isCalm);
    meteors.setActive(isCalm);
    streamBeams.setRunning(activity.isShown && currentTheme() === STREAM_BEAM_THEME);
  };

  const stopWatchingActivity = watchActivity(hero, (state) => {
    activity = state;
    sync();
  });

  const stopWatchingTheme = onThemeChange(sync);

  return () => {
    stopWatchingActivity();
    stopWatchingTheme();
    ambient.kill();
    streamBeams.kill();
    meteors.kill();
  };
}

export function initHeroMotion() {
  const hero = document.querySelector<HTMLElement>('.hero');

  if (!hero) return;

  whenMotionAllowed((context) => {
    playIntro(hero);

    const cancelScrollEffects = addInNextTask(context, () => addScrollEffects(hero));
    const cancelAmbience = addInNextTask(context, () => startAmbience(hero, context));

    return () => {
      cancelScrollEffects();
      cancelAmbience();
    };
  });
}
