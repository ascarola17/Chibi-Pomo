import { addXp, lowerXp } from "./exp.js";
//TIMER

const startBtn = document.querySelector("#startbtn");
const stopBtn = document.querySelector("#pausebtn");
const timerResetBtn = document.getElementById("timer-resetbtn"); // New selector
const progressbar = document.querySelector(".progressbar");
const progressbarNumber = document.querySelector(".progressbar .progressbar-number");
const pomodoroBtn = document.getElementById("pomodorobtn");
const shortbrkBtn = document.getElementById("shortbrkbtn");
const longbrkBtn = document.getElementById("longbrkbtn");
//const pomCount = document.querySelector(".pomdoro-count");
let pomdoroCount = 0;

const pomodorountilLongbrk = 4;
const pomodorotimer = 1500; /* 25 minutes*/
const shortbreaktimer = 300; /* 5 minutes*/
const longbreaktimer = 900; /* 20 minutes*/
let timerValue = pomodorotimer;
let multipliervalue = 360 / timerValue;
let progressInterval;
let pomodoroType = "POMODORO";

const increaseTimeBtn = document.getElementById("increase-time");
const decreaseTimeBtn = document.getElementById("decrease-time");

const pomCount = document.createElement("div"); // For Pomodoro Count

let pauseCountdown = 30;
let pauseInterval;

let pomodoroCount = 0;
const pomodorosUntilLongBreak = 4;
let currentXP = 0;
const xpPerSession = 10;
const xpToLevelUp = 100;


// Pause Message Elements
const pauseMessage = document.getElementById("pause-message");
const pauseCountdownDisplay = document.getElementById("pause-countdown");
const resumeBtn = document.getElementById("resume-btn");

startBtn.addEventListener("click", () => {
  startTimer();
});
stopBtn.addEventListener("click", () => {
  pauseTimer();
});
pomodoroBtn.addEventListener("click", () => {
  setTimeType("POMODORO");
});
shortbrkBtn.addEventListener("click", () => {
  setTimeType("SHORTBREAK");
});
longbrkBtn.addEventListener("click", () => {
  setTimeType("LONGBREAK");
});

timerResetBtn.addEventListener("click", () => {
  console.log("Reset button clicked!"); // Debug log
  resetTimer();
});

resumeBtn.addEventListener("click", () => {
  startTimer();
});

increaseTimeBtn.addEventListener("click", () => {
  adjustTimer(60); 
});
decreaseTimeBtn.addEventListener("click", () => {
  adjustTimer(-60); 
});

export function startTimer() {
  if (progressInterval) {
    return; // Prevent multiple intervals
  }

  // Clear pause countdown if resuming
  if (pauseInterval) {
    clearInterval(pauseInterval);
    pauseInterval = null;
    pauseMessage.style.display = "none";
  }

  progressInterval = setInterval(() => {
    timerValue--;
    setProgressInfo();

    if (timerValue <= 0) {
      clearInterval(progressInterval);
      progressInterval = null;
      handlePomodoroCompletion();
    }
  }, 1000);
}




function setProgressInfo() {
  console.log(`Updating display: ${NumbertoString(timerValue)}`);
  progressbarNumber.textContent = `${NumbertoString(timerValue)}`;
  progressbar.style.background = `conic-gradient(rgb(243, 72, 109) ${
    timerValue * multipliervalue
  }deg,black 0deg)`;
}


function NumbertoString(number) {
  const minutes = Math.trunc(number / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.trunc(number % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

let pauseTimeout;

function pauseTimer() {
  clearInterval(progressInterval);
  progressInterval = null;

  // Display pause message
  pauseCountdown = 30; // Reset countdown
  pauseMessage.style.display = "block";
  updatePauseCountdown();

  // Start the countdown interval
  pauseInterval = setInterval(() => {
    pauseCountdown--;
    updatePauseCountdown();

    if (pauseCountdown <= 0) {
      clearInterval(pauseInterval);
      pauseInterval = null;
      pauseMessage.style.display = "none";
      alert("You didn't come back in time. Progress lost!");
      resetTimer();
      pomodoroCount = 0; // Reset progress
      currentXP = Math.max(0, currentXP - xpPerSession); // Penalize XP
      lowerXp(xpPerSession); // Call function to lose XP
    }
  }, 1000);
}

function updatePauseCountdown() {
  pauseCountdownDisplay.textContent = pauseCountdown;
}


function setTimeType(type) {
  pomodoroType = type;
  if (type === "POMODORO") {
    pomodoroBtn.classList.add("active");
    shortbrkBtn.classList.remove("active");
    longbrkBtn.classList.remove("active");
  } else if (type === "SHORTBREAK") {
    pomodoroBtn.classList.remove("active");
    shortbrkBtn.classList.add("active");
    longbrkBtn.classList.remove("active");
  } else {
    pomodoroBtn.classList.remove("active");
    shortbrkBtn.classList.remove("active");
    longbrkBtn.classList.add("active");
  }
  resetTimer();
}

function resetTimer() {
  // Stop the timer interval
  clearInterval(progressInterval);
  progressInterval = null; // Clear the interval reference

  // Reset timer value to the default for the current mode
  timerValue =
    pomodoroType === "POMODORO"
      ? pomodorotimer
      : pomodoroType === "SHORTBREAK"
      ? shortbreaktimer
      : longbreaktimer;

  // Recalculate the multiplier for progress bar
  multipliervalue = 360 / timerValue;

  // Update the progress bar and display immediately
  setProgressInfo();
  progressbarNumber.textContent = NumbertoString(timerValue);

  console.log(`Timer reset to: ${NumbertoString(timerValue)}`);
}

function adjustTimer(amount) {
  timerValue += amount;
  if (timerValue < 0) timerValue = 0; // Prevent negative timer
  multipliervalue = 360 / timerValue;
  setProgressInfo();
  console.log(`Timer adjusted to: ${timerValue}`);
}

function handlePomodoroCompletion() {
  if (pomodoroType === "POMODORO") {
    pomodoroCount++;
    addXp(xpPerSession); // Call function to gain XP
    if (pomodoroCount % pomodorosUntilLongBreak === 0) {
      setTimeType("LONGBREAK");
    } else {
      setTimeType("SHORTBREAK");
    }
  } else {
    setTimeType("POMODORO");
  }
  resetTimer();
  startTimer(); // Automatically start the next session
}


// function gainXP() {
//   currentXP += xpPerSession;
//   if (currentXP >= xpToLevelUp) {
//     currentXP -= xpToLevelUp;
//     // Optionally, increase level or handle leveling up
//   }
//   updateXPBar();
// }
// function updateXPBar() {
//   const xpFill = document.querySelector(".xp-bar-fill");
//   const xpDisplay = document.getElementById("xp-display");
//   const xpTotal = document.getElementById("xp-total");

//   const xpPercentage = (currentXP / xpToLevelUp) * 100;
//   xpFill.style.width = `${xpPercentage}%`;
//   xpDisplay.textContent = currentXP;
//   xpTotal.textContent = xpToLevelUp;
// }
