// Helper function to set cookies with 6-month expiration
function setCookie(name, value) {
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    document.cookie = `${name}=${value}; expires=${sixMonths.toUTCString()}; path=/`;
}

let SKIN_COUNT = 5;

var cookies = document.cookie
    .split(';')
    .map(cookie => cookie.split('='))
    .reduce((accumulator, [key, value]) =>
    ({ ...accumulator, [key.trim()]: decodeURIComponent(value) }),
{});

const sillyNames = [
    "SailingSquid", "Captain Jellyfish", "TidalTurtle", "WaveMaster", "BuoyBouncer",
    "Marine", "MarinerMango", "Ocean Otter", "Banana Boat", "ShipShape",
    "AnchorApple", "CompassCake", "DolphinDancer", "FishFinder", "iplayseaofthieves",
    "nacho avg sailor"
];

function getRandomSillyName() {
    const adjIndex = Math.floor(Math.random() * sillyNames.length);
    return `${sillyNames[adjIndex]}`;
}

// Audio settings
if (!document.cookie.includes("musicVolume")) {
    setCookie("musicVolume", "0.5");
}
if (!document.cookie.includes("sfxVolume")) {
    setCookie("sfxVolume", "0.5");
}
if (!document.cookie.includes("playJoinSounds")) {
    setCookie("playJoinSounds", "1");
}
let musicVolume = cookies.musicVolume ? parseFloat(cookies.musicVolume) : 0.5;
let sfxVolume = cookies.sfxVolume ? parseFloat(cookies.sfxVolume) : 0.5;
let playJoinSounds = cookies.playJoinSounds !== "0";

// --- Updated Audio Handling Logic Starts ---
function playOneShot(url, volume) {
    if (!volume) return; // Don't play if volume is 0
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(error => console.error("Error playing one-shot audio:", error, {url, volume}));
}

let backgroundMusic;
let currentTrackNominalVolume = 0.5;
let currentMusicUrl = '';
let currentTrackModifier = 1.0; // Stores the modifierVolume of the current track
let activeAudioInstances = new Set();
let activeLoopTimeouts = []; // Stores IDs of pending setTimeout calls for loops

/**
 * Plays background music, ensuring it loops every 104 seconds
 * by starting a new overlapping audio instance using precise setTimeout.
 * @param {string} url - The URL of the audio file.
 * @param {number} modifierVolume - A volume modifier specific to this track.
 * @param {number} [globalVolume=musicVolume] - The base global music volume.
 */
function playBackgroundMusic(url, modifierVolume, globalVolume = musicVolume) {
    currentMusicUrl = url;
    currentTrackModifier = modifierVolume; // Store modifier for the new track

    // Recalculate nominal volume based on the new global musicVolume and the new track's modifier
    currentTrackNominalVolume = globalVolume * currentTrackModifier;

    // Clear any pending loop timeouts from previous tracks
    for (const timeoutId of activeLoopTimeouts) {
        clearTimeout(timeoutId);
    }
    activeLoopTimeouts = [];

    // Stop and clear any existing audio instances
    for (const audio of activeAudioInstances) {
        audio.pause();
        // It's good practice to remove listeners if they were added dynamically,
        // but since we are creating new audio objects each time, and old ones are dereferenced,
        // modern browsers are good at GC. The main concern is old timeouts firing.
    }
    activeAudioInstances.clear();

    const loopDurationMilliseconds = 103.95 * 1000; // 104 seconds

    /**
     * Creates, configures, and plays a single audio instance.
     * Schedules the next instance via setTimeout upon playing.
     * @returns {HTMLAudioElement | null} The created audio element, or null on immediate error.
     */
    function createAndPlayInstance() {
        const audio = new Audio(url); // Use the `url` from the outer scope (currentMusicUrl)
        audio.volume = currentTrackNominalVolume;
        activeAudioInstances.add(audio);

        // Event listener for when the audio track naturally ends.
        audio.addEventListener('ended', () => {
            activeAudioInstances.delete(audio);
        });

        // Event listener for playback errors.
        audio.addEventListener('error', (e) => {
            console.error("Error during background music playback:", e, {url: audio.src});
            activeAudioInstances.delete(audio);
        });

        // Listener for when playback actually begins to schedule the next loop precisely.
        audio.addEventListener('playing', () => {
            const expectedUrlAtLoopTime = currentMusicUrl; // Capture URL at the time of scheduling
            let timeoutId;
            timeoutId = setTimeout(() => {
                try {
                    // Only create next instance if this audio is still active and the song hasn't changed
                    if (activeAudioInstances.has(audio) && currentMusicUrl === expectedUrlAtLoopTime) {
                        createAndPlayInstance();
                    }
                } catch (err) {
                    console.error("Error in loop timeout callback:", err);
                } finally {
                    // Remove this timeoutId from the global array as it has now executed or been bypassed
                    activeLoopTimeouts = activeLoopTimeouts.filter(id => id !== timeoutId);
                }
            }, loopDurationMilliseconds);
            activeLoopTimeouts.push(timeoutId);
        }, { once: true }); // Ensure this listener only fires once per instance

        // Attempt to play the audio.
        audio.play().catch(error => {
            console.error("Error attempting to play background music:", error, {url: audio.src});
            activeAudioInstances.delete(audio);
        });
        return audio;
    }

    // Start the first instance of the background music.
    const firstInstance = createAndPlayInstance();
    if (firstInstance) {
        backgroundMusic = firstInstance; // For compatibility, though direct manipulation is discouraged
    }
}

