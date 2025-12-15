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

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!data.daily.medicationsTaken[med.id];

    checkbox.onclick = e => {
      e.stopPropagation();
      data.daily.medicationsTaken[med.id] = checkbox.checked;
      saveData(data);
    };

    li.appendChild(checkbox);
    li.append(" " + med.name);

    li.onclick = () => openModal("medication", med);

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

function startTimer(duration) {
  let time = duration;

  timerInterval = setInterval(() => {
    time--;
    timerDisplay.textContent = time + "s";

    if (time <= 0) {
      clearInterval(timerInterval);
      timerFinished = true;
      timerDisplay.textContent = "0s";
      timerDoneText.classList.remove("hidden");
      timerFinishBtn.classList.remove("hidden");
    }
  }, 1000);
}



function renderExercises() {
  exerciseList.innerHTML = "";

  data.exercises.forEach(ex => {
    const li = document.createElement("li");

    const left = document.createElement("div");
    left.textContent = `${ex.name} (${ex.duration}s)`;

    const counter = document.createElement("span");
    counter.className = "timer";
    counter.textContent =
        (data.daily.exercisesDone[ex.id] || 0) + "×";

    const startBtn = document.createElement("button");
    startBtn.textContent = "Start";
    startBtn.className = "secondary";
    startBtn.style.width = "auto";

    startBtn.onclick = e => {
      e.stopPropagation();
      openTimerModal(ex);
    };

    li.append(left, counter, startBtn);

    li.onclick = () => openModal("exercise", ex);

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

const modalBackdrop = document.getElementById("modal-backdrop");
const modalTitle = document.getElementById("modal-title");
const editBtn = document.getElementById("edit-btn");
const deleteBtn = document.getElementById("delete-btn");
const closeBtn = document.getElementById("close-btn");

let activeItem = null;
let activeType = null;

function openModal(type, item) {
  activeType = type;
  activeItem = item;

  modalTitle.textContent = item.name;
  modalBackdrop.classList.remove("hidden");
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
  activeItem = null;
  activeType = null;
}

closeBtn.addEventListener("click", closeModal);

modalBackdrop.addEventListener("click", closeModal);

editBtn.onclick = () => {
  if (!activeItem) return;

  const newName = prompt("Name:", activeItem.name);
  if (!newName) return;

  activeItem.name = newName;

  if (activeType === "exercise") {
    const newDuration = parseInt(
        prompt("Dauer (Sekunden):", activeItem.duration),
        10
    );
    if (newDuration > 0) {
      activeItem.duration = newDuration;
    }
  }

  saveData(data);
  renderMedications();
  renderExercises();
  closeModal();
};

deleteBtn.onclick = () => {
  if (!activeItem) return;

  if (!confirm("Wirklich löschen?")) return;

  if (activeType === "medication") {
    data.medications = data.medications.filter(m => m.id !== activeItem.id);
    delete data.daily.medicationsTaken[activeItem.id];
  }

  if (activeType === "exercise") {
    data.exercises = data.exercises.filter(e => e.id !== activeItem.id);
    delete data.daily.exercisesDone[activeItem.id];
  }

  saveData(data);
  renderMedications();
  renderExercises();
  closeModal();
};

const timerBackdrop = document.getElementById("timer-backdrop");
const timerTitle = document.getElementById("timer-title");
const timerDisplay = document.getElementById("timer-display");
const timerDoneText = document.getElementById("timer-done-text");
const timerCloseBtn = document.getElementById("timer-close-btn");
const timerFinishBtn = document.getElementById("timer-finish-btn");

let timerInterval = null;
let timerFinished = false;
let activeExercise = null;

function openTimerModal(exercise) {
  activeExercise = exercise;
  timerFinished = false;

  timerTitle.textContent = exercise.name;
  timerDisplay.textContent = exercise.duration + "s";
  timerDoneText.classList.add("hidden");
  timerFinishBtn.classList.add("hidden");

  timerBackdrop.classList.remove("hidden");

  startTimer(exercise.duration);
}

function closeTimerModal(countExercise) {
  clearInterval(timerInterval);
  timerInterval = null;

  if (countExercise && timerFinished && activeExercise) {
    data.daily.exercisesDone[activeExercise.id] =
        (data.daily.exercisesDone[activeExercise.id] || 0) + 1;
    saveData(data);
    renderExercises();
  }

  timerBackdrop.classList.add("hidden");
  activeExercise = null;
}

timerCloseBtn.onclick = () => {
  closeTimerModal(false);
};

timerFinishBtn.onclick = () => {
  closeTimerModal(true);
};

timerBackdrop.onclick = () => {
  closeTimerModal(false);
};



/* ---------- Initial Render ---------- */
renderMedications();
renderExercises();
