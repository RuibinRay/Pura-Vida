# The home page film

The home page is one film of Costa Rica in 20 shots, scrubbed frame by frame with the scroll: the map from
above, a scarlet macaw's flight down through the clouds to a single waterfall, down the river to a zip-line
platform, across the gorge, a drop to the raft on the river below, the rapids, the calm water into a mangrove canal, a
Pacific beach, inland to Arenal, a crater, the National Theatre and through its doors, the ruins of Cartago, the stone
spheres in the National Museum, a Bribri house, a Boruca mask, and the macaw flying back up to a sky framed by leaves.
From the clouds to the mangroves it is one continuous flight: every take there was generated from the last frame of
the one before. The illustrated walk that was the home page until 13 November 2026 is the "Meet the wild" tab
(`/walk`), unchanged except that its sound button is gone.

## How it works

- **Shots and scroll** (`src/film/shots.ts`). The page is as tall as the film is long: 1919 frames at 2 vh of scroll a
  frame. Shots that continue one another (`into: 'join'`) meet with no gap, because the later take was generated from
  the earlier take's last frame; the others dissolve over 46 vh, and three come in through white (cloud, steam).
- **Clips** (`tools/film_build.py`, `public/film/<shot>/{sd,hd}.pvf`). Each shot is H.264 at 12 frames a second with a
  keyframe every 12 frames, in a small container of our own that lists every frame's bytes (the format is described at
  the top of the build tool). Two sizes: 960×540 (phones, the lite tier, slow links) and 1600×900. The whole film is
  27 MB small and 69 MB large; a visitor only downloads the shots they scroll through.
- **Player** (`src/film/frames.ts`, `src/film/usePlayer.ts`). The clips around the visitor are streamed and decoded a
  group of pictures at a time with WebCodecs, forwards or backwards, and drawn to a canvas; two neighbouring frames are
  blended while the scroll moves, and the picture settles on a whole frame when it stops. Nothing re-renders in React
  per frame. A "Play the film" button scrolls the page at film speed; any wheel, touch or key takes the scroll back.
- **Without motion.** With reduced motion (the system setting, unless the visitor overrides it), on the still tier and
  in a browser without WebCodecs the film is one still per shot, cross-faded by the scroll. The text tier is a page of
  the stills and their captions.
- **Captions** (`film.shots.*` in the three message files). Each uses a sourced record of the site; the three that are
  new (the Diquís spheres, the eight Indigenous peoples, the Boruca dance) are listed with what they were checked
  against in `src/film/photoCredits.ts` and shown in the film's notes.

## What every picture is

The film itself carries no labels. How each picture was made, and the credits of the photographs, are on the Sources
page (`/sources#film`), linked from the film's last shot.