/**
 * Fades all active background music instances to a target volume over a specified duration.
 * @param {number} targetAbsoluteVolume - The absolute target volume (0.0 to 1.0).
 * @param {number} duration - The duration of the fade in milliseconds.
 */
function fadeBackgroundMusic(targetAbsoluteVolume, duration) {
    if (activeAudioInstances.size === 0) {
        return;
    }

    const startTime = performance.now();
    const initialVolumes = new Map();

    activeAudioInstances.forEach(audio => {
        initialVolumes.set(audio, audio.volume);
    });

    // Optimization: if all instances are already at target, do nothing.
    let allAtTarget = true;
    initialVolumes.forEach(vol => {
        if (Math.abs(vol - targetAbsoluteVolume) > 0.01) { // Tolerance for float comparison
            allAtTarget = false;
        }
    });
    if (allAtTarget && initialVolumes.size > 0) {
        return;
    }

    function updateVolume() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        activeAudioInstances.forEach(audio => {
            const startVolume = initialVolumes.get(audio);
            if (startVolume !== undefined) { // Check if audio instance still exists in map
                const newVolume = startVolume + (targetAbsoluteVolume - startVolume) * progress;
                audio.volume = Math.max(0, Math.min(1, newVolume)); // Clamp volume
            }
        });

        if (progress < 1) {
            requestAnimationFrame(updateVolume);
        } else {
            // Ensure final volume is set precisely and pause if faded to zero
            activeAudioInstances.forEach(audio => {
                audio.volume = Math.max(0, Math.min(1, targetAbsoluteVolume));
                if (targetAbsoluteVolume === 0 && audio.volume === 0) {
                    audio.pause();
                }
            });
        }
    }
    requestAnimationFrame(updateVolume);
}
// --- Updated Audio Handling Logic Ends ---


let skin = 1;
if (document.cookie.includes("skin")) {
    skin = parseInt(cookies.skin) || 1; // Ensure skin is a number
    const skinIdElement = document.getElementById("skin-id");
    if (skinIdElement) skinIdElement.innerHTML = "Skin #" + skin;
    const boatUr = document.getElementById("boat_ur");
    const boatUl = document.getElementById("boat_ul");
    const boatLl = document.getElementById("boat_ll");
    const boatLr = document.getElementById("boat_lr");
    if (boatUr) boatUr.src = './assets/boats/' + skin + '/ur.png';
    if (boatUl) boatUl.src = './assets/boats/' + skin + '/ul.png';
    if (boatLl) boatLl.src = './assets/boats/' + skin + '/ll.png';
    if (boatLr) boatLr.src = './assets/boats/' + skin + '/lr.png';
}

let theme = "retro";
if (document.cookie.includes("theme")) {
    const themePickerElement = document.getElementById("theme-picker");
    if (themePickerElement) themePickerElement.value = cookies.theme;
    theme = cookies.theme; // Update global theme variable

    let arrowL = document.getElementById("skin-back");
    let arrowR = document.getElementById("skin-next");
    if (arrowL) arrowL.src = "./img/arrow_" + cookies.theme + ".png";
    if (arrowR) arrowR.src = "./img/arrow_" + cookies.theme + ".png";

    let themeableElems = document.getElementsByClassName("themeable");
    for (let i = 0; i < themeableElems.length; i++) {
        themeableElems[i].classList.remove("modern", "red", "retro");
        themeableElems[i].classList.add(cookies.theme);
    }
}


let darkMode = false;
if (cookies.darkMode === "1") {
    darkMode = true; // Set global darkMode state
    let darkableElems = document.getElementsByClassName("darkable");
    for (let i = 0; i < darkableElems.length; i++) {
        darkableElems[i].classList.add("darkmode");
    }
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    if (darkModeToggle) darkModeToggle.checked = true;
    
    const sqrElement = document.getElementById("sqr");
    if (sqrElement) {
        sqrElement.classList.remove("ship-display-" + theme); // Remove non-dark theme class
        sqrElement.classList.add("ship-display-" + theme + "-darkmode");
    }
} else {
    const sqrElement = document.getElementById("sqr");
    if (sqrElement) {
      sqrElement.classList.add("ship-display-" + theme);
    }
}


const gameCodeLength = 4;

window.mobileAndTabletCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

let isMobileUser = window.mobileAndTabletCheck();

if (isMobileUser) {
    let desktopElems = document.getElementsByClassName("desktop-only");
    for (let i = 0; i < desktopElems.length; i++) {
        desktopElems[i].classList.add("hidden");
    }
    const sqrElement = document.getElementById("sqr");
    if (sqrElement) sqrElement.classList.add("ship-display");
} else {
    let mobileElems = document.getElementsByClassName("mobile-only");
    for (let i = 0; i < mobileElems.length; i++) {
        mobileElems[i].classList.add("hidden");
    }
    const sqrElement = document.getElementById("sqr");
    if (sqrElement) sqrElement.classList.add("grid");
    const rootElement = document.getElementById("root");
    if (rootElement) {
        rootElement.classList.add("flex-center");
        rootElement.classList.remove("column");
    }
}

// Global player management
let players = [];
let isHost = false;

