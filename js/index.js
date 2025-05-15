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
    //const number = Math.floor(Math.random() * 100);
    return `${sillyNames[adjIndex]}`;
}

// Audio settings
if (!document.cookie.includes("musicVolume")) {
    document.cookie = "musicVolume=0.5";
}
if (!document.cookie.includes("sfxVolume")) {
    document.cookie = "sfxVolume=0.5";
}
if (!document.cookie.includes("playJoinSounds")) {
    document.cookie = "playJoinSounds=1";
}
let musicVolume = cookies.musicVolume ? parseFloat(cookies.musicVolume) : 0.5;
let sfxVolume = cookies.sfxVolume ? parseFloat(cookies.sfxVolume) : 0.5;
let playJoinSounds = cookies.playJoinSounds !== "0";

// Audio handling
function playOneShot(url, volume) {
    if (!volume) return; // Don't play if volume is 0
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play();
}

let backgroundMusic;
function playBackgroundMusic(url, modiferVolume, volume = musicVolume) {
    if (backgroundMusic) {
        backgroundMusic.pause();
    }
    backgroundMusic = new Audio(url);
    backgroundMusic.volume = volume * modiferVolume;
    backgroundMusic.loop = true;
    backgroundMusic.play();
}


let skin = 1;
if (document.cookie.includes("skin")) {
    skin = cookies.skin;
    document.getElementById("skin-id").innerHTML = "Skin #" + skin;
    document.getElementById("boat_ur").src = './assets/boats/' + skin + '/ur.png';
    document.getElementById("boat_ul").src = './assets/boats/' + skin + '/ul.png';
    document.getElementById("boat_ll").src = './assets/boats/' + skin + '/ll.png';
    document.getElementById("boat_lr").src = './assets/boats/' + skin + '/lr.png';
}

let theme = "retro";
if (document.cookie.includes("theme")) {
    document.getElementById("theme-picker").value = cookies.theme;
    let arrowL = document.getElementById("skin-back");
    let arrowR = document.getElementById("skin-next");
    arrowL.src = "./img/arrow_" + cookies.theme + ".png";
    arrowR.src = "./img/arrow_" + cookies.theme + ".png";
    let themeableElems = document.getElementsByClassName("themeable");
    if (cookies.theme === "modern") {
        for (let i = 0; i < themeableElems.length; i++) {
            themeableElems[i].classList.add("modern");
            themeableElems[i].classList.remove("red");
            themeableElems[i].classList.remove("retro");
        }
        theme = "modern";
    }
    else if (cookies.theme === "red") {
        for (let i = 0; i < themeableElems.length; i++) {
            themeableElems[i].classList.remove("modern");
            themeableElems[i].classList.add("red");
            themeableElems[i].classList.remove("retro");
        }
        theme = "red";
    }
}

let darkMode = false;
if (cookies.darkMode === "1") {
    let darkableElems = document.getElementsByClassName("darkable");
    for (let i = 0; i < darkableElems.length; i++) {
        darkableElems[i].classList.add("darkmode");
    }
    darkMode = true;
    document.getElementById("dark-mode-toggle").checked = true;
    document.getElementById("sqr").classList.add("ship-display-" + theme + "-darkmode");
}
else {
    document.getElementById("sqr").classList.add("ship-display-" + theme);
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
    document.getElementById("sqr").classList.add("ship-display");
}
else {
    let mobileElems = document.getElementsByClassName("mobile-only");
    for (let i = 0; i < mobileElems.length; i++) {
        mobileElems[i].classList.add("hidden");
    }
    document.getElementById("sqr").classList.add("grid");
    document.getElementById("root").classList.add("flex-center");
    document.getElementById("root").classList.remove("column");
}

// Global player management
let players = [];
let isHost = false;

function addPlayer(name, skinId, isHostPlayer = false) {
    if (isHostPlayer) {
        isHost = true;
        return; // Don't add host to the player list
    }
    players.push({ name, skinId, ready: false });
    updatePlayerList();
}

