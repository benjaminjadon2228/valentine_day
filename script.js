const lockScreen = document.getElementById("lock-screen");
const unlockInput = document.getElementById("unlock-input");
const unlockBtn = document.getElementById("unlock-btn");
const unlockError = document.getElementById("unlock-error");

const noBtn = document.getElementById("no-btn");
const yesBtn = document.getElementById("yes-btn");
const buttonArea = document.getElementById("buttons-wrap");
const questionCard = document.getElementById("question-card");
const celebrationCard = document.getElementById("celebration-card");
const heartSplash = document.getElementById("heart-splash");
const pageLoader = document.getElementById("page-loader");
const floatingHearts = document.getElementById("floating-hearts");
const flowerBursts = document.getElementById("flower-bursts");
const autoBgMusic = document.getElementById("auto-bg-music");

const spotifyUrlInput = document.getElementById("spotify-url");
const setSpotifyBtn = document.getElementById("set-spotify");
const spotifyPlayer = document.getElementById("spotify-player");
const songName = document.getElementById("song-name");
const melodyToggleBtn = document.getElementById("melody-toggle");
const melodyStatus = document.getElementById("melody-status");

const themeSelect = document.getElementById("theme-select");
const lockCodeInput = document.getElementById("lock-code");

const toNameInput = document.getElementById("to-name");
const fromNameInput = document.getElementById("from-name");
const messageInput = document.getElementById("message-input");
const applyMessageBtn = document.getElementById("apply-message");
const sketchTitle = document.getElementById("sketch-title");
const sketchMessage = document.getElementById("sketch-message");
const sketchSign = document.getElementById("sketch-sign");

const memoryUpload = document.getElementById("memory-upload");
const memoryGallery = document.getElementById("memory-gallery");
const memoryCount = document.getElementById("memory-count");

const makeLinkBtn = document.getElementById("make-link");
const copyLinkBtn = document.getElementById("copy-link");
const copyNoteBtn = document.getElementById("copy-note");
const sendMailBtn = document.getElementById("send-mail");
const sendWhatsappBtn = document.getElementById("send-whatsapp");
const downloadCardBtn = document.getElementById("download-card");
const shareOutput = document.getElementById("share-output");
const shareStatus = document.getElementById("share-status");
const imageModal = document.getElementById("image-modal");
const imageModalContent = document.getElementById("image-modal-content");
const closeImageModalBtn = document.getElementById("close-image-modal");

const countdownDays = document.querySelectorAll(".cd-days");
const countdownHours = document.querySelectorAll(".cd-hours");
const countdownMinutes = document.querySelectorAll(".cd-minutes");
const countdownSeconds = document.querySelectorAll(".cd-seconds");

const noTexts = [
  "No 😢",
  "Are you sure?",
  "Please?",
  "Say yes?",
  "Think again 😭",
  "Pretty please 💔",
  "Last chance?",
  "Okay... yes?"
];

let noTextIndex = 0;
let yesScale = 1;
let spotifyTrackId = "";
let spotifyTrackUrl = "";
let memoryDataUrls = [];
let memoryShareDataUrls = [];
let expectedUnlockCode = "";
let currentTheme = "cute";
let melodyEnabled = false;
let melodyContext = null;
let melodyMaster = null;
let melodyInterval = null;
let celebrationStarted = false;
let bgPausedByFavorite = false;
let spotifyController = null;
let spotifyIframeApiLoaded = false;
let spotifyApiReady = false;
let spotifyIFrameAPIRef = null;

function pauseBgForFavorite() {
  if (!autoBgMusic.paused) {
    autoBgMusic.pause();
    bgPausedByFavorite = true;
  }
}

function resumeBgAfterFavorite() {
  if (bgPausedByFavorite && celebrationStarted) {
    autoBgMusic.play().catch(() => {});
    bgPausedByFavorite = false;
  }
}

function loadSpotifyIframeApi() {
  if (spotifyIframeApiLoaded) {
    return;
  }
  spotifyIframeApiLoaded = true;
  const script = document.createElement("script");
  script.src = "https://open.spotify.com/embed/iframe-api/v1";
  script.async = true;
  document.body.appendChild(script);
}