function addPlayer(name, skinId, isHostPlayer = false) {
    if (isHostPlayer) {
        isHost = true;
        return; 
    }
    players.push({ name, skinId, ready: false });
    updatePlayerList();
}

function updatePlayerList() {
    const playerList = document.getElementById('player-list');
    if (!playerList) return;
    
    playerList.innerHTML = '';
    
    const header = document.createElement('h2');
    header.textContent = `Players (${players.length})`;
    playerList.appendChild(header);
    
    players.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        playerItem.dataset.name = player.name;
        
        const boatImg = document.createElement('img');
        boatImg.src = `./assets/boats/${player.skinId}/icon.png`;
        
        const playerName = document.createElement('span');
        playerName.textContent = player.name;
        
        const readyCheckbox = document.createElement('div');
        readyCheckbox.className = 'ready-checkbox ' + (player.ready ? 'checked' : '');
        readyCheckbox.innerHTML = player.ready ? '&check;' : '';
        
        playerItem.appendChild(boatImg);
        playerItem.appendChild(playerName);
        playerItem.appendChild(readyCheckbox);
        playerList.appendChild(playerItem);
    });
}

function addPlayerToList(name, skinId, ready = false) {
    const playerList = document.getElementById('player-list');
    if (!playerList) return;
    
    players.push({ name, skinId, ready });
    updatePlayerList();
    
    const playerItem = playerList.querySelector(`[data-name="${name}"]`);
    if (playerItem) {
        playerItem.classList.add('highlight');
        setTimeout(() => playerItem.classList.remove('highlight'), 2000);
    }
    
    if (playJoinSounds) {
        playOneShot(getRandomJoinSound(), 0.3 * sfxVolume);
    }
}

function removePlayerFromList(name) {
    const playerList = document.getElementById('player-list');
    if (!playerList) return;
    
    players = players.filter(p => p.name !== name);
    updatePlayerList();
    
    if (playJoinSounds) {
        playOneShot('./assets/audio/player_leave.mp3', 0.1 * sfxVolume);
    }
}

function updatePlayerCount() {
    const playerList = document.getElementById('player-list');
    const playerCountDisplay = document.getElementById('player-count'); // Renamed for clarity
    const header = playerList?.querySelector('h2');
    
    if (!playerList) return;
    
    const count = players.length;

    if (playerCountDisplay) {
        playerCountDisplay.textContent = `Players: ${count}`;
    }
    
    if (header) {
        header.textContent = `Players (${count})`;
    }

    const sqrElement = document.getElementById("sqr");
    if (sqrElement) { // Removed playerCount null check as it's not directly used for sqrElement styling
        const division = (count > 0 ? (100 / count) : 100); 
        sqrElement.style.backgroundSize = `${division}% ${division}%, ${division}% ${division}%, 20% 20%`;
    }
}


if (typeof networkManager !== 'undefined') {
    networkManager.setCallbacks({
        onPlayerJoined: (name, skinId, ready) => {
            addPlayerToList(name, skinId, ready);
            updatePlayerCount();
        },
        onPlayerLeft: (name) => {
            removePlayerFromList(name);
            updatePlayerCount();
            if (countdownTimer) {
                cancelCountdown();
            }
        },
        onReadyStateUpdate: (name, ready) => {
            const player = players.find(p => p.name === name);
            if (player) {
                player.ready = ready;
                updatePlayerList();
                if (isHost) {
                    if (checkAllPlayersReady() && players.length > 1) { // Ensure there's more than just the host
                        startCountdown();
                    } else if (!ready) {
                        cancelCountdown();
                    }
                }
            }
        },
        onPlayerInfoUpdate: (oldName, newName, newSkinId) => {
            const player = players.find(p => p.name === oldName);
            if (player) {
                const playerItem = document.querySelector(`[data-name="${oldName}"]`);
                if (playerItem) {
                    if (newName) {
                        player.name = newName;
                        playerItem.dataset.name = newName;
                        const nameSpan = playerItem.querySelector('span');
                        if (nameSpan) nameSpan.classList.add('nickname-changed');
                        setTimeout(() => { if (nameSpan) nameSpan.classList.remove('nickname-changed'); }, 2000);
                    }
                    if (newSkinId !== undefined && newSkinId !== player.skinId) {
                        player.skinId = newSkinId;
                        const boatImg = playerItem.querySelector('img');
                        if (boatImg) {
                            boatImg.src = `./assets/boats/${newSkinId}/icon.png`;
                            boatImg.classList.add('skin-changed');
                            setTimeout(() => boatImg.classList.remove('skin-changed'), 2000);
                        }
                    }
                }
                updatePlayerList();
            }
        },
        onGameStarting: () => {
            if (!isHost) {
                startCountdown();
            }
        }
    });
} else {
    console.warn("networkManager is not defined. Callbacks not set.");
}