function updatePlayerList() {
    const playerList = document.getElementById('player-list');
    if (!playerList) return;
    
    // Clear existing list
    playerList.innerHTML = '';
    
    // Add header with player count
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
    
    // Add to players array
    players.push({ name, skinId, ready });
    
    // Update the full list to ensure count is correct
    updatePlayerList();
    
    // Find the new player's item and add highlight
    const playerItem = playerList.querySelector(`[data-name="${name}"]`);
    if (playerItem) {
        playerItem.classList.add('highlight');
        setTimeout(() => playerItem.classList.remove('highlight'), 2000);
    }
    
    // Play random join sound if enabled
    if (playJoinSounds) {
        playOneShot(getRandomJoinSound(), 0.3);
    }
}

function removePlayerFromList(name) {
    const playerList = document.getElementById('player-list');
    if (!playerList) return;
    
    // Remove from players array
    players = players.filter(p => p.name !== name);
    
    // Update the full list to ensure count is correct
    updatePlayerList();
    
    // Play leave sound if enabled
    if (playJoinSounds) {
        playOneShot('./assets/audio/player_leave.mp3', 0.1);
    }
}

function updatePlayerCount() {
    const playerList = document.getElementById('player-list');
    const playerCount = document.getElementById('player-count');
    const header = playerList?.querySelector('h2');
    
    if (!playerList) return;
    
    const count = players.length;

    // Update player count display
    if (playerCount) {
        playerCount.textContent = `Players: ${count}`;
    }
    
    // Update header if it exists
    if (header) {
        header.textContent = `Players (${count})`;
    }
}

// Initialize networking callbacks
networkManager.setCallbacks({
    onPlayerJoined: (name, skinId, ready) => {
        addPlayerToList(name, skinId, ready);
        updatePlayerCount();
    },
    onPlayerLeft: (name) => {
        removePlayerFromList(name);
        updatePlayerCount();
    },
    onReadyStateUpdate: (name, ready) => {
        const player = players.find(p => p.name === name);
        if (player) {
            player.ready = ready;
            updatePlayerList();
        }
    },
    onPlayerInfoUpdate: (oldName, newName, newSkinId) => {
        const player = players.find(p => p.name === oldName);
        if (player) {
            // Update player info with highlighting effects
            const playerItem = document.querySelector(`[data-name="${oldName}"]`);
            if (playerItem) {
                // If nickname changed
                if (newName) {
                    player.name = newName;
                    playerItem.dataset.name = newName;
                    
                    // Add orange highlight for nickname changes
                    const nameSpan = playerItem.querySelector('span');
                    nameSpan.classList.add('nickname-changed');
                    setTimeout(() => nameSpan.classList.remove('nickname-changed'), 2000);
                }
                
                // If skin changed
                if (newSkinId !== undefined && newSkinId !== player.skinId) {
                    player.skinId = newSkinId;
                    const boatImg = playerItem.querySelector('img');
                    if (boatImg) {
                        boatImg.src = `./assets/boats/${newSkinId}/icon.png`;
                        // Add blue highlight for skin changes
                        boatImg.classList.add('skin-changed');
                        setTimeout(() => boatImg.classList.remove('skin-changed'), 2000);
                    }
                }
            }
            updatePlayerList();
        }
    }
});