window.onSpotifyIframeApiReady = (IFrameAPI) => {
  spotifyApiReady = true;
  spotifyIFrameAPIRef = IFrameAPI;
  if (!spotifyTrackId) {
    return;
  }
  createOrUpdateSpotifyController(IFrameAPI, spotifyTrackId);
};

function createOrUpdateSpotifyController(IFrameAPI, trackId) {
  const uri = `spotify:track:${trackId}`;
  if (spotifyController && typeof spotifyController.loadUri === "function") {
    spotifyController.loadUri(uri);
    return;
  }

  IFrameAPI.createController(
    spotifyPlayer,
    {
      uri,
      width: "100%",
      height: 152
    },
    (controller) => {
      spotifyController = controller;
      if (typeof controller.addListener === "function") {
        controller.addListener("playback_update", (event) => {
          const isPaused = event?.data?.isPaused;
          if (isPaused === false) {
            pauseBgForFavorite();
          } else if (isPaused === true) {
            resumeBgAfterFavorite();
          }
        });
      }
    }
  );
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function openImageModal(src) {
  if (!src) {
    return;
  }

  imageModalContent.src = src;
  imageModal.classList.remove("hidden");
}

function closeImageModal() {
  imageModal.classList.add("hidden");
  imageModalContent.removeAttribute("src");
}

function updateMemoryCount() {
  memoryCount.textContent = `${memoryDataUrls.length}/18 memories selected`;
}

function createMelodyTone(freq, startAt, duration) {
  if (!melodyContext || !melodyMaster) {
    return;
  }

  const osc = melodyContext.createOscillator();
  const gain = melodyContext.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(0.02, startAt + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(gain);
  gain.connect(melodyMaster);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

function startMelodyLoop() {
  if (!melodyEnabled) {
    return;
  }

  if (!melodyContext) {
    melodyContext = new (window.AudioContext || window.webkitAudioContext)();
    melodyMaster = melodyContext.createGain();
    melodyMaster.gain.value = 0.34;
    melodyMaster.connect(melodyContext.destination);
  }

  if (melodyContext.state === "suspended") {
    melodyContext.resume().catch(() => {});
  }

  const pattern = [392, 440, 523.25, 659.25, 523.25, 440, 392, 349.23];
  const baseTime = melodyContext.currentTime + 0.05;

  pattern.forEach((note, i) => {
    createMelodyTone(note, baseTime + i * 0.36, 0.28);
  });

  if (!melodyInterval) {
    melodyInterval = setInterval(() => {
      if (!melodyEnabled || !melodyContext) {
        return;
      }
      const nextBase = melodyContext.currentTime + 0.05;
      pattern.forEach((note, i) => {
        createMelodyTone(note, nextBase + i * 0.36, 0.28);
      });
    }, 3000);
  }
}

function stopMelodyLoop() {
  if (melodyInterval) {
    clearInterval(melodyInterval);
    melodyInterval = null;
  }

  if (melodyMaster && melodyContext) {
    melodyMaster.gain.setTargetAtTime(0.0001, melodyContext.currentTime, 0.08);
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

function createTinyShareImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const maxSide = 88;
      const ratio = Math.min(1, maxSide / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * ratio));
      const height = Math.max(1, Math.round(img.height * ratio));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);
      const webpData = canvas.toDataURL("image/webp", 0.34);
      if (webpData && webpData.startsWith("data:image/webp")) {
        resolve(webpData);
        return;
      }
      resolve(canvas.toDataURL("image/jpeg", 0.38));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to process image"));
    };

    img.src = objectUrl;
  });
}

function encodePayload(payload) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodePayload(raw) {
  const normalized = raw.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);
  return JSON.parse(decodeURIComponent(escape(atob(padded))));
}

