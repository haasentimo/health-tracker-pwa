/* ---------- Service Worker ---------- */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

/* ---------- Datum ---------- */
const todayStr = new Date().toISOString().split("T")[0];
document.getElementById("today").textContent = todayStr;

/* ---------- Storage ---------- */
function loadData() {
  const stored = JSON.parse(localStorage.getItem("trackerData"));

  if (!stored) {
    return createFreshData();
  }

  if (stored.date !== todayStr) {
    stored.date = todayStr;
    stored.daily = createDailyState();
    saveData(stored);
  }

  return stored;
}

function createFreshData() {
  const fresh = {
    date: todayStr,
    medications: [],
    exercises: [],
    daily: createDailyState()
  };
  saveData(fresh);
  return fresh;
}

function createDailyState() {
  return {
    medicationsTaken: {},
    exercisesDone: {}
  };
}

function saveData(data) {
  localStorage.setItem("trackerData", JSON.stringify(data));
}

let data = loadData();

/* ---------- Medikamente ---------- */
const medicationList = document.getElementById("medication-list");

function renderMedications() {
  medicationList.innerHTML = "";

  data.medications.forEach(med => {
    const li = document.createElement("li");

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = med.taken;

    checkbox.addEventListener("change", () => {
      med.taken = checkbox.checked;
      saveData(data);
    });

    label.appendChild(checkbox);
    label.append(" " + med.name);

    li.appendChild(label);
    medicationList.appendChild(li);
  });
}

document.getElementById("add-medication").addEventListener("click", () => {
  const name = prompt("Name des Medikaments:");
  if (!name) return;

  data.medications.push({
    id: Date.now(),
    name,
    taken: false
  });

  saveData(data);
  renderMedications();
});

/* ---------- Übungen ---------- */
const exerciseList = document.getElementById("exercise-list");

function startTimer(duration, display) {
  let time = duration;
  display.textContent = time + "s";

  const interval = setInterval(() => {
    time--;
    display.textContent = time + "s";

    if (time <= 0) {
      clearInterval(interval);
      display.textContent = "✔️";
      alert("Übung abgeschlossen 🎉");
    }
  }, 1000);
}

function renderExercises() {
  exerciseList.innerHTML = "";

  data.exercises.forEach(ex => {
    const li = document.createElement("li");

    const name = document.createElement("span");
    name.textContent = ex.name + " (" + ex.duration + "s)";

    const timer = document.createElement("span");
    timer.className = "timer";

    const button = document.createElement("button");
    button.textContent = "Start";
    button.className = "secondary";
    button.style.width = "auto";

    button.addEventListener("click", () => {
      startTimer(ex.duration, timer);
    });

    li.appendChild(name);
    li.appendChild(timer);
    li.appendChild(button);

    exerciseList.appendChild(li);
  });
}

document.getElementById("add-exercise").addEventListener("click", () => {
  const name = prompt("Name der Übung:");
  if (!name) return;

  const duration = parseInt(prompt("Dauer in Sekunden:"), 10);
  if (!duration || duration <= 0) return;

  data.exercises.push({
    id: Date.now(),
    name,
    duration
  });

  saveData(data);
  renderExercises();
});

/* ---------- Initial Render ---------- */
renderMedications();
renderExercises();