// Desktop lobby and settings functionality
if (!isMobileUser) {
    const settingsModal = document.getElementById('settings-modal');
    const settingsBtnDesktop = document.getElementById('settings-btn-desktop');
    const closeSettings = document.getElementById('close-settings');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const createLobbyBtn = document.getElementById('create-lobby');
    const lobbyOverlay = document.getElementById('lobby-overlay');
    const roomCodeDisplay = document.getElementById('room-code');
    const playersContainer = document.getElementById('player-list');

    // Settings modal functionality
    function openSettings() {
        settingsModal.style.display = 'block';
    }

    function closeSettingsModal() {
        settingsModal.style.display = 'none';
    }

    // Tab functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            const tabName = button.getAttribute('data-tab');
            document.getElementById(tabName + '-tab').classList.add('active');
        });
    });    // Initialize empty player list
    updatePlayerList();

    // Event listeners
    createLobbyBtn.addEventListener('click', () => {
        const code = generateRoomCode();
        roomCodeDisplay.textContent = "Room Code: " + code;
        lobbyOverlay.style.display = 'none';
        // Connect to server and create room
        networkManager.createRoom(code, skin);
        // Register as host but don't show in player list
        addPlayer('You (Host)', skin, true);
        // Start background music
        playBackgroundMusic('./assets/audio/background_music.mp3', 0.4);
    });

    settingsBtnDesktop.addEventListener('click', openSettings);
    closeSettings.addEventListener('click', closeSettingsModal);

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            closeSettingsModal();
        }
    });

    // Handle Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (settingsModal.style.display === 'block') {
                closeSettingsModal();
            } else {
                openSettings();
            }
        }
    });
}



// Get a random join sound file path
function getRandomJoinSound() {
    const joinSounds = [
        './assets/audio/player_join_1.mp3',
        './assets/audio/player_join_2.mp3',
        './assets/audio/player_join_3.mp3'
    ];
    return joinSounds[Math.floor(Math.random() * joinSounds.length)];
}


// Device detection for different modes
function initializeGameMode() {
    
    if (isMobileUser) {
        // Mobile client mode - throwing errors
        //document.getElementById('join-screen').style.display = 'flex';
        //document.getElementById('host-controls').style.display = 'none';
    } else {
        // Desktop host mode - throwing errors
        //document.getElementById('join-screen').style.display = 'none';
        //document.getElementById('host-controls').style.display = 'flex';
        // Generate and display room code
        const roomCode = generateRoomCode();
        document.getElementById('room-code').textContent = "Room Code: " + roomCode;
        networkManager.createRoom(roomCode, skin);
    }
}

function generateRoomCode() {
    const letters = 'ABCDEFGHJKLMNPQRSTUWXYZ'; // Excluded I and O to avoid confusion with 1 and 0, and V because it kinda looks like a U and a Y
    const badWords = ['FUCK', 'FVCK', 'SHIT', 'DAMN', 'CUNT', 'DICK', 'COCK', 'TWAT', 'CRAP'];
    
    while (true) {
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        
        // Check if the code contains any bad words
        if (!badWords.some(word => code.includes(word))) {
            return code;
        }
    }
}




function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

let gameCodeInput = document.getElementById("game-code");
gameCodeInput.addEventListener('input', function(event) {
    if (event.target.value.length === gameCodeLength) {
        document.getElementById("join-button").removeAttribute("disabled");
    }
    else {
        document.getElementById("join-button").setAttribute("disabled", true);
    }
});

let settingsOpen = false;
let settingsDiv = document.getElementById("settings-div");
let settingsBtn = document.getElementById("settings-button");

// Touch handling variables
let touchStartY = 0;
let touchEndY = 0;
const minSwipeDistance = 50; // Minimum distance for a swipe to be detected

let settingsOpenSFX = document.getElementById("settings-open-sfx");
let settingsCloseSFX = document.getElementById("settings-close-sfx");
// Function to toggle settings menu
function toggleSettings(open) {
    if (open && !settingsOpen) {
        settingsOpenSFX.play();
        settingsBtn.style.top = "65%";
        settingsDiv.style.top = "75%";
        settingsOpen = true;
    } else if (!open && settingsOpen) {
        settingsCloseSFX.play();
        settingsBtn.style.top = "90%";
        settingsDiv.style.top = "100%";
        settingsOpen = false;
    }
}