| # | Shot | Made with | From | Take | Frames | Size (sd / hd) |
|---|---|---|---|---|---|---|
| 1 | `map` | the site's 3D map (`tools/film_map.mjs`) | — | — | 60 | 0.4 / 1.0 MB |
| 2 | `sky` | Kling 4.0 | text only | `a1-sky-kling4` | 121 | 0.5 / 1.4 MB |
| 3 | `falls` | Kling 4.0 | from the last frame of the previous shot's take | `r2-falls` | 121 | 0.8 / 1.9 MB |
| 4 | `river` | Kling 4.0 | from the last frame of the previous shot's take | `r3-river` | 97 | 0.7 / 1.8 MB |
| 5 | `zip` | Kling 4.0 | from the last frame of the previous shot's take | `r4-zip` | 97 | 0.7 / 1.6 MB |
| 6 | `drop` | Kling 4.0 | from the last frame of the previous shot's take | `r5-drop` | 73 | 0.5 / 1.3 MB |
| 7 | `raft` | Kling 4.0 | from the last frame of the previous shot's take to the author's scene `e12-mangrove-channel.png` | `r6-raft` | 121 | 1.6 / 3.6 MB |
| 8 | `float` | Google Veo 3.1 (fast, high) | from the author's scene `e12-mangrove-channel.png` | `c1-float` | 96 | 3.2 / 8.4 MB |
| 9 | `beach` | Kling 4.0 | from the last frame of the previous shot's take to the author's scene `e07-beach-cove-sunset-palm-left.png` | `c2-beach` | 121 | 1.9 / 4.6 MB |
| 10 | `inland` | Kling 4.0 | from the last frame of the previous shot's take to the author's scene `e09-arenal-volcano-lake-sunrise-left.png` | `r7-volcano` | 73 | 1.0 / 2.3 MB |
| 11 | `volcano` | Kling 4.0 | from the author's scene `e09-arenal-volcano-lake-sunrise-left.png` to the author's scene `e17-crater-lake.png` | `d1-volcano` | 121 | 1.4 / 3.2 MB |
| 12 | `crater` | Google Veo 3.1 (fast, high) | from the author's scene `e17-crater-lake.png` | `d2-crater` | 96 | 1.5 / 4.1 MB |
| 13 | `theatre` | Google Veo 3.1 (fast, high) | from photograph [Teatro Nacional CRI 07 2019 8963.jpg](https://commons.wikimedia.org/wiki/File:Teatro_Nacional_CRI_07_2019_8963.jpg) by Mariordo (Mario Roberto Durán Ortiz) (CC BY-SA 4.0) | `e1-theatre` | 96 | 1.3 / 3.7 MB |
| 14 | `doors` | Kling 4.0 | from the last frame of the previous shot's take to photograph [Costa Rica - San José 20.jpg](https://commons.wikimedia.org/wiki/File:Costa_Rica_-_San_Jos%C3%A9_20.jpg) by Wayne77 (CC BY-SA 4.0) | `r8-doors` | 61 | 0.6 / 1.5 MB |
| 15 | `foyer` | Google Veo 3.1 (fast, high) | from photograph [Costa Rica - San José 20.jpg](https://commons.wikimedia.org/wiki/File:Costa_Rica_-_San_Jos%C3%A9_20.jpg) by Wayne77 (CC BY-SA 4.0) | `e2-foyer` | 96 | 1.5 / 4.1 MB |
| 16 | `ruins` | Google Veo 3.1 (fast, high) | from photograph [Old Ruins in Cartago, Costa Rica by Daniel Vargas - 25.jpg](https://commons.wikimedia.org/wiki/File:Old_Ruins_in_Cartago,_Costa_Rica_by_Daniel_Vargas_-_25.jpg) by Daniel32708 - Daniel Vargas (CC BY-SA 3.0) | `e3-ruins` | 90 | 2.0 / 6.0 MB |
| 17 | `museum` | Google Veo 3.1 (fast, high) | from photograph [Diquis Stone Spheres Museo Nacional CRI 01 2020 1880.jpg](https://commons.wikimedia.org/wiki/File:Diquis_Stone_Spheres_Museo_Nacional_CRI_01_2020_1880.jpg) by Mariordo (Mario Roberto Durán Ortiz) (CC BY-SA 4.0) | `e4-museum` | 84 | 1.4 / 4.2 MB |
| 18 | `house` | Google Veo 3.1 (fast, high) | from photograph [Úsure.jpg](https://commons.wikimedia.org/wiki/File:%C3%9Asure.jpg) by Darell31 (CC BY-SA 4.0) | `f1-usure` | 78 | 1.8 / 5.2 MB |
| 19 | `mask` | Google Veo 3.1 (fast, high) | from photograph [Keeper of the Wind.jpg](https://commons.wikimedia.org/wiki/File:Keeper_of_the_Wind.jpg) by THE ROVERS QUEST (CC BY-SA 4.0) | `f2-mask` | 96 | 2.0 / 5.0 MB |
| 20 | `up` | Kling 4.0 | from the last frame of the previous shot's take | `r9-up` | 121 | 1.9 / 4.4 MB |

Takes are kept in `tools/cache/film/takes/` (not in the repository) with their job records; the photographs' start
frames in `tools/cache/film/stills/`.

**Only the first frame of a photograph shot is the real place.** The model invents everything after it: the auditorium
behind the foyer curtain, the far wall of the ruins' garden, the people who walk through the theatre's square are not a
record of those places. The page says so under those captions.

**The places named in the captions of generated shots are not the places in the picture.** "Río Celeste", "Monteverde",
"Tortuguero", "Manuel Antonio", "Arenal" and "Irazú" name what the caption's facts are about; the pictures are imagined
scenes (the volcanoes above the clouds, for one, look more like bare cinder cones than Costa Rica's forested ones).

## The prompts

**2. `sky`** (Kling 4.0, 10 s)

> Cinematic aerial chase shot, one continuous take with no cuts. The camera flies just behind and slightly above a scarlet macaw in flight, its red, yellow and blue wings beating, high above a sea of clouds at sunrise over Costa Rica. Volcano peaks rise through the clouds in warm golden light with long shadows. The macaw banks and dives through a gap in the clouds; the camera follows it down through the mist until the rainforest canopy of a deep green valley appears below. Photorealistic nature documentary, IMAX quality, smooth stabilised forward motion, natural colours, no text, no logos.

**3. `falls`** (Kling 4.0, 10 s)

> Continuous aerial chase shot. The scarlet macaw glides down over the rainforest canopy, the camera close behind it. Ahead, a single tall waterfall pours from a forested cliff into one round sky-blue turquoise pool. There is only this one waterfall in the whole shot, a single drop, no second cascade below it. The macaw banks away to the right and leaves the frame; the camera keeps flying forward and down past the falling water, through its mist, and levels out low over the turquoise pool. Photorealistic nature documentary, warm golden morning light, natural colours, smooth stabilised camera, one continuous take with no cuts, no text.

**4. `river`** (Kling 4.0, 8 s)

> Continuous FPV drone shot. The camera turns away from the waterfall and flies low and fast across the turquoise pool, then follows the river downstream as it leaves the pool and runs through a deep rainforest gorge with mossy boulders and small rapids. No other waterfall appears anywhere: the waterfall stays behind the camera. The camera rises from the water up the side of the gorge toward a wooden zip-line platform built around a tall tree at the top, where a steel cable stretches across the gorge high above the river. It ends close to the platform. Photorealistic nature documentary, warm golden morning light, natural colours, smooth stabilised camera, one continuous take with no cuts, no text.

**5. `zip`** (Kling 4.0, 8 s)

> Continuous shot. The camera glides onto the wooden platform and becomes the first-person view of a zip-line rider: two gloved hands come up into the frame and grip the trolley handles clipped to the steel cable. The rider pushes off the platform and glides fast along the cable across the gorge, high above the river and the rainforest canopy, tree crowns rushing past below, the far platform growing ahead. No waterfall anywhere in view. Wide-angle action camera look. Photorealistic, warm golden morning light, natural colours, smooth motion, one continuous take with no cuts, no text.

**6. `drop`** (Kling 4.0, 6 s)

> Continuous shot. The gloved hands and the cable slide out of the top of the frame as the camera leaves the zip line and swoops down like a bird toward the same river below, descending into the gorge. On the river, a single inflatable raft with six people in helmets and life jackets paddles through white-water rapids between the rocky banks. The camera dives down and comes in low behind the raft, just above the water. No waterfall anywhere. Photorealistic, warm golden morning light, natural colours, smooth stabilised motion, one continuous take with no cuts, no text.

**7. `raft`** (Kling 4.0, 10 s)

> Continuous action-camera shot following the same inflatable raft down the river. The camera closes in behind the raft as the six people in helmets and life jackets paddle together through the white-water rapids, spray flying. The rapids end, the river slows, widens and turns calm and glassy, and the gorge opens into a quiet jungle channel lined with mangrove roots in golden morning mist. The raft glides out of frame to one side and the camera drifts forward along the still channel. No waterfall anywhere. Photorealistic, warm golden morning light, natural colours, smooth stabilised motion, one continuous take with no cuts, no text.

**8. `float`** (Google Veo 3.1 (fast, high), 8 s)

> Slow, smooth forward glide low over the calm water of this jungle canal, as if from the bow of a small quiet boat. The channel curves gently ahead under overhanging trees and mangrove roots; a great blue heron takes off from the bank, a sloth hangs from a branch overhead; ripples spread across the reflections; shafts of morning sun through mist. Photorealistic nature documentary footage, IMAX quality, warm golden morning light, natural colours, smooth stabilised motion, one continuous take with no cuts, no text, no logos.

**9. `beach`** (Kling 4.0, 10 s)

> Continuous shot from the bow of a small boat. The mangrove channel widens and opens to the sea; the boat glides out of the trees at the river mouth, the camera lifts off the water and flies along a wide Pacific beach with palms, rocky islets and turquoise surf under a golden sun low over the ocean. Photorealistic nature documentary footage, warm golden light, natural colours, smooth stabilised motion, one continuous take with no cuts, no text, no logos.

**10. `inland`** (Kling 4.0, 6 s)

> Continuous aerial drone flight. The camera lifts off the beach, turns inland and flies fast and low over rolling rainforest hills, until a large lake and the forested cone of a volcano appear ahead in the morning light. Photorealistic nature documentary, warm golden morning light, natural colours, smooth stabilised camera, one continuous take with no cuts, no text.

**11. `volcano`** (Kling 4.0, 10 s)

> Continuous aerial drone flight. The camera rises out of the rainforest foliage, flies across the misty lake toward the cone of the volcano, climbs fast up its forested and then bare rocky slope, and comes over the crater rim to reveal a turquoise crater lake with steam and clouds drifting inside the crater. Photorealistic nature documentary footage, warm golden light, natural colours, smooth stabilised motion, one continuous take with no cuts, no text, no logos.

**12. `crater`** (Google Veo 3.1 (fast, high), 8 s)

> Aerial drone shot: the camera flies forward over the crater rim and descends into the volcano crater toward the turquoise acid lake; steam and fumaroles drift across the bare grey walls, clouds spill over the rim. It ends close above the steaming water as white steam fills the whole frame. Photorealistic nature documentary footage, IMAX quality, warm golden morning light, natural colours, smooth stabilised motion, one continuous take with no cuts, no text, no logos.

**13. `theatre`** (Google Veo 3.1 (fast, high), 8 s)

> Steadicam walking shot at eye level: the camera glides forward across the plaza toward the entrance of this neoclassical theatre, pigeons take off from the paving, the flag moves in the breeze. It keeps moving straight toward the doors under the columns. Photorealistic travel documentary, soft morning light, natural colours, smooth motion, one continuous take, no text.

**14. `doors`** (Kling 4.0, 5 s)

> Steadicam walking shot at eye level: the camera passes between the stone columns, through the open wooden doors of the theatre, and glides into its ornate foyer of gilded arches, marble columns, velvet curtains and a white marble statue. Smooth motion, natural colours, one continuous take, no text.

**15. `foyer`** (Google Veo 3.1 (fast, high), 8 s)

> Slow steadicam glide forward through this ornate theatre foyer: gilded arches, marble columns, velvet curtains, chandeliers glowing warmly; the camera moves past the white marble statue toward the curtained doorway ahead, light glinting on the gold leaf. Photorealistic documentary, natural colours, smooth motion, one continuous take, no people in the foreground, no text.

**16. `ruins`** (Google Veo 3.1 (fast, high), 8 s)

> Slow steadicam glide forward at eye level toward and through the tall stone arch of these roofless church ruins, into the garden inside the walls: sunlight on old grey stone, moss and small ferns in the joints, red flowers, a hummingbird hovering. Photorealistic travel documentary, natural colours, smooth motion, one continuous take, no text.

**17. `museum`** (Google Veo 3.1 (fast, high), 8 s)

> Slow museum dolly shot: the camera glides forward past these ancient pre-Columbian stone spheres in a quiet gallery, soft spotlights sweeping over the rough granite surface, and pushes in toward the largest sphere until its carved stone surface fills the frame. Photorealistic documentary, natural colours, smooth motion, one continuous take, no people, no text.

**18. `house`** (Google Veo 3.1 (fast, high), 8 s)

> Slow steadicam glide forward across the grass toward this traditional conical thatched house in a rainforest clearing. Smoke from the cooking fire seeps through the palm thatch and drifts into the trees, sunlight flickers through the leaves, cacao pods dry on a wooden rack beside the entrance, a hen crosses the grass. The camera moves gently toward the shaded doorway. Photorealistic documentary, natural colours, smooth motion, one continuous take, no text.

**19. `mask`** (Google Veo 3.1 (fast, high), 8 s)

> Gentle documentary shot: the dancer wearing this carved wooden mask turns the head slowly, the woven purple cloth and burlap moving in the breeze, leaves rustling behind. Then the camera tilts slowly upward, past the branches, until it looks up into the green leaves and the bright blue sky. Photorealistic, natural colours, smooth motion, one continuous take, no text.

**20. `up`** (Kling 4.0, 10 s)

> Continuous shot looking up through the branches and leaves into a bright blue sky. A scarlet macaw flies in through the branches, red, yellow and blue wings beating, and climbs upward; the camera tilts up and follows it as it rises above the canopy into the open sky. The camera settles looking straight up at the blue sky, framed on every side by dark green jungle leaves and palm fronds that sway gently in the wind, the macaw a small shape crossing the sky. Photorealistic nature documentary, warm golden morning light, natural colours, smooth stabilised camera, one continuous take with no cuts, no text.


## Remaking a shot

```bash
npm i -g @higgsfield/cli && higgsfield auth login          # once
python3 -I tools/film_gen.py <take-name> <model> --prompt "…" [--start-image …] [--end-image …] …   # a new take
# name the take in tools/film_shots.json, then
python3 tools/film_build.py <shot-id>                        # cuts the clips and the still, updates the manifest
npm test                                                     # the clips must match the manifest
node tools/film_shots.mjs && node tools/film_scrub.mjs       # screenshots of every shot; smoothness of a scrub
```

`node tools/film_map.mjs` films the opening again from the 3D map (it needs the dev server), and
`python3 tools/film_photos.py` fetches the photographs and records their authors and licences.

Costs on 13 November 2026: Kling 4.0 at 1080p — 3.25 credits a second (32.5 for 10 s); Veo 3.1 fast at "high", 8 s — 32 credits;
Seedance 2.5 at 1080p, 10 s — 160 credits (not used: the film would have cost about 2,700). The first cut used 611
credits, 64 of them on two alternative openings that were not used. The reshoot of the same day (one waterfall, the
chain from the falls to the canal, three travelling shots, a new ending) used 256.9 more, 52 of them on two zip-line
takes that were paid for but lost when the CLI's connection dropped before their job ids were saved (Kling jobs do not
appear in `higgsfield generate list`, so they could not be found again). `tools/film_gen.py` now saves the job id the
moment a job is submitted, and `--resume <job-id>` fetches a take whose download failed. 37.7 credits remained.

## Checked, and not checked

- Headless Chrome on an Apple M2, 1440×900: scrubbing the whole film down, half of it back up, and down again holds
  16.7 ms a frame (95th percentile), and the exact frame asked for was decoded and on screen 99.8–100 % of the time.
- Every cut was checked as a pair of frames (the last frame of a shot beside the first of the next,
  `tools/scratch/cut_sheet.py`): the joins match; the four cuts between the culture scenes are dissolves.
- Every shot, the phone layout (390×844), reduced motion, the text tier, Spanish and Chinese, the play button, the
  chapter rail, the notes and the production build were exercised with no console errors.
- **Not checked:** Safari and Firefox (both have WebCodecs; neither was run), a real phone, touch scrolling, and a slow
  connection. If decoding fails in a browser the film falls back to stills, but that path was only exercised by
  forcing it.