function extractSpotifyTrackId(rawInput) {
  const value = rawInput.trim();
  if (!value) {
    return "";
  }

  const uriMatch = value.match(/^spotify:track:([a-zA-Z0-9]+)$/);
  if (uriMatch) {
    return uriMatch[1];
  }

  try {
    const parsedUrl = new URL(value);
    if (!parsedUrl.hostname.includes("spotify.com")) {
      return "";
    }

    const parts = parsedUrl.pathname.split("/").filter(Boolean);
    const trackIndex = parts.indexOf("track");
    if (trackIndex === -1 || !parts[trackIndex + 1]) {
      return "";
    }

    return parts[trackIndex + 1];
  } catch {
    return "";
  }
}

function setSpotifyTrack(rawInput, showFeedback = true) {
  const trackId = extractSpotifyTrackId(rawInput);
  if (!trackId) {
    if (showFeedback) {
      songName.textContent = "Invalid Spotify track link";
    }
    spotifyTrackId = "";
    spotifyTrackUrl = "";
    spotifyPlayer.classList.add("hidden");
    spotifyPlayer.innerHTML = "";
    return false;
  }

  spotifyTrackId = trackId;
  spotifyTrackUrl = `https://open.spotify.com/track/${trackId}`;
  spotifyPlayer.classList.remove("hidden");
  loadSpotifyIframeApi();
  if (spotifyApiReady && spotifyIFrameAPIRef) {
    createOrUpdateSpotifyController(spotifyIFrameAPIRef, trackId);
  } else {
    spotifyPlayer.innerHTML = `<iframe title="Spotify Player" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator" style="width:100%;height:152px;border:0;border-radius:12px"></iframe>`;
  }
  songName.textContent = "Spotify track connected";
  return true;
}

function encodeStateForShare() {
  const corePayload = {
    to: toNameInput.value.trim(),
    from: fromNameInput.value.trim(),
    msg: messageInput.value.trim(),
    lock: lockCodeInput.value.trim(),
    theme: currentTheme,
    spotify: spotifyTrackUrl
  };

  const maxEncodedLength = 6500;
  let selectedMemories = [];
  const coreEncoded = encodePayload(corePayload);
  let memoriesEncoded = encodePayload({ memories: [] });

  for (const tinyImage of memoryShareDataUrls) {
    const nextMemories = [...selectedMemories, tinyImage];
    const candidateEncoded = encodePayload({ memories: nextMemories });

    if (candidateEncoded.length > maxEncodedLength) {
      break;
    }

    selectedMemories = nextMemories;
    memoriesEncoded = candidateEncoded;
  }

  return {
    coreEncoded,
    memoriesEncoded,
    includedMemories: selectedMemories.length,
    totalMemories: memoryShareDataUrls.length
  };
}