// Touch event handlers
function handleTouchStart(event) {
    touchStartY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
    touchEndY = event.changedTouches[0].clientY;
    const swipeDistance = touchEndY - touchStartY;
      if (Math.abs(swipeDistance) >= minSwipeDistance) {
        if (swipeDistance > 0 && settingsOpen) {
            // Swipe down, close settings
            toggleSettings(false);
        } else if (swipeDistance < 0 && !settingsOpen) {
            // Swipe up, open settings
            toggleSettings(true);
        }
    }
}

// Add touch event listeners
settingsBtn.addEventListener('touchstart', handleTouchStart);
settingsBtn.addEventListener('touchend', handleTouchEnd);
settingsDiv.addEventListener('touchstart', handleTouchStart);
settingsDiv.addEventListener('touchend', handleTouchEnd);

settingsBtn.addEventListener('click', function(event) {
    toggleSettings(!settingsOpen);
});

let darkModeSwitch = document.getElementById("dark-mode-toggle");
darkModeSwitch.addEventListener('change', function(event) {
    if (darkMode) {
        let darkableElems = document.getElementsByClassName("darkable");
        for (let i = 0; i < darkableElems.length; i++) {
            darkableElems[i].classList.remove("darkmode");
        }
        darkMode = false;
        document.getElementById("sqr").classList.add("ship-display-" + theme);
        document.getElementById("sqr").classList.remove("ship-display-" + theme + "-darkmode");
        document.cookie = "darkMode=0";
    }
    else {
        let darkableElems = document.getElementsByClassName("darkable");
        for (let i = 0; i < darkableElems.length; i++) {
            darkableElems[i].classList.add("darkmode");
        }
        document.getElementById("sqr").classList.remove("ship-display-" + theme);
        document.getElementById("sqr").classList.add("ship-display-" + theme + "-darkmode");
        darkMode = true;
        document.cookie = "darkMode=1";
    }
});

let themePicker = document.getElementById("theme-picker");
themePicker.addEventListener('change', function(event) {
    theme = event.target.value;
    let arrowL = document.getElementById("skin-back");
    let arrowR = document.getElementById("skin-next");
    arrowL.src = "./img/arrow_" + theme + ".png";
    arrowR.src = "./img/arrow_" + theme + ".png";
    if (darkMode) {
        document.getElementById("sqr").classList.remove("ship-display-retro-darkmode");
        document.getElementById("sqr").classList.remove("ship-display-modern-darkmode");
        document.getElementById("sqr").classList.remove("ship-display-red-darkmode");
        document.getElementById("sqr").classList.add("ship-display-" + theme + "-darkmode");
    }
    else {
        document.getElementById("sqr").classList.remove("ship-display-retro");
        document.getElementById("sqr").classList.remove("ship-display-modern");
        document.getElementById("sqr").classList.remove("ship-display-red");
        document.getElementById("sqr").classList.add("ship-display-" + theme);
    }
    let themeableElems = document.getElementsByClassName("themeable");
    for (let i = 0; i < themeableElems.length; i++) {
        themeableElems[i].classList.remove("modern");
        themeableElems[i].classList.remove("red");
        themeableElems[i].classList.remove("retro");
        themeableElems[i].classList.add(theme);
    }
    document.cookie = "theme=" + theme;
});

let nextSkin = document.getElementById("skin-next");
nextSkin.addEventListener('click', function(event) {
    if (isReady) {
        event.preventDefault();
        return;
    }
    skin++;
    if (skin >= SKIN_COUNT) {
        skin = 1;
    }
    document.cookie = "skin=" + skin;
    document.getElementById("skin-id").innerHTML = "Skin #" + skin;
    document.getElementById("boat_ur").src = './assets/boats/' + skin + '/ur.png';
    document.getElementById("boat_ul").src = './assets/boats/' + skin + '/ul.png';
    document.getElementById("boat_ll").src = './assets/boats/' + skin + '/ll.png';
    document.getElementById("boat_lr").src = './assets/boats/' + skin + '/lr.png';
    
    // Notify server about skin change
    if (networkManager) {
        networkManager.updatePlayerInfo({ 
            oldName: currentPlayerName,
            newSkin: skin
        });
    }
});

