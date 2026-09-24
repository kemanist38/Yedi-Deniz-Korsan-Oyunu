# Tanıtım videosu (fragman)

Oyunun kendisi sahnelenerek 15 saniyelik 1280×720, 30 fps fragman üretilir. Video dosyası depoya konmaz.

1. `npm run dev` (5173) açıkken: `node record2.mjs` → oyun geliştirme kancasıyla (`window.__ky.manual/step`) kare kare adımlanır, `frames/*.jpg` ve `events.json` (atış/isabet zamanları) yazılır. Sahneler: başlık, ADMİN – KEMANİST düellosu, NPC avı, canavar, filo adası, "ÇOK YAKINDA" kartı (`overlay.js`).
2. `node audio.mjs` → prosedürel müzik + oyunun `public/assets/sfx` sesleri olay zamanlarına göre karıştırılır → `audio.wav`.
3. `ffrun.cjs` (ffmpeg.wasm: `npm i @ffmpeg/ffmpeg@0.11.6 @ffmpeg/core@0.11.0`) ile H.264 + AAC MP4:
   `node ffrun.cjs "<kareler>,audio.wav" yedi-deniz-fragman.mp4 -- -framerate 30 -i f%04d.jpg -i audio.wav -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 160k -shortest -movflags +faststart yedi-deniz-fragman.mp4`