if (!isMobileUser) {
    const settingsModal = document.getElementById('settings-modal');
    const settingsBtnDesktop = document.getElementById('settings-btn-desktop');
    const closeSettingsBtn = document.getElementById('close-settings'); // Renamed for clarity
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const createLobbyBtn = document.getElementById('create-lobby');
    const lobbyOverlay = document.getElementById('lobby-overlay');
    const roomCodeDisplay = document.getElementById('room-code');

    function openSettings() {
        if (settingsModal) settingsModal.style.display = 'block';
    }

    function closeSettingsModal() {
        if (settingsModal) settingsModal.style.display = 'none';
    }

    if (tabButtons.length > 0 && tabPanels.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                button.classList.add('active');
                const tabName = button.getAttribute('data-tab');
                const targetPanel = document.getElementById(tabName + '-tab');
                if (targetPanel) targetPanel.classList.add('active');
            });
        });
    }
        
    if (document.getElementById('player-list')) {
        updatePlayerList();
    }

    if (createLobbyBtn) {
        createLobbyBtn.addEventListener('click', () => {
            const code = generateRoomCode();
            if (roomCodeDisplay) roomCodeDisplay.textContent = "Room Code: " + code;
            if (lobbyOverlay) lobbyOverlay.style.display = 'none';
            if (typeof networkManager !== 'undefined') {
                networkManager.createRoom(code, skin);
            } else {
                console.error("networkManager not available for createRoom");
            }
            addPlayer('You (Host)', skin, true); 
            playBackgroundMusic('./assets/audio/lobby_music.mp3', 0.4, musicVolume);
        });
    }

    if (settingsBtnDesktop) settingsBtnDesktop.addEventListener('click', openSettings);
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettingsModal);

    window.addEventListener('click', (event) => {
        if (settingsModal && event.target === settingsModal) {
            closeSettingsModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (settingsModal && settingsModal.style.display === 'block') {
                closeSettingsModal();
            } else if (!isMobileUser && settingsBtnDesktop) {
                openSettings();
            }
        }
    });
}


function getRandomJoinSound() {
    const joinSounds = [
        './assets/audio/player_join_1.mp3',
        './assets/audio/player_join_2.mp3',
        './assets/audio/player_join_3.mp3'
    ];
    return joinSounds[Math.floor(Math.random() * joinSounds.length)];
}

let lastCountdownSound = '';
function getRandomCountdownSound() {
    const countdownSounds = [
        './assets/audio/game_countdown_1.mp3', './assets/audio/game_countdown_2.mp3',
        './assets/audio/game_countdown_3.mp3', './assets/audio/game_countdown_4.mp3',
        './assets/audio/game_countdown_5.mp3'
    ];
    let availableSounds = countdownSounds.filter(sound => sound !== lastCountdownSound);
    if (availableSounds.length === 0) availableSounds = countdownSounds;
    const selectedSound = availableSounds[Math.floor(Math.random() * availableSounds.length)];
    lastCountdownSound = selectedSound;
    return selectedSound;
}

function getRandomStartSound() {
    const startSounds = [ // Corrected variable name
        './assets/audio/game_start_1.mp3', './assets/audio/game_start_2.mp3',
        './assets/audio/game_start_3.mp3'
    ];
    return startSounds[Math.floor(Math.random() * startSounds.length)];
}

function generateRoomCode() {
    const letters = 'ABCDEFGHJKLMNPQRSTUWXYZ'; 
    const badWords = ['FUCK', 'FVCK', 'SHIT', 'DAMN', 'CUNT', 'DICK', 'COCK', 'TWAT', 'CRAP'];
    while (true) {
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        if (!badWords.some(word => code.includes(word))) return code;
    }
}

const gameCodeInput = document.getElementById("game-code");
if (gameCodeInput) {
    gameCodeInput.addEventListener('input', function(event) {
        const joinBtn = document.getElementById("join-button"); // Renamed for clarity
        if (joinBtn) {
            joinBtn.disabled = event.target.value.length !== gameCodeLength;
        }
    });
}

let settingsOpen = false;
let settingsDiv = document.getElementById("settings-div");
let settingsBtn = document.getElementById("settings-button");
let touchStartY = 0;
let touchEndY = 0;
const minSwipeDistance = 50;
let settingsOpenSFX = document.getElementById("settings-open-sfx");
let settingsCloseSFX = document.getElementById("settings-close-sfx");

function toggleSettings(open) {
    if (settingsBtn && settingsDiv) {
        if (open && !settingsOpen) {
            if (settingsOpenSFX && settingsOpenSFX.play) settingsOpenSFX.play();
            settingsBtn.style.top = "75%";
            settingsDiv.style.top = "85%";
            settingsOpen = true;
        } else if (!open && settingsOpen) {
            if (settingsCloseSFX && settingsCloseSFX.play) settingsCloseSFX.play();
            settingsBtn.style.top = "90%";
            settingsDiv.style.top = "100%";
            settingsOpen = false;
        }
    }
}

function handleTouchStart(event) { touchStartY = event.touches[0].clientY; }
function handleTouchEnd(event) {
    touchEndY = event.changedTouches[0].clientY;
    const swipeDistance = touchEndY - touchStartY;
    if (Math.abs(swipeDistance) >= minSwipeDistance) {
        if (swipeDistance > 0 && settingsOpen) toggleSettings(false);
        else if (swipeDistance < 0 && !settingsOpen) toggleSettings(true);
    }
}

if (settingsBtn) {
    settingsBtn.addEventListener('touchstart', handleTouchStart);
    settingsBtn.addEventListener('touchend', handleTouchEnd);
    settingsBtn.addEventListener('click', () => toggleSettings(!settingsOpen));
}
if (settingsDiv) {
    settingsDiv.addEventListener('touchstart', handleTouchStart);
    settingsDiv.addEventListener('touchend', handleTouchEnd);
}