let backSkin = document.getElementById("skin-back");
backSkin.addEventListener('click', function(event) {
    if (isReady) {
        event.preventDefault();
        return;
    }
    skin--;
    if (skin < 1) {
        skin = SKIN_COUNT;
    }
    document.cookie = "skin=" + skin;
    document.getElementById("skin-id").innerHTML = "Skin #" + skin;
    document.getElementById("boat_ur").src = './assets/boats/' + skin + '/ur.png';
    document.getElementById("boat_ul").src = './assets/boats/' + skin + '/ul.png';
    document.getElementById("boat_ll").src = './assets/boats/' + skin + '/ll.png';
    document.getElementById("boat_lr").src = './assets/boats/' + skin + '/lr.png';
    
    // Notify server about skin change
    if (networkManager) {
        networkManager.updatePlayerInfo({ 
            oldName: currentPlayerName,
            newSkin: skin
        });
    }
});

// Nickname handling
let nicknameInput = document.getElementById('nickname');
let savedNickname = cookies.nickname;

if (savedNickname) {
    nicknameInput.value = savedNickname;
} else {
    nicknameInput.value = getRandomSillyName();
}

// Track current player's name
let currentPlayerName = '';

nicknameInput.addEventListener('input', function(event) {
    const newNickname = event.target.value.trim();
    if (newNickname) {
        const oldNickname = currentPlayerName;
        currentPlayerName = newNickname;
        document.cookie = `nickname=${encodeURIComponent(newNickname)}`;
    // Notify server about nickname change
    if (networkManager) {
        networkManager.updatePlayerInfo({ 
            oldName: oldNickname,
            newNickname: newNickname
        });
    }
    }
});

// Game code input and join button functionality
const joinButton = document.getElementById('join-button');

gameCodeInput.addEventListener('input', function(event) {
    const value = event.target.value.toUpperCase();
    event.target.value = value;
    joinButton.disabled = value.length !== gameCodeLength;
});

joinButton.addEventListener('click', function() {
    const roomCode = gameCodeInput.value.toUpperCase();
    if (roomCode.length === gameCodeLength) {
        const nickname = nicknameInput.value.trim() || getRandomSillyName();
        currentPlayerName = nickname; // Set initial player name
        networkManager.joinRoom(roomCode, nickname, skin);
    }
});

// Add error message div if not present
if (!document.getElementById('error-message')) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-message';
    errorDiv.style.cssText = 'display: none; color: red; position: fixed; top: 20%; left: 50%; transform: translateX(-50%); z-index: 1000;';
    document.body.appendChild(errorDiv);
}

// Initialize audio controls
if (!isMobileUser) {
    const musicVolumeSlider = document.getElementById('music-volume');
    const sfxVolumeSlider = document.getElementById('sfx-volume');
    const playJoinSoundsToggle = document.getElementById('play-join-sounds');

    // Set initial values
    musicVolumeSlider.value = musicVolume * 100;
    sfxVolumeSlider.value = sfxVolume * 100;
    playJoinSoundsToggle.checked = playJoinSounds;

    // Add event listeners
    musicVolumeSlider.addEventListener('input', (e) => {
        musicVolume = e.target.value / 100;
        if (backgroundMusic) {
            backgroundMusic.volume = musicVolume;
        }
        document.cookie = `musicVolume=${musicVolume}`;
    });

    sfxVolumeSlider.addEventListener('input', (e) => {
        sfxVolume = e.target.value / 100;
        document.cookie = `sfxVolume=${sfxVolume}`;
    });

    playJoinSoundsToggle.addEventListener('change', (e) => {
        playJoinSounds = e.target.checked;
        document.cookie = `playJoinSounds=${playJoinSounds ? "1" : "0"}`;
    });
}

// Ready state handling
let isReady = false;
const readyButton = document.getElementById('ready-button');
const skinBack = document.getElementById('skin-back');
const skinNext = document.getElementById('skin-next');

