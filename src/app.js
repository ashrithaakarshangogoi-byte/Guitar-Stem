const card = document.querySelector('#app-card');
const fileInput = document.querySelector('#file-input');
const samples = document.querySelector('#samples');
let currentFile = null;
let timer;

function icon(name) { return ({ upload: '↑', music: '♫', file: '♪', play: '▶', pause: 'Ⅱ', check: '✓', close: '×' })[name]; }
function showIdle() {
  card.innerHTML = `<div class="upload-card"><div class="upload-icon">${icon('upload')}</div><h3>Drag your track here</h3><p>or <button data-browse>browse files</button> from your computer</p><small>MP3, WAV, FLAC or M4A · Up to 200 MB</small></div>`;
  samples.hidden = false;
}
function showReady() {
  const size = currentFile.sample ? 'Fretline demo track' : `${(currentFile.size / 1e6).toFixed(1)} MB`;
  card.innerHTML = `<div class="upload-card"><div class="selected-file"><div class="file-art">${icon('file')}</div><div><strong>${escapeHtml(currentFile.name)}</strong><span>${size} · Ready to separate</span></div><button data-reset aria-label="Remove file">${icon('close')}</button></div><button class="primary process" data-start>Separate guitars <b>→</b></button><small>Usually ready in 2–4 minutes</small></div>`;
  samples.hidden = true;
}
function showProcessing() {
  card.innerHTML = `<div class="upload-card is-processing"><div class="processing-art">${icon('music')}</div><h3>Listening for guitar parts</h3><p>Mapping melody, tone, and arrangement…</p><div class="progress"><i></i></div><div class="progress-row"><span>4% complete</span><span>About 2 minutes left</span></div></div>`;
  let value = 4;
  timer = setInterval(() => { value = Math.min(value + Math.max(2, Math.round((100 - value) / 9)), 100); card.querySelector('.progress i').style.width = `${value}%`; card.querySelector('.progress-row span').textContent = `${value}% complete`; if (value === 100) { clearInterval(timer); setTimeout(showResults, 450); } }, 260);
}
function showResults() {
  card.innerHTML = `<div class="results"><div class="results-top"><div><div class="done"><b>✓</b> Separation complete</div><h3>${escapeHtml(currentFile.name)}</h3><p>Your guitar parts are ready to explore.</p></div><button class="ghost" data-reset>＋ New track</button></div><div class="stem-grid">${stem('Lead guitar','Melodies, solos & hooks','lavender', 1)}${stem('Rhythm guitar','Chords, riffs & textures','peach', 2)}</div><div class="demo-note">Demo mode: the interface and exports are fully functional; connect an audio-separation inference service to render source stems.</div></div>`;
}
function stem(name, desc, color, number) { return `<article class="stem ${color}"><div class="stem-label"><span>${number}</span>${name}</div><div class="stem-visual">${'<i></i>'.repeat(9)}</div><p>${desc}</p><div class="stem-actions"><button class="round" data-play="${name}" aria-label="Preview ${name}">${icon('play')}</button><button class="download" data-download="${name}">Download ↓</button></div></article>`; }
function escapeHtml(value) { const e = document.createElement('div'); e.textContent = value; return e.innerHTML; }
function chooseFile(file) { if (!file || (!file.type.startsWith('audio/') && !file.sample)) return; currentFile = file; showReady(); }
function download(name) { const content = `Fretline export: ${name}\nSource: ${currentFile.name}\n\nThis browser demo does not render audio. Connect an inference service to enable production stem exports.`; const url = URL.createObjectURL(new Blob([content], {type:'text/plain'})); const a = document.createElement('a'); a.href = url; a.download = `${name.toLowerCase().replace(' ','-')}-export.txt`; a.click(); URL.revokeObjectURL(url); }
document.addEventListener('click', e => { const browse = e.target.closest('[data-browse]'); if (browse) fileInput.click(); if (e.target.closest('[data-reset]')) { clearInterval(timer); currentFile = null; showIdle(); } if (e.target.closest('[data-start]')) showProcessing(); const play = e.target.closest('[data-play]'); if (play) play.textContent = play.textContent === icon('play') ? icon('pause') : icon('play'); const dl = e.target.closest('[data-download]'); if (dl) download(dl.dataset.download); const sample = e.target.closest('[data-sample]'); if (sample) chooseFile({ name: `${sample.dataset.sample.toLowerCase().replaceAll(' ','-')}.mp3`, sample: true }); });
fileInput.addEventListener('change', () => chooseFile(fileInput.files[0]));
card.addEventListener('dragover', e => e.preventDefault()); card.addEventListener('drop', e => { e.preventDefault(); chooseFile(e.dataTransfer.files[0]); });
showIdle();