let darkModeSwitch = document.getElementById("dark-mode-toggle");
if (darkModeSwitch) {
    darkModeSwitch.addEventListener('change', function(event) {
        toggleDarkMode(event.target.checked); 
        const desktopSwitch = document.getElementById("dark-mode-toggle-desktop");
        if (desktopSwitch) desktopSwitch.checked = event.target.checked;
    });
}

let themePicker = document.getElementById("theme-picker");
if (themePicker) {
    themePicker.addEventListener('change', function(event) {
        theme = event.target.value;
        let arrowL = document.getElementById("skin-back");
        let arrowR = document.getElementById("skin-next");
        if (arrowL) arrowL.src = "./img/arrow_" + theme + ".png";
        if (arrowR) arrowR.src = "./img/arrow_" + theme + ".png";
        
        const sqrElement = document.getElementById("sqr");
        if (sqrElement) {
            sqrElement.className = 'ship-display-base'; // Reset classes then add specific ones
            if (isMobileUser) sqrElement.classList.add("ship-display"); else sqrElement.classList.add("grid");
            sqrElement.classList.add(darkMode ? "ship-display-" + theme + "-darkmode" : "ship-display-" + theme);
        }

        let themeableElems = document.getElementsByClassName("themeable");
        for (let i = 0; i < themeableElems.length; i++) {
            themeableElems[i].classList.remove("modern", "red", "retro");
            themeableElems[i].classList.add(theme);
        }
        setCookie("theme", theme);
    });
}

let currentPlayerName = cookies.nickname || getRandomSillyName(); 

let nextSkinBtn = document.getElementById("skin-next"); // Renamed for clarity
if (nextSkinBtn) {
    nextSkinBtn.addEventListener('click', function(event) {
        if (isReady) { event.preventDefault(); return; }    
        skin++;
        if (skin > SKIN_COUNT) skin = 1; // Use > SKIN_COUNT for wrap around
        setCookie("skin", skin.toString());
        const skinIdEl = document.getElementById("skin-id");
        if (skinIdEl) skinIdEl.innerHTML = "Skin #" + skin;
        
        ['ur', 'ul', 'll', 'lr'].forEach(suffix => {
            const boatImg = document.getElementById(`boat_${suffix}`);
            if (boatImg) boatImg.src = `./assets/boats/${skin}/${suffix}.png`;
        });
        
        if (typeof networkManager !== 'undefined') {
            networkManager.updatePlayerInfo({ oldName: currentPlayerName, newSkin: skin });
        }
    });
}

let backSkinBtn = document.getElementById("skin-back"); // Renamed for clarity
if (backSkinBtn) {
    backSkinBtn.addEventListener('click', function(event) {
        if (isReady) { event.preventDefault(); return; }    
        skin--;
        if (skin < 1) skin = SKIN_COUNT;
        setCookie("skin", skin.toString());
        const skinIdEl = document.getElementById("skin-id");
        if (skinIdEl) skinIdEl.innerHTML = "Skin #" + skin;

        ['ur', 'ul', 'll', 'lr'].forEach(suffix => {
            const boatImg = document.getElementById(`boat_${suffix}`);
            if (boatImg) boatImg.src = `./assets/boats/${skin}/${suffix}.png`;
        });
        
        if (typeof networkManager !== 'undefined') {
            networkManager.updatePlayerInfo({ oldName: currentPlayerName, newSkin: skin });
        }
    });
}

let nicknameInput = document.getElementById('nickname');
if (nicknameInput) {
    nicknameInput.value = currentPlayerName; // Set from already initialized currentPlayerName
    nicknameInput.addEventListener('input', function(event) {
        const newNickname = event.target.value.trim();
        if (newNickname && newNickname !== currentPlayerName) { // Only update if changed
            const oldNickname = currentPlayerName;
            currentPlayerName = newNickname;
            setCookie("nickname", newNickname);
            if (typeof networkManager !== 'undefined') {
                networkManager.updatePlayerInfo({ oldName: oldNickname, newNickname: newNickname });
            }
        }
    });
}

const joinButton = document.getElementById('join-button');
if (gameCodeInput && joinButton) {
    gameCodeInput.addEventListener('input', function(event) {
        const value = event.target.value.toUpperCase();
        event.target.value = value; // Force uppercase
        joinButton.disabled = value.length !== gameCodeLength;
    });

    joinButton.addEventListener('click', function() {
        const roomCode = gameCodeInput.value; // Already uppercase
        if (roomCode.length === gameCodeLength) {
            const nickname = nicknameInput ? nicknameInput.value.trim() : getRandomSillyName();
            if (!nickname) { // If nickname became empty after trim
                currentPlayerName = getRandomSillyName();
                if(nicknameInput) nicknameInput.value = currentPlayerName;
            } else {
                currentPlayerName = nickname;
            }
            if (typeof networkManager !== 'undefined') {
                networkManager.joinRoom(roomCode, currentPlayerName, skin);
            } else {
                console.error("networkManager not available for joinRoom");
            }
        }
    });
}

if (!document.getElementById('error-message')) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-message';
    errorDiv.style.cssText = 'display: none; color: red; position: fixed; top: 20%; left: 50%; transform: translateX(-50%); z-index: 1000; background-color: #ffdddd; padding: 10px; border-radius: 5px; border: 1px solid red;';
    document.body.appendChild(errorDiv);
}