if (readyButton) {
    readyButton.addEventListener('click', function() {
        // Only allow toggling ready state if all suits are placed
        if (boatSections.length === placedSuits.size) {
            isReady = !isReady;
            readyButton.style.backgroundColor = isReady ? '#44AA44' : '#664444';
            
            // Disable/enable controls based on ready state
            skinBack.classList.toggle('disabled', isReady);
            skinNext.classList.toggle('disabled', isReady);
            nicknameInput.disabled = isReady;
            
            // Make suit squares uninteractable when ready
            document.querySelectorAll('.suit-square').forEach(square => {
                square.style.pointerEvents = isReady ? 'none' : 'auto';
                square.style.opacity = isReady ? '0.7' : '1';
            });
            
            networkManager.setReadyState(isReady);
        }
    });
}

// Disable skin change when ready
skinBack.addEventListener('click', function(event) {
    if (isReady) {
        event.preventDefault();
        return;
    }
    // ...existing code...
});

skinNext.addEventListener('click', function(event) {
    if (isReady) {
        event.preventDefault();
        return;
    }
    // ...existing code...
});

// Player functions are now global
// performJoin implementation
function performJoin(roomCode, playerName, skinId) {
    console.log('Attempting to join room:', roomCode);
    showError('Joining room...');
    
    socket.emit('join-room', {
        roomCode: roomCode.toUpperCase(),
        name: playerName,
        skinId: skinId,
        clientId: socket.id
    });

    // Set up handlers for room join process
    socket.once('joinSuccess', (data) => {
        console.log('Successfully joined room:', data);
        showError('Successfully joined room!');
        // Hide join UI elements
        document.getElementById('game-code').style.display = 'none';
        document.getElementById('join-button').style.display = 'none';
        document.getElementById('ready-button').style.display = 'inline-flex';
        
        // Show and enable suit squares
        const suitSquares = document.getElementById('suit-squares');
        const root = document.getElementById('root');
        if (suitSquares) {
            suitSquares.classList.add('show');
        }
        if (root) {
            root.classList.add('game-joined');
        }
    });
    
    socket.once('roomError', (error) => {
        console.error('Room join error:', error);
        showError(error.message || 'Failed to join room');
        // Re-enable join UI
        document.getElementById('game-code').style.display = '';
        document.getElementById('join-button').style.display = '';
        document.getElementById('ready-button').style.display = 'none';
    });
}

// Update createRoom to handle ready state updates
function performCreateRoom(roomCode) {
    console.log('Creating room with code:', roomCode);
    
    // Remove any existing listeners first
    socket.off('playerJoined');
    socket.off('playerLeft');
    
    socket.emit('create-room', { 
        roomCode: roomCode,
        hostId: socket.id,
        hostSkin: skin
    });
    
    socket.on('playerJoined', ({ name, skinId, ready }) => {
        console.log('Player joined:', name);
        // Update player list in UI
        addPlayerToList(name, skinId, ready);
        updatePlayerCount();
    });
    
    socket.on('playerLeft', ({ name }) => {
        console.log('Player left:', name);
        // Remove player from UI
        removePlayerFromList(name);
        updatePlayerCount();
    });
}

// Dark mode functionality
let darkModeSwitchDesktop = document.getElementById("dark-mode-toggle-desktop");

function toggleDarkMode(isDark) {
    if (!isDark) {
        let darkableElems = document.getElementsByClassName("darkable");
        for (let i = 0; i < darkableElems.length; i++) {
            darkableElems[i].classList.remove("darkmode");
        }
        darkMode = false;
        document.getElementById("sqr").classList.add("ship-display-" + theme);
        document.getElementById("sqr").classList.remove("ship-display-" + theme + "-darkmode");
        document.cookie = "darkMode=0";
    } else {
        let darkableElems = document.getElementsByClassName("darkable");
        for (let i = 0; i < darkableElems.length; i++) {
            darkableElems[i].classList.add("darkmode");
        }
        document.getElementById("sqr").classList.remove("ship-display-" + theme);
        document.getElementById("sqr").classList.add("ship-display-" + theme + "-darkmode");
        darkMode = true;
        document.cookie = "darkMode=1";
    }
}

