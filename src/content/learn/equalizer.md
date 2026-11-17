---
title: 'Tools: equalizer'
description: Shape your sound with a parametric EQ, save presets, assign them to albums and artists, or load a curve made for your headphones.
order: 10
section: App
---

Oscine has a parametric equalizer with up to twelve bands. Open **Equalizer** from the Tools tab or the **Tools** menu in the title bar. The switch at the top left turns it on and off, and it starts off. Switching it off leaves your curve in place, so you can flip back and forth to hear the difference.

You don't have to open the pane to use it. The **Tools** menu (also behind the arrow next to the Tools tab) has **Equalizer on** and an **Equalizer preset** submenu with a check next to the curve that's live. In the command palette, **Turn equalizer on/off** does the same, and **Equalizer:** followed by a preset name switches straight to that preset.

<!-- shot: tools-equalizer -->

## Shaping the curve

Each numbered handle on the graph is a band. Drag a handle left and right to move its frequency, and up and down to change its gain. Scroll over a handle, or hold **Shift** while you drag, to make it narrower or wider (its Q). **Alt**-click a handle to bypass that band, and right-click it for more options. Double-click an empty spot on the graph to add a new band there, up to twelve in total.

If you'd rather type exact numbers, the table under the graph lists every band with its type, frequency, gain, and Q. Each band can be a peak, a low or high shelf, a low-pass or high-pass, or a notch. Frequency runs from 20 Hz to 20 kHz, gain from −24 to +24 dB, and Q from 0.1 to 18. Low-pass, high-pass, and notch bands have no gain, so their gain shows `n/a`. The checkbox on each row turns that band off without deleting it.

Turn on **Spectrum** to see your music's frequencies moving behind the curve as it plays. The **±12 dB** menu on the right switches the graph to ±24 dB if you need more room. Undo and redo sit next to the preset menu, and <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> work too.

## Keeping it clean

Boosting frequencies makes the signal louder, and too much of that distorts. The **Preamp** slider, from −24 to +12 dB, lowers everything going into the EQ to make room. Click **Auto** and Oscine sets the preamp to just cancel out your curve's biggest boost. If the output does clip, the **Clip** indicator on the right lights up.

## Presets

Oscine starts you on a flat curve with no bands, and there are no built-in presets, so every preset in the list is one you made or loaded. Once you have a curve you like, open the menu next to the preset selector and choose **Save as…** to give it a name. **Save** updates the preset you have open. The same menu has **Rename**, **Delete**, and **Reset to flat**. Pick any saved preset from the selector to load it.

That menu is also where you bring in curves from elsewhere:

- **Load device…** opens a searchable list of 736 headphone and IEM profiles by oratory1990, via AutoEq. Find your model and Oscine loads its correction curve.
- **Import text…** takes a parametric EQ profile in the `ParametricEQ.txt` format that AutoEq and Equalizer APO use. Paste it in and the bands fill in for you. If the profile has more than twelve filters, the extras are dropped.

## Presets for albums, artists, and playlists

Some records just sound better with their own curve. Right-click an album or artist in the library sidebar, or a playlist on the Curate rail, and choose **EQ preset** to pick one of your saved presets. Choosing **None** removes it.

When something plays, one assignment applies, and the most specific one wins: the album's first, then the artist's, then the playlist's. A playlist's preset applies when you're playing that playlist, not whenever a song from it comes up somewhere else.

The **Assigned to** list in the Equalizer pane shows every assignment you've made, and you can remove any of them from there. Turn on **Edit override** to tweak the assigned curve for what's playing without touching your main one. With it off, your edits go to your main curve, and you won't hear them until something without an assignment plays.
