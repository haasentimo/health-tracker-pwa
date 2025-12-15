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

    const left = document.createElement("div");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!data.daily.medicationsTaken[med.id];

    checkbox.addEventListener("change", () => {
      data.daily.medicationsTaken[med.id] = checkbox.checked;
      saveData(data);
    });

    left.appendChild(checkbox);
    left.append(" " + med.name);

    const actions = document.createElement("div");

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.className = "secondary";
    editBtn.style.width = "auto";

    editBtn.onclick = () => {
      const newName = prompt("Name bearbeiten:", med.name);
      if (newName) {
        med.name = newName;
        saveData(data);
        renderMedications();
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.style.width = "auto";

    deleteBtn.onclick = () => {
      if (confirm("Medikament löschen?")) {
        data.medications = data.medications.filter(m => m.id !== med.id);
        delete data.daily.medicationsTaken[med.id];
        saveData(data);
        renderMedications();
      }
    };

    actions.append(editBtn, deleteBtn);
    li.append(left, actions);
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

function startTimer(duration, onFinish) {
  let time = duration;

  const interval = setInterval(() => {
    if (--time <= 0) {
      clearInterval(interval);
      alert("Fertig 🎉");
      onFinish();
    }
  }, 1000);
}


function renderExercises() {
  exerciseList.innerHTML = "";

  data.exercises.forEach(ex => {
    const li = document.createElement("li");

    const name = document.createElement("span");
    name.textContent = `${ex.name} (${ex.duration}s)`;

    const counter = document.createElement("span");
    counter.className = "timer";
    counter.textContent =
        (data.daily.exercisesDone[ex.id] || 0) + "×";

    const startBtn = document.createElement("button");
    startBtn.textContent = "Start";
    startBtn.className = "secondary";
    startBtn.style.width = "auto";

    startBtn.onclick = () => {
      startTimer(ex.duration, () => {
        data.daily.exercisesDone[ex.id] =
            (data.daily.exercisesDone[ex.id] || 0) + 1;
        saveData(data);
        renderExercises();
      });
    };

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.style.width = "auto";

    editBtn.onclick = () => {
      const newName = prompt("Name:", ex.name);
      const newDuration = parseInt(
          prompt("Dauer (Sekunden):", ex.duration),
          10
      );

      if (newName && newDuration > 0) {
        ex.name = newName;
        ex.duration = newDuration;
        saveData(data);
        renderExercises();
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.style.width = "auto";

    deleteBtn.onclick = () => {
      if (confirm("Übung löschen?")) {
        data.exercises = data.exercises.filter(e => e.id !== ex.id);
        delete data.daily.exercisesDone[ex.id];
        saveData(data);
        renderExercises();
      }
    };

    li.append(name, counter, startBtn, editBtn, deleteBtn);
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