// Sync dark mode state between mobile and desktop toggles
darkModeSwitch.addEventListener('change', function(event) {
    toggleDarkMode(event.target.checked);
    // Sync with desktop toggle
    darkModeSwitchDesktop.checked = event.target.checked;
});

if (document.cookie.includes("darkMode")) {
    darkModeSwitchDesktop.checked = (cookies.darkMode === "1");
}
darkModeSwitchDesktop.addEventListener('change', function(event) {
    toggleDarkMode(event.target.checked);
    // Sync with mobile toggle
    darkModeSwitch.checked = event.target.checked;
});

// Suit square touch functionality
const suitSquares = document.querySelectorAll('.suit-square');
const boatSections = document.querySelectorAll('.playerBoat');
const placedSuits = new Map(); // Keep track of which suits are placed where
const suitPositions = {
    'ul': '', // Upper Left
    'ur': '', // Upper Right
    'll': '', // Lower Left
    'lr': ''  // Lower Right
};

let isDragging = false;
let currentSquare = null;
let startX = 0;
let startY = 0;
let offsetX = 0;
let offsetY = 0;
let originalPosition = null;

// Update visibility of the suit squares grid
function updateGridVisibility() {
    const suitSquares = document.getElementById('suit-squares');
    if (!suitSquares) return;

    // If all suits are placed, hide the grid
    if (placedSuits.size === boatSections.length) {
        suitSquares.classList.add('empty');
    } else {
        suitSquares.classList.remove('empty');
    }
}

// Update the ready button state based on suit placement
function updateReadyButtonState() {
    const readyButton = document.getElementById('ready-button');
    if (!readyButton) return;

    // Only enable the ready button if all suits are placed
    const allSuitsPlaced = placedSuits.size === boatSections.length;
    readyButton.disabled = !allSuitsPlaced;
}

// Reset a square back to its original position
function resetSquarePosition(square) {
    if (originalPosition) {
        square.style.position = 'fixed';
        square.style.left = `${originalPosition.left}px`;
        square.style.top = `${originalPosition.top}px`;
        square.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            square.style.position = '';
            square.style.left = '';
            square.style.top = '';
        }, 300);
    }
    const readyButton = document.getElementById('ready-button');
    // Only enable the ready button if all suits are placed
    readyButton.disabled = true;
}

suitSquares.forEach(square => {
    square.addEventListener('touchstart', (e) => {
        // Prevent dragging if player is ready
        if (isReady) {
            e.preventDefault();
            return;
        }

        isDragging = true;
        currentSquare = square;
        
        const touch = e.touches[0];
        const rect = square.getBoundingClientRect();
        
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
        
        // Store original position if not already stored
        if (!originalPosition) {
            originalPosition = {
                left: rect.left,
                top: rect.top
            };
        }

        // Create visual feedback
        square.style.transition = 'none';
        square.style.zIndex = '1000';
        square.style.opacity = '0.8';
    });

    square.addEventListener('touchmove', (e) => {
        if (!isDragging || !currentSquare) return;
        e.preventDefault(); // Prevent scrolling

        const touch = e.touches[0];
        
        // Calculate new position
        const newX = touch.clientX - offsetX;
        const newY = touch.clientY - offsetY;

        // Move the square
        currentSquare.style.position = 'fixed';
        currentSquare.style.left = `${newX}px`;
        currentSquare.style.top = `${newY}px`;

        // Find the closest boat section
        const squareRect = currentSquare.getBoundingClientRect();
        const squareCenter = {
            x: squareRect.left + squareRect.width / 2,
            y: squareRect.top + squareRect.height / 2
        };
        
        let closestSection = null;
        let minDistance = Infinity;
        
        boatSections.forEach(section => {
            const sectionRect = section.getBoundingClientRect();
            const sectionCenter = {
                x: sectionRect.left + sectionRect.width / 2,
                y: sectionRect.top + sectionRect.height / 2
            };
            
            const distance = Math.hypot(
                squareCenter.x - sectionCenter.x,
                squareCenter.y - sectionCenter.y
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestSection = section;
            }
            
            // Reset opacity for all sections
            section.style.opacity = '1';
        });
        
        // Only highlight the closest section if it's within a reasonable distance
        if (minDistance < 100) { // Adjust this threshold as needed
            closestSection.style.opacity = '0.7';
        }
    });
});