function decodeStateFromShare(raw) {
  try {
    return decodePayload(raw);
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  const normalized =
    theme === "elegant"
      ? "rose-garden"
      : theme === "scrapbook"
        ? "moonlight-love"
        : theme;
  const allowed = ["cute", "rose-garden", "moonlight-love"];
  currentTheme = allowed.includes(normalized) ? normalized : "cute";
  document.body.classList.remove(
    "theme-cute",
    "theme-rose-garden",
    "theme-moonlight-love"
  );
  document.body.classList.add(`theme-${currentTheme}`);
  themeSelect.value = currentTheme;
}

function getCountdownValues() {
  const now = new Date();
  const year = now.getFullYear();
  let target = new Date(year, 1, 14, 0, 0, 0);
  if (target <= now) {
    target = new Date(year + 1, 1, 14, 0, 0, 0);
  }

  const diff = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
}

function renderCountdown() {
  const values = getCountdownValues();
  countdownDays.forEach((el) => {
    el.textContent = values.days;
  });
  countdownHours.forEach((el) => {
    el.textContent = values.hours;
  });
  countdownMinutes.forEach((el) => {
    el.textContent = values.minutes;
  });
  countdownSeconds.forEach((el) => {
    el.textContent = values.seconds;
  });
}

function applyMessage() {
  const toName = toNameInput.value.trim() || "My Valentine";
  const fromName = fromNameInput.value.trim() || "Your Secret Admirer";
  const customMessage = messageInput.value.trim();

  sketchTitle.textContent = `Love Note For ${toName}`;

  if (customMessage) {
    sketchMessage.innerHTML = `${customMessage.replace(/\n/g, "<br />")}`;
  } else {
    sketchMessage.innerHTML = "Dear Valentine,<br />Thank you for making life softer and sweeter.";
  }

  sketchSign.textContent = `With love, ${fromName} ❤️`;
}

function getShareText() {
  const toName = toNameInput.value.trim() || "Valentine";
  const fromName = fromNameInput.value.trim() || "Someone";
  const msg = messageInput.value.trim() || "You mean everything to me.";
  const photoCount = memoryGallery.children.length;
  const songLine = spotifyTrackUrl ? `\nSpotify song: ${spotifyTrackUrl}` : "";

  return `To ${toName},\n${msg}\n\nLove, ${fromName}\nMemories attached in app: ${photoCount}${songLine}`;
}

function buildCurrentPayload() {
  return {
    to: toNameInput.value.trim(),
    from: fromNameInput.value.trim(),
    msg: messageInput.value.trim(),
    lock: lockCodeInput.value.trim(),
    theme: currentTheme,
    spotify: spotifyTrackUrl,
    memories: [...memoryDataUrls]
  };
}

async function getShareUrl() {
  const url = new URL(window.location.href);
  const payload = buildCurrentPayload();

  try {
    const response = await fetch("/api/share", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error("share api failed");
    }
    const data = await response.json();
    if (!data?.id) {
      throw new Error("missing share id");
    }

    url.search = "";
    url.hash = "";
    url.searchParams.set("sid", data.id);
    return {
      url: url.toString(),
      includedMemories: memoryDataUrls.length,
      totalMemories: memoryDataUrls.length,
      mode: "server"
    };
  } catch {
    const shareState = encodeStateForShare();
    url.search = "";
    url.searchParams.set("lc", shareState.coreEncoded);
    url.searchParams.set("lm", shareState.memoriesEncoded);
    url.hash = `lc=${shareState.coreEncoded}`;
    return {
      url: url.toString(),
      includedMemories: shareState.includedMemories,
      totalMemories: shareState.totalMemories,
      mode: "fallback"
    };
  }
}

async function createShareLink() {
  const share = await getShareUrl();
  shareOutput.value = share.url;
  const sourceText =
    share.mode === "server" ? "cloud link" : "local fallback link";
  shareStatus.textContent = `Share link ready (${sourceText}, memories ${share.includedMemories}/${share.totalMemories}).`;
}

async function copyLink() {
  if (!shareOutput.value.trim()) {
    await createShareLink();
  }

  try {
    await navigator.clipboard.writeText(shareOutput.value.trim());
    shareStatus.textContent = "Share link copied to clipboard.";
  } catch {
    shareStatus.textContent = "Clipboard blocked. Copy link from the box manually.";
  }
}

async function copyMessage() {
  const note = getShareText();
  try {
    await navigator.clipboard.writeText(note);
    shareStatus.textContent = "Message copied to clipboard.";
  } catch {
    shareStatus.textContent = "Clipboard blocked. Copy from this message field manually.";
  }
}

async function sendEmail() {
  const share = await getShareUrl();
  shareOutput.value = share.url;
  const subject = encodeURIComponent("A Valentine Message For You 💖");
  const body = encodeURIComponent(`${getShareText()}\n\nOpen your valentine page: ${share.url}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
  shareStatus.textContent = "Email app opened with your custom share link.";
}

async function sendWhatsapp() {
  const share = await getShareUrl();
  shareOutput.value = share.url;
  const shareText = `${getShareText()}\n\nOpen your valentine page: ${share.url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener");
  shareStatus.textContent = "WhatsApp share opened.";
}

function createStandaloneCardHtml() {
  const toName = (toNameInput.value.trim() || "My Valentine").replace(/</g, "&lt;");
  const fromName = (fromNameInput.value.trim() || "Your Secret Admirer").replace(/</g, "&lt;");
  const message = (messageInput.value.trim() || "You make my world better every day.")
    .replace(/</g, "&lt;")
    .replace(/\n/g, "<br />");
  const galleryHtml =
    memoryDataUrls.length > 0
      ? memoryDataUrls.map((src) => `<div class=\"mem\"><img src=\"${src}\" alt=\"Memory\" /></div>`).join("")
      : "<p class=\"none\">No memories were added.</p>";

  const audioHtml = spotifyTrackId
    ? `<iframe title=\"Spotify Player\" style=\"width:100%;height:152px;border:0;border-radius:12px\" src=\"https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator\" loading=\"lazy\" allow=\"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture\"></iframe>`
    : "<p class=\"none\">No Spotify song attached.</p>";

  return `<!doctype html>
<html lang=\"en\"><head><meta charset=\"UTF-8\" /><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
<title>Love Card</title><style>
body{margin:0;font-family:Arial,sans-serif;background:linear-gradient(160deg,#ffe9f3,#ffc5dc);color:#5b2940}
.wrap{max-width:840px;margin:28px auto;padding:20px}
.card{background:rgba(255,255,255,.86);border-radius:18px;border:1px solid #ffd5e7;padding:20px;box-shadow:0 20px 34px -22px rgba(91,41,64,.45)}
h1{margin:0 0 10px;color:#9f3a66}.paper{margin-top:14px;padding:18px;border-radius:10px;border:2px solid #9a7756;background:linear-gradient(145deg,#d4b28d,#c3a07d);color:#5f3c28}
.msg{line-height:1.7;font-size:1.1rem}.sign{text-align:right;font-weight:bold}.gallery{margin-top:14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
.mem{border-radius:8px;overflow:hidden;border:1px solid #efb9d0;background:#fff3f9;aspect-ratio:1}.mem img{width:100%;height:100%;object-fit:cover;display:block}.none{margin:0;color:#7c4960}
.audio{margin-top:14px}
</style></head><body><div class=\"wrap\"><div class=\"card\"><h1>Love Note For ${toName} 💞</h1><div class=\"paper\"><p class=\"msg\">${message}</p><p class=\"sign\">With love, ${fromName} ❤️</p></div><div class=\"audio\">${audioHtml}</div><div class=\"gallery\">${galleryHtml}</div></div></div></body></html>`;
}

function downloadLoveCard() {
  const html = createStandaloneCardHtml();
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "valentine-love-card.html";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  shareStatus.textContent = "Downloaded card file. Send this file to another user.";
}

async function renderMemories(files) {
  const slotsLeft = Math.max(0, 18 - memoryDataUrls.length);
  const selectedFiles = Array.from(files).slice(0, slotsLeft);
  if (!selectedFiles.length) {
    shareStatus.textContent = "Memory limit reached (18 images max).";
    return;
  }

  for (const file of selectedFiles) {
    const dataUrl = await readFileAsDataUrl(file);
    memoryDataUrls.push(dataUrl);
    try {
      const tinyShareData = await createTinyShareImage(file);
      memoryShareDataUrls.push(tinyShareData);
    } catch {
      memoryShareDataUrls.push(dataUrl);
    }

    const item = document.createElement("div");
    item.className = "memory-item";

    const image = document.createElement("img");
    image.alt = "Memory image";
    image.src = dataUrl;

    item.appendChild(image);
    memoryGallery.appendChild(item);
  }

  updateMemoryCount();
}

function renderMemoryGalleryFromDataUrls(dataUrls) {
  memoryGallery.innerHTML = "";
  dataUrls.forEach((src) => {
    const item = document.createElement("div");
    item.className = "memory-item";

    const image = document.createElement("img");
    image.alt = "Memory image";
    image.src = src;

    item.appendChild(image);
    memoryGallery.appendChild(item);
  });
  updateMemoryCount();
}

function moveNoButton() {
  const areaRect = buttonArea.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const maxX = areaRect.width - btnRect.width;
  const maxY = areaRect.height - btnRect.height;

  const left = randomRange(0, Math.max(0, maxX));
  const top = randomRange(0, Math.max(0, maxY));

  noBtn.style.left = `${left}px`;
  noBtn.style.top = `${top}px`;
  noBtn.style.transform = "translate(0, 0)";

  noTextIndex = (noTextIndex + 1) % noTexts.length;
  noBtn.textContent = noTexts[noTextIndex];

  yesScale = Math.min(1.9, yesScale + 0.08);
  yesBtn.style.transform = `translate(-50%, -50%) scale(${yesScale})`;
}

function pointerNearNoButton(e) {
  if (questionCard.classList.contains("hidden")) {
    return;
  }

  const rect = noBtn.getBoundingClientRect();
  const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
  const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
  const distance = Math.hypot(dx, dy);

  if (distance < 90) {
    moveNoButton();
  }
}

function createFloatingHeart() {
  const heart = document.createElement("span");
  heart.className = "heart";
  heart.textContent = Math.random() > 0.2 ? "❤" : "💖";
  heart.style.left = `${randomRange(0, 100)}vw`;
  heart.style.bottom = "-20px";
  heart.style.fontSize = `${randomRange(14, 36)}px`;
  heart.style.animationDuration = `${randomRange(2.8, 5.2)}s`;
  floatingHearts.appendChild(heart);

  setTimeout(() => heart.remove(), 5500);
}

function createFlowerBurst(x, y) {
  const flower = document.createElement("span");
  flower.className = "flower";
  flower.style.left = `${x}px`;
  flower.style.top = `${y}px`;
  flowerBursts.appendChild(flower);

  setTimeout(() => flower.remove(), 1200);
}

function runHeartSplash() {
  heartSplash.classList.remove("hidden");
  heartSplash.innerHTML = '<div class="splash-heart">💘</div>';

  setTimeout(() => {
    heartSplash.classList.add("hidden");
    heartSplash.innerHTML = "";
  }, 760);
}

function runLoaderTransition() {
  pageLoader.classList.remove("splash");
  pageLoader.classList.remove("hidden");
  setTimeout(() => {
    pageLoader.classList.add("splash");
  }, 1400);
  setTimeout(() => {
    pageLoader.classList.remove("splash");
    pageLoader.classList.add("hidden");
  }, 2000);
}

function startCelebration() {
  stopMelodyLoop();
  autoBgMusic.loop = true;
  autoBgMusic.volume = 0.45;
  autoBgMusic.currentTime = 0;
  autoBgMusic.play().catch(() => {});
  celebrationStarted = true;

  if (melodyEnabled) {
    melodyEnabled = false;
    melodyToggleBtn.textContent = "Melody Off";
    melodyStatus.textContent = "Melody muted";
  }
  runLoaderTransition();

  setTimeout(() => {
    questionCard.classList.add("hidden");
    celebrationCard.classList.remove("hidden");
    runHeartSplash();

    const stream = setInterval(createFloatingHeart, 95);
    setTimeout(() => clearInterval(stream), 14000);

    for (let i = 0; i < 40; i += 1) {
      setTimeout(() => {
        createFlowerBurst(randomRange(0, window.innerWidth), randomRange(0, window.innerHeight));
      }, i * 70);
    }

  }, 2000);
}

function lockPageUntilUnlock() {
  questionCard.classList.add("hidden");
  celebrationCard.classList.add("hidden");
  lockScreen.classList.remove("hidden");
  unlockError.textContent = "";
}

function unlockPage() {
  if (!expectedUnlockCode) {
    return;
  }

  if (unlockInput.value === expectedUnlockCode) {
    lockScreen.classList.add("hidden");
    questionCard.classList.remove("hidden");
    unlockError.textContent = "";
  } else {
    unlockError.textContent = "Wrong code. Try again.";
  }
}

function applyHydratedPayload(parsedCore, parsedMemories) {
  if (parsedCore?.to) {
    toNameInput.value = parsedCore.to;
  }

  if (parsedCore?.from) {
    fromNameInput.value = parsedCore.from;
  }

  if (parsedCore?.msg) {
    messageInput.value = parsedCore.msg;
  }

  if (parsedCore?.theme) {
    applyTheme(parsedCore.theme);
  }

  if (parsedCore?.spotify) {
    spotifyUrlInput.value = parsedCore.spotify;
    setSpotifyTrack(parsedCore.spotify, false);
  }

  if (Array.isArray(parsedMemories?.memories) && parsedMemories.memories.length > 0) {
    memoryShareDataUrls = parsedMemories.memories.slice(0, 18);
    memoryDataUrls = [...memoryShareDataUrls];
    renderMemoryGalleryFromDataUrls(memoryDataUrls);
  }

  if (parsedCore?.lock) {
    expectedUnlockCode = parsedCore.lock;
    lockCodeInput.value = parsedCore.lock;
    lockPageUntilUnlock();
  }

  applyMessage();
}

async function hydrateFromShareLink() {
  const url = new URL(window.location.href);
  const sid = url.searchParams.get("sid");
  if (sid) {
    try {
      const response = await fetch(`/api/share/${encodeURIComponent(sid)}`);
      if (response.ok) {
        const payload = await response.json();
        if (payload && typeof payload === "object") {
          applyHydratedPayload(payload, { memories: payload.memories || [] });
          return;
        }
      }
    } catch {
      // fallback to query/hash payload mode
    }
  }

  const hashCore = url.hash.match(/lc=([^&]+)/);
  const coreRaw = url.searchParams.get("lc") || (hashCore ? hashCore[1] : "");
  const memoriesRaw = url.searchParams.get("lm");

  if (!coreRaw && !memoriesRaw) {
    return;
  }

  const parsedCore = coreRaw ? decodeStateFromShare(coreRaw) : null;
  const parsedMemories = memoriesRaw ? decodeStateFromShare(memoriesRaw) : null;
  applyHydratedPayload(parsedCore, parsedMemories);
}

document.addEventListener("mousemove", pointerNearNoButton);
noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("click", moveNoButton);
yesBtn.addEventListener("click", startCelebration);
setSpotifyBtn.addEventListener("click", () => {
  setSpotifyTrack(spotifyUrlInput.value, true);
});
spotifyPlayer.addEventListener("pointerdown", () => {
  pauseBgForFavorite();
});
spotifyUrlInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    setSpotifyTrack(spotifyUrlInput.value, true);
  }
});
window.addEventListener("focus", () => {
  resumeBgAfterFavorite();
});

