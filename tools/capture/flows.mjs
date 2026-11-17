/**
 * flows.mjs — the scripted clips record.mjs knows how to make.
 *
 * Each flow has:
 *   description  one line for --list
 *   at           where the capture lead should be playing from (seconds) when
 *                recording starts; the lead is ~100 s long, so keep
 *                at + duration under that unless the flow changes track
 *   poster       the frame (seconds into the clip) for <flow>.poster.jpg
 *   setup(app)   real-time preparation before the first frame; `app.eval`
 *                runs renderer code with `capture` (lib/oscine.mjs helpers)
 *   script(r)    the clip itself, against the Recorder DSL (lib/recorder.mjs)
 *
 * Every flow starts from the same base: dark Oscine theme, overlays closed,
 * EQ off, Library route, the capture lead playing at `at`.
 */

import { EQ_CURVE } from './lib/oscine.mjs'

export const FLOWS = {
  /** Storyboard 1: fly through a large library, then search as you type. */
  'library-flythrough': {
    description: 'Library songs list: a fast scroll down and back, then search as you type',
    at: 12,
    poster: 0,
    async setup(app) {
      await app.eval(`await capture.route('library'); return true;`)
    },
    async script(r) {
      await r.hold(0.6)
      await r.scroll('auto', { to: 5200, seconds: 2.2, ease: 'inOut' })
      await r.hold(0.35)
      await r.scroll('auto', { to: 0, seconds: 1.1, ease: 'inOut' })
      await r.hold(0.3)
      await r.type({ placeholder: 'Search title, artist, album' }, 'shuffle', { cps: 9 })
      await r.hold(1.6)
    }
  },

  /** Storyboard 3: Stage — the cover grows into a visualizer, lyrics alongside. */
  'stage-visualizer': {
    description: 'Now Playing: the cover grows into the Halo visualizer with lyrics alongside',
    at: 12,
    poster: 0,
    async setup(app) {
      await app.eval(`
        await capture.route('now-playing');
        const viz = capture.store('visualizer');
        if (viz.wanted) viz.toggle();
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return true;
      `)
    },
    async script(r) {
      await r.hold(0.8)
      await r.visualizer('halo')
      await r.hold(5)
    }
  },

  /** Storyboard 6 (first half): drag a band on the EQ curve over a live spectrum. */
  'eq-drag': {
    description: 'Tools → Equalizer: drag a peaking band up and across over the live spectrum',
    at: 12,
    poster: 0,
    async setup(app) {
      await app.eval(`
        await capture.route('tools');
        capture.store('tools').select('equalizer');
        await capture.nextFrames(4);
        const eq = capture.store('equalizer');
        await capture.unwrap(window.oscine.settings.set({ key: 'audio.eq.enabled', value: true }));
        eq.enabled = true;
        eq.active = {
          enabled: true,
          preampDb: -3.5,
          bands: ${JSON.stringify(EQ_CURVE)}.map((band, index) => ({
            id: 'capture-band-' + index, enabled: true, ...band
          }))
        };
        await capture.nextFrames(4);
        // The toggle is pane-local state, so it survives a previous flow.
        const spectrum = [...document.querySelectorAll('button[aria-pressed]')]
          .find((button) => button.textContent?.trim() === 'Spectrum');
        if (spectrum?.getAttribute('aria-pressed') !== 'true') capture.click('Spectrum');
        await new Promise((resolve) => setTimeout(resolve, 900));
        return true;
      `)
    },
    async script(r) {
      await r.hold(0.8)
      await r.eqDrag(3, { dx: 70, dy: -38, seconds: 1.4 })
      await r.hold(0.6)
      await r.eqDrag(1, { dx: -30, dy: 30, seconds: 1.1 })
      await r.hold(1.2)
    }
  }
}