// Handle touch end globally
document.addEventListener('touchend', (e) => {
    if (!isDragging || !currentSquare) return;

    const squareRect = currentSquare.getBoundingClientRect();
    let isPlaced = false;

    // Find the closest boat section for placement
    const squareCenter = {
        x: squareRect.left + squareRect.width / 2,
        y: squareRect.top + squareRect.height / 2
    };
    
    let closestSection = null;
    let minDistance = Infinity;
    let closestRect = null;
    
    boatSections.forEach(section => {
        const sectionRect = section.getBoundingClientRect();
        const sectionCenter = {
            x: sectionRect.left + sectionRect.width / 2,
            y: sectionRect.top + sectionRect.height / 2
        };
        
        const distance = Math.hypot(
            squareCenter.x - sectionCenter.x,
            squareCenter.y - sectionCenter.y
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            closestSection = section;
            closestRect = sectionRect;
        }
    });

    // Only place if within reasonable distance
    if (minDistance < 100) { // Adjust this threshold as needed
        isPlaced = true;
        const suit = currentSquare.dataset.suit;
        const targetSection = closestSection.id;

        // Handle swapping if section is occupied
        if (placedSuits.has(targetSection)) {
            const existingSuit = placedSuits.get(targetSection);
            const oldSquare = document.querySelector(`[data-suit="${existingSuit}"]`);
            
            // Find if the new suit was already placed somewhere
            let oldSection = null;
            for (const [section, placedSuit] of placedSuits.entries()) {
                if (placedSuit === suit) {
                    oldSection = section;
                    break;
                }
            }

            // Perform the swap
            if (oldSection) {
                // The new suit was somewhere else, so swap positions
                placedSuits.set(oldSection, existingSuit);
                const oldSectionElement = document.getElementById(oldSection);
                const oldRect = oldSectionElement.getBoundingClientRect();
                
                oldSquare.classList.add('placed');
                oldSquare.style.position = 'fixed';
                oldSquare.style.left = `${oldRect.left + (oldRect.width - oldSquare.offsetWidth) / 2}px`;
                oldSquare.style.top = `${oldRect.top + (oldRect.height - oldSquare.offsetHeight) / 2}px`;
            } else {
                // The new suit wasn't placed anywhere, so just move the old one back
                resetSquarePosition(oldSquare);
                oldSquare.classList.remove('placed');
            }
        }

        // Place the new suit
        placedSuits.set(targetSection, suit);
        currentSquare.classList.add('placed');
        currentSquare.style.position = 'fixed';
        currentSquare.style.left = `${closestRect.left + (closestRect.width - currentSquare.offsetWidth) / 2}px`;
        currentSquare.style.top = `${closestRect.top + (closestRect.height - currentSquare.offsetHeight) / 2}px`;
    }

    // If not placed on a boat section, return to original position
    if (!isPlaced) {
        resetSquarePosition(currentSquare);
        currentSquare.classList.remove('placed');
    }

    // Reset all boat sections opacity
    boatSections.forEach(section => {
        section.style.opacity = '1';
    });

    // Update grid visibility and ready button state
    //updateGridVisibility();
    updateReadyButtonState();

    // Reset dragging state
    currentSquare.style.zIndex = '1';
    currentSquare.style.opacity = '1';
    currentSquare.style.transition = 'all 0.3s ease';
    isDragging = false;
    currentSquare = null;
});