if (!isMobileUser) {
    const musicVolumeSlider = document.getElementById('music-volume');
    const sfxVolumeSlider = document.getElementById('sfx-volume');
    const playJoinSoundsToggle = document.getElementById('play-join-sounds');

    if (musicVolumeSlider) {
        musicVolumeSlider.value = musicVolume * 100;
        musicVolumeSlider.addEventListener('input', (e) => {
            musicVolume = parseFloat(e.target.value) / 100; // Ensure float
            // Update nominal volume for the current track using its specific modifier
            currentTrackNominalVolume = musicVolume * currentTrackModifier;
            activeAudioInstances.forEach(audio => {
                audio.volume = currentTrackNominalVolume;
            });
            setCookie("musicVolume", musicVolume.toString());
        });
    }

    if (sfxVolumeSlider) {
        sfxVolumeSlider.value = sfxVolume * 100;
        sfxVolumeSlider.addEventListener('input', (e) => {
            sfxVolume = parseFloat(e.target.value) / 100; // Ensure float
            setCookie("sfxVolume", sfxVolume.toString());
        });
    }

    if (playJoinSoundsToggle) {
        playJoinSoundsToggle.checked = playJoinSounds;
        playJoinSoundsToggle.addEventListener('change', (e) => {
            playJoinSounds = e.target.checked;
            setCookie("playJoinSounds", (playJoinSounds ? "1" : "0"));
        });
    }
}

let isReady = false;
const readyButton = document.getElementById('ready-button');
const skinBackArrow = document.getElementById('skin-back'); // Use consistent naming with other btn vars
const skinNextArrow = document.getElementById('skin-next');

if (readyButton) {
    readyButton.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (this.getAttribute('aria-disabled') === 'true') return;
            this.click();
        }
    });

    readyButton.addEventListener('click', function() {
        if (this.getAttribute('aria-disabled') === 'true') return;
        
        // Ensure boatSections and placedSuits are defined (they are at global scope)
        if (typeof boatSections !== 'undefined' && typeof placedSuits !== 'undefined' && boatSections.length === placedSuits.size) {
            isReady = !isReady;
            this.style.backgroundColor = isReady ? '#44AA44' : '#AA4444';
            this.classList.toggle('not-ready', !isReady);
            this.setAttribute('aria-label', isReady ? 'Click to unready' : 'Click to ready up');
            
            if (skinBackArrow) skinBackArrow.classList.toggle('disabled', isReady);
            if (skinNextArrow) skinNextArrow.classList.toggle('disabled', isReady);
            if (nicknameInput) nicknameInput.disabled = isReady;
            
            document.querySelectorAll('.suit-square').forEach(square => {
                square.style.pointerEvents = isReady ? 'none' : 'auto';
                square.style.opacity = isReady ? '0.7' : '1';
            });
            
            if (typeof networkManager !== 'undefined') networkManager.setReadyState(isReady);
            
            if (!isReady && countdownTimer) { 
                cancelCountdown();
            }
        } else {
             const errorMsgElement = document.getElementById('error-message');
             if(errorMsgElement) {
                errorMsgElement.textContent = "All ship sections must be placed before readying up!";
                errorMsgElement.style.display = 'block';
                setTimeout(() => { errorMsgElement.style.display = 'none';}, 3000);
             }
        }
    });
    readyButton.setAttribute('aria-label', 'Click to ready up');
    // Initial state is disabled, will be enabled by updateReadyButtonState
    readyButton.setAttribute('aria-disabled', 'true'); 
}


function updateReadyButtonState() {
    const readyBtn = document.getElementById('ready-button'); // Use consistent naming
    if (!readyBtn) return;

    if (typeof boatSections !== 'undefined' && typeof placedSuits !== 'undefined') {
        const allSuitsPlaced = placedSuits.size === boatSections.length;
        readyBtn.setAttribute('aria-disabled', allSuitsPlaced ? 'false' : 'true');
        if (!allSuitsPlaced) {
            readyBtn.classList.add('not-ready'); 
            readyBtn.style.backgroundColor = '#AA4444'; 
            isReady = false; // Player cannot be ready if suits are not placed
            // Also update ARIA label if necessary and other UI elements tied to isReady
            readyBtn.setAttribute('aria-label', 'Place all ship sections to ready up');

        } else if (!isReady) { // All suits placed, but player hasn't clicked ready
             readyBtn.classList.remove('not-ready'); // Or ensure it's styled for "can ready"
             readyBtn.style.backgroundColor = '#AA4444'; // Default "not ready" color
             readyBtn.setAttribute('aria-label', 'Click to ready up');
        } else { // All suits placed AND player is ready
            readyBtn.classList.remove('not-ready');
            readyBtn.style.backgroundColor = '#44AA44'; // "Ready" color
            readyBtn.setAttribute('aria-label', 'Click to unready');
        }
    } else {
         readyBtn.setAttribute('aria-disabled', 'true'); 
    }
}

let darkModeSwitchDesktop = document.getElementById("dark-mode-toggle-desktop");

