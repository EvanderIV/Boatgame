
let SKIN_COUNT = 5;

function playOneShot(url) {
	new Audio(url).play();
}

var cookies = document.cookie
	.split(';')
	.map(cookie => cookie.split('='))
	.reduce((accumulator, [key, value]) =>
	({ ...accumulator, [key.trim()]: decodeURIComponent(value) }),
{});
let skin = 0;
if (document.cookie.includes("cosmetic")) {
	skin = cookies.cosmetic;
	document.getElementById("skin-id").innerHTML = "Skin #" + skin;
	document.getElementById("boat_ur").src = './img/boat_' + skin + '_ur.png';
			let newEvent = createEvent(e.name, e.location, e.description, e.ear, e.month, e.day, e.startHour, e.startMinute, e.endHour, e.endMinute);
	document.getElementById("boat_ul").src = './img/boat_' + skin + '_ul.png';
	document.getElementById("boat_ll").src = './img/boat_' + skin + '_ll.png';
	document.getElementById("boat_lr").src = './img/boat_' + skin + '_lr.png';
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

/*
var Interval = window.setInterval(updateGamestate, 10);

function updateGamestate() {
	
}
*/

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
settingsBtn.addEventListener('click', function(event) {
	if (settingsOpen) {
		document.getElementById("settings-close-sfx").play();
		settingsBtn.style.top = "90%";
		settingsDiv.style.top = "100%";
		settingsOpen = false;
	}
	else {
		document.getElementById("settings-open-sfx").play();
		settingsBtn.style.top = "65%";
		settingsDiv.style.top = "75%";
		settingsOpen = true;
	}
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
	skin++;
	if (skin >= SKIN_COUNT) {
		skin = 0;
	}
	document.cookie = "cosmetic=" + skin;
	document.getElementById("skin-id").innerHTML = "Skin #" + skin;
	document.getElementById("boat_ur").src = './img/boat_' + skin + '_ur.png';
	document.getElementById("boat_ul").src = './img/boat_' + skin + '_ul.png';
	document.getElementById("boat_ll").src = './img/boat_' + skin + '_ll.png';
	document.getElementById("boat_lr").src = './img/boat_' + skin + '_lr.png';
});

let backSkin = document.getElementById("skin-back");
backSkin.addEventListener('click', function(event) {
	skin--;
	if (skin < 0) {
		skin = SKIN_COUNT - 1;
	}
	document.cookie = "cosmetic=" + skin;
	document.getElementById("skin-id").innerHTML = "Skin #" + skin;
	document.getElementById("boat_ur").src = './img/boat_' + skin + '_ur.png';
	document.getElementById("boat_ul").src = './img/boat_' + skin + '_ul.png';
	document.getElementById("boat_ll").src = './img/boat_' + skin + '_ll.png';
	document.getElementById("boat_lr").src = './img/boat_' + skin + '_lr.png';
});







