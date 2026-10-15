# The Dust Prophe Museum — GitHub Pages edition

Static HTML/JavaScript museum website with original SVG branding, Funnel Display (loaded from Google Fonts), nine genuine GLB point-cloud specimen views, ten archive records (02 is a non-triggered reference), and video stops at 00:10 → 01, 00:14 → 09, 00:17 → 03, 00:19 → 04, 00:24 → 05, 00:25 → 08, 00:29 → 06, 00:34 → 07, 00:37 → 10.

## Publish using github.com (no Python required for visitors)

1. Create a **Public** GitHub repository such as `dust-prophe-museum`.
2. In that repository choose **Add file → Upload files**. Upload the **contents** of this folder (not the ZIP, and not the folder itself). Keep `index.html`, `app.js`, `boot.js`, `specimens.json` at the repository root. Keep `assets/` and its subfolders intact. Some browsers do not preserve directory trees reliably via file picker; drag the `assets` directory into the web uploader, or use GitHub Desktop / git if the web interface refuses directories.
3. Commit the uploaded files to `main`.
4. Go to **Settings → Pages** and choose **Deploy from a branch**, branch `main`, folder `/(root)`. Save.
5. The public site should become available at `https://YOUR-USERNAME.github.io/dust-prophe-museum/` (replace both placeholders with actual values). Publication may take several minutes.

For GitHub Desktop: create/clone the repository, copy the unzipped contents into the local repo, commit, push, then enable Pages via Settings.

## Details / limitations

- This edition transcodes the original 1080p video to 720p H.264 to reduce file size; the source video is not included. All nine original GLB files are preserved.
- Every individual bundled file is below GitHub's browser upload threshold of 25 MiB at creation time.
- Internet is required for Three.js via jsDelivr and Funnel Display via Google Fonts.
- This is a static site: no backend, server installation, or Node build is needed for public visitors.
- The nine click targets are centred as in the previous prototype, pending artistic placement calibration.
- For private/local testing only, run `python -m http.server 8000` then visit http://localhost:8000. Double-clicking index.html uses file:// and may block resources.

## Audio in this edition

`assets/museum-ambient.mp3` is the user-provided background soundtrack. Click **ENTER THE MUSEUM** to start it (browser autoplay policies require user interaction). It loops independently of the tour video. Opening a specimen archive plays a soft synthesized scan cue and smoothly reduces the background music to 30% of its normal volume; closing restores volume over one second. The **SOUND ON/OFF** control mutes and restores playback. The video itself remains independently controlled. Ensure you hold the necessary rights to publicly distribute the soundtrack before publishing on GitHub Pages.