function toggleDarkMode(isDark) { 
    darkMode = isDark; 
    let darkableElems = document.getElementsByClassName("darkable");
    for (let i = 0; i < darkableElems.length; i++) {
        if (isDark) darkableElems[i].classList.add("darkmode");
        else darkableElems[i].classList.remove("darkmode");
    }
    
    const sqrElement = document.getElementById("sqr"); 
    if (sqrElement) {
        // Reset classes carefully to preserve base layout classes
        sqrElement.className = sqrElement.className.replace(/ship-display-[\w-]+darkmode/g, '').replace(/ship-display-(retro|modern|red)(?!-darkmode)/g, '');
        if (isDark) {
            sqrElement.classList.add("ship-display-" + theme + "-darkmode");
        } else {
            sqrElement.classList.add("ship-display-" + theme);
        }
    }
    setCookie("darkMode", isDark ? "1" : "0");
}

if (darkModeSwitchDesktop) {
    if (cookies.darkMode === "1") { 
        darkModeSwitchDesktop.checked = true;
        if (!darkMode) toggleDarkMode(true); // Ensure state is applied if not already
    }
    darkModeSwitchDesktop.addEventListener('change', function(event) {
        toggleDarkMode(event.target.checked);
        if (darkModeSwitch) darkModeSwitch.checked = event.target.checked; 
    });
}
// Apply initial dark mode if only mobile switch exists and cookie is set
if (cookies.darkMode === "1" && !darkModeSwitchDesktop && darkModeSwitch && !darkModeSwitch.checked) {
    darkModeSwitch.checked = true;
    toggleDarkMode(true);
}


const suitSquares = document.querySelectorAll('.suit-square');
const boatSections = document.querySelectorAll('.playerBoat'); 
const placedSuits = new Map(); 
let isDragging = false;
let currentSquare = null;
let offsetX = 0, offsetY = 0;
let originalPosition = null; 

function updateGridVisibility() {
    const suitSquaresContainer = document.getElementById('suit-squares'); 
    if (!suitSquaresContainer) return;
    // This logic might need review: if boatSections is empty, placedSuits.size will also be 0.
    const allPlaced = (boatSections.length > 0 && placedSuits.size === boatSections.length);
    if (allPlaced) {
        suitSquaresContainer.classList.add('empty');
    } else {
        suitSquaresContainer.classList.remove('empty');
    }
}

function resetSquarePosition(square, originalPosData) {
    square.classList.remove('placed');
    square.style.position = ''; // Reset to default CSS positioning
    square.style.left = '';
    square.style.top = '';
    square.style.transition = 'all 0.3s ease';

    // Attempt to return to original parent if it was moved
    if (originalPosData && originalPosData.parent && originalPosData.parent !== square.parentElement) {
        originalPosData.parent.appendChild(square);
    }
    // More specific reset logic might be needed depending on initial layout (e.g., CSS Grid)
}