themeSelect.addEventListener("change", (event) => {
  applyTheme(event.target.value);
});

unlockBtn.addEventListener("click", unlockPage);
unlockInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    unlockPage();
  }
});

applyMessageBtn.addEventListener("click", applyMessage);
memoryUpload.addEventListener("change", async (event) => {
  const files = event.target.files;
  if (files?.length) {
    await renderMemories(files);
    memoryUpload.value = "";
  }
});

melodyToggleBtn.addEventListener("click", () => {
  melodyEnabled = !melodyEnabled;
  melodyToggleBtn.textContent = melodyEnabled ? "Melody On" : "Melody Off";
  melodyStatus.textContent = melodyEnabled
    ? "Soft romantic background melody"
    : "Melody muted";

  if (melodyEnabled) {
    startMelodyLoop();
  } else {
    stopMelodyLoop();
  }
});

memoryGallery.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLImageElement)) {
    return;
  }
  openImageModal(target.src);
});

closeImageModalBtn.addEventListener("click", closeImageModal);
imageModal.addEventListener("click", (event) => {
  if (event.target === imageModal) {
    closeImageModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !imageModal.classList.contains("hidden")) {
    closeImageModal();
  }
});

makeLinkBtn.addEventListener("click", createShareLink);
copyLinkBtn.addEventListener("click", copyLink);
copyNoteBtn.addEventListener("click", copyMessage);
sendMailBtn.addEventListener("click", sendEmail);
sendWhatsappBtn.addEventListener("click", sendWhatsapp);
downloadCardBtn.addEventListener("click", downloadLoveCard);

setInterval(() => {
  if (!lockScreen.classList.contains("hidden")) {
    return;
  }

  if (!questionCard.classList.contains("hidden") || !celebrationCard.classList.contains("hidden")) {
    createFloatingHeart();
  }
}, 380);

renderCountdown();
setInterval(renderCountdown, 1000);
applyTheme(currentTheme);
hydrateFromShareLink()
  .finally(() => {
    applyMessage();
    updateMemoryCount();
    shareStatus.textContent = "Create a share link after your edits.";
    melodyToggleBtn.textContent = "Melody Off";
    melodyStatus.textContent = "Melody muted";
  });
