import { STREAM_BEAM_THEME } from '@lib/themes';
import { watchActivity, type ActivityState } from '@scripts/lib/activity';
import { currentTheme, onThemeChange } from '@scripts/theme/state';
import { createAmbientClock } from '../ambient-clock';
import { whenMotionAllowed } from '../gsap';
import { addAmbientLoops } from './ambient-loops';
import { playIntro } from './intro';
import { createMeteorShower } from './meteor';
import { addScrollEffects } from './scroll-effects';
import { addStreamBeamPackets } from './stream-beams';

const AMBIENT_FPS = 15;
const STREAM_BEAM_FPS = 30;

export function initHeroMotion() {
  const hero = document.querySelector<HTMLElement>('.hero');

  if (!hero) return;

  whenMotionAllowed(() => {
    playIntro(hero);
    addScrollEffects(hero);

    const ambient = createAmbientClock(AMBIENT_FPS);
    const streamBeams = createAmbientClock(STREAM_BEAM_FPS);
    const meteors = createMeteorShower(hero);

    addAmbientLoops(ambient, hero);

    const hasStreamBeams = addStreamBeamPackets(streamBeams, hero);
    let activity: ActivityState = { isShown: false, isScrolling: false };

    const sync = () => {
      const isCalm = activity.isShown && !activity.isScrolling;

      ambient.setRunning(isCalm);
      meteors.setActive(isCalm);
      streamBeams.setRunning(hasStreamBeams && activity.isShown && currentTheme() === STREAM_BEAM_THEME);
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
  });
}