if (suitSquares.length > 0 && boatSections.length > 0) {
    suitSquares.forEach(square => {
        square.addEventListener('touchstart', (e) => {
            if (isReady) { e.preventDefault(); return; }
            isDragging = true;
            currentSquare = square;
            const touch = e.touches[0];
            const rect = square.getBoundingClientRect();
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
            originalPosition = { left: rect.left, top: rect.top, parent: square.parentElement };
            square.style.transition = 'none'; 
            square.style.zIndex = '1000';
            square.style.opacity = '0.8';
        });

        square.addEventListener('touchmove', (e) => {
            if (!isDragging || !currentSquare) return;
            e.preventDefault(); 
            const touch = e.touches[0];
            currentSquare.style.position = 'fixed'; 
            currentSquare.style.left = `${touch.clientX - offsetX}px`;
            currentSquare.style.top = `${touch.clientY - offsetY}px`;

            const squareRect = currentSquare.getBoundingClientRect();
            const squareCenter = { x: squareRect.left + squareRect.width / 2, y: squareRect.top + squareRect.height / 2 };
            let closestSection = null;
            let minDistance = Infinity;
            boatSections.forEach(section => {
                section.style.opacity = '1'; 
                const sectionRect = section.getBoundingClientRect();
                const sectionCenter = { x: sectionRect.left + sectionRect.width / 2, y: sectionRect.top + sectionRect.height / 2 };
                const distance = Math.hypot(squareCenter.x - sectionCenter.x, squareCenter.y - sectionCenter.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestSection = section;
                }
            });
            if (closestSection && minDistance < 100) closestSection.style.opacity = '0.7';
        });
    });

    document.addEventListener('touchend', (e) => { 
        if (!isDragging || !currentSquare) return;
        const squareRect = currentSquare.getBoundingClientRect();
        let isPlacedSuccessfully = false; // Renamed for clarity
        const squareCenter = { x: squareRect.left + squareRect.width / 2, y: squareRect.top + squareRect.height / 2 };
        let closestTargetSection = null; // Renamed for clarity
        let minDistanceToTarget = Infinity;
        let closestTargetRect = null;
        
        boatSections.forEach(section => {
            const sectionRect = section.getBoundingClientRect();
            const sectionCenter = { x: sectionRect.left + sectionRect.width / 2, y: sectionRect.top + sectionRect.height / 2 };
            const distance = Math.hypot(squareCenter.x - sectionCenter.x, squareCenter.y - sectionCenter.y);
            if (distance < minDistanceToTarget) {
                minDistanceToTarget = distance;
                closestTargetSection = section;
                closestTargetRect = sectionRect; 
            }
        });

        if (closestTargetSection && minDistanceToTarget < 100) { 
            isPlacedSuccessfully = true;
            const suitToPlace = currentSquare.dataset.suit;
            const targetSectionId = closestTargetSection.id;

            const suitCurrentlyInTarget = placedSuits.get(targetSectionId);
            const previousSectionIdOfSuitToPlace = Array.from(placedSuits.entries()).find(([,s]) => s === suitToPlace)?.[0];

            // If target is occupied by a different suit
            if (suitCurrentlyInTarget && suitCurrentlyInTarget !== suitToPlace) {
                const squareOfDisplacedSuit = document.querySelector(`.suit-square[data-suit="${suitCurrentlyInTarget}"]`);
                if (squareOfDisplacedSuit) {
                    if (previousSectionIdOfSuitToPlace) { // Move displaced suit to old spot of current square
                        const oldSectionElement = document.getElementById(previousSectionIdOfSuitToPlace);
                        if (oldSectionElement) {
                            const oldRect = oldSectionElement.getBoundingClientRect();
                            squareOfDisplacedSuit.style.position = 'fixed';
                            squareOfDisplacedSuit.style.left = `${oldRect.left + (oldRect.width - squareOfDisplacedSuit.offsetWidth) / 2}px`;
                            squareOfDisplacedSuit.style.top = `${oldRect.top + (oldRect.height - squareOfDisplacedSuit.offsetHeight) / 2}px`;
                            placedSuits.set(previousSectionIdOfSuitToPlace, suitCurrentlyInTarget);
                            squareOfDisplacedSuit.classList.add('placed');
                        } else { resetSquarePosition(squareOfDisplacedSuit, null); } // Fallback
                    } else { // currentSquare was unplaced, so reset displaced one
                        resetSquarePosition(squareOfDisplacedSuit, null); // Pass null if no specific original pos data for it
                    }
                }
            }
            
            // Remove suitToPlace from its old position (if any)
            if (previousSectionIdOfSuitToPlace) {
                placedSuits.delete(previousSectionIdOfSuitToPlace);
            }

            // Place currentSquare (suitToPlace) in the new targetSection
            placedSuits.set(targetSectionId, suitToPlace);
            currentSquare.classList.add('placed');
            currentSquare.style.position = 'fixed'; 
            currentSquare.style.left = `${closestTargetRect.left + (closestTargetRect.width - currentSquare.offsetWidth) / 2}px`;
            currentSquare.style.top = `${closestTargetRect.top + (closestTargetRect.height - currentSquare.offsetHeight) / 2}px`;
        }

        if (!isPlacedSuccessfully) {
            resetSquarePosition(currentSquare, originalPosition); 
        }

        boatSections.forEach(section => section.style.opacity = '1'); 
        updateGridVisibility();
        updateReadyButtonState();

        if(currentSquare) { 
            currentSquare.style.zIndex = '1'; 
            currentSquare.style.opacity = '1';
            currentSquare.style.transition = 'all 0.3s ease'; 
        }
        isDragging = false;
        currentSquare = null;
        originalPosition = null;
    });
}

let countdownTimer = null;
let gameStarting = false;
const countdownDisplay = document.createElement('div');
countdownDisplay.id = 'countdown-display';
countdownDisplay.style.cssText = 'display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 48px; font-weight: bold; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); z-index: 1000;';
if (theme==="retro") { 
    countdownDisplay.classList.add("retro"); 
    countdownDisplay.style.fontFamily = "blocky, sans-serif"; 
}
document.body.appendChild(countdownDisplay);

function startCountdown() {
    if (countdownTimer || gameStarting) return;
    let countdown = 3;
    countdownDisplay.style.display = 'block';
    gameStarting = true;
    fadeBackgroundMusic(currentTrackNominalVolume * 0.1, 1000); // Fade relative to current nominal volume
    
    function updateCountdown() {
        if (countdown > 0) {
            countdownDisplay.textContent = countdown;
            playOneShot(getRandomCountdownSound(), 0.1 * sfxVolume); 
            countdown--;
            countdownTimer = setTimeout(updateCountdown, 1000);
        } else {
            countdownDisplay.textContent = 'GO!';
            playOneShot(getRandomStartSound(), 0.07 * sfxVolume); 
            setTimeout(() => {
                countdownDisplay.style.display = 'none';
                startGame();
            }, 1000);
            countdownTimer = null; 
        }
    }
    updateCountdown();
}

function cancelCountdown() {
    if (countdownTimer) {
        clearTimeout(countdownTimer);
        countdownTimer = null;
    }
    gameStarting = false;
    countdownDisplay.style.display = 'none';
    fadeBackgroundMusic(currentTrackNominalVolume, 1000); // Restore to full nominal volume
}

function startGame() {
    gameStarting = false; 
    if (isHost && typeof networkManager !== 'undefined' && networkManager.socket) {
        networkManager.socket.emit('gameStart');
    }
    console.log('Game starting!');
}

function checkAllPlayersReady() {
    // For a 2+ player game:
    // If host, at least one other player must be ready.
    // If client, all other players (including host implicitly via server state) must be ready.
    // This client-side check is a UI convenience; server should be the source of truth.
    if (players.length === 0) return false; // No other players connected
    return players.every(player => player.ready);
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateReadyButtonState();
        updateGridVisibility(); // Also update grid on load
    });
} else {
    updateReadyButtonState();
    updateGridVisibility();
}
