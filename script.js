const DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getState() {
  return JSON.parse(localStorage.getItem('habitState') || '{"habits":[],"done":{}}');
}

function saveState(state) {
  localStorage.setItem('habitState', JSON.stringify(state));
}

function render() {
  const state = getState();
  const today = todayKey();
  const donesToday = state.done[today] || [];

  // Дата вверху
  document.getElementById('today-date').textContent = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  // Список привычек
  const list = document.getElementById('habits-list');
  if (state.habits.length === 0) {
    list.innerHTML = '<p class="empty-state">Добавь первую привычку выше ↑</p>';
  } else {
    list.innerHTML = state.habits.map((habit, i) => {
      const isDone = donesToday.includes(i);
      return `
        <div class="habit-item">
          <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleHabit(${i})" />
          <span class="habit-name ${isDone ? 'done' : ''}">${habit}</span>
          <button class="delete-btn" onclick="deleteHabit(${i})">✕</button>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${isDone ? 100 : 0}%"></div>
        </div>
      `;
    }).join('');
  }

  // Неделя
  renderWeek(state);
}

function renderWeek(state) {
  const grid = document.getElementById('week-grid');
  const today = new Date();

  // Начало недели (понедельник)
  const startOfWeek = new Date(today);
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(today.getDate() + diff);

  grid.innerHTML = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const isToday = key === todayKey();
    const done = (state.done[key] || []).length;
    const total = state.habits.length;
    const allDone = total > 0 && done === total;
    const hasDone = done > 0;

    let dotClass = 'day-dot';
    if (isToday) dotClass += ' today';
    else if (allDone) dotClass += ' all-done';
    else if (hasDone) dotClass += ' has-done';

    const dayName = DAYS[d.getDay()];

    return `
      <div class="week-day">
        <div class="day-name">${dayName}</div>
        <div class="${dotClass}">${d.getDate()}</div>
      </div>
    `;
  }).join('');
}

function addHabit() {
  const input = document.getElementById('habit-input');
  const name = input.value.trim();
  if (!name) return;

  const state = getState();
  state.habits.push(name);
  saveState(state);
  input.value = '';
  render();
}

function toggleHabit(index) {
  const state = getState();
  const today = todayKey();
  if (!state.done[today]) state.done[today] = [];

  const pos = state.done[today].indexOf(index);
  if (pos === -1) {
    state.done[today].push(index);
  } else {
    state.done[today].splice(pos, 1);
  }

  saveState(state);
  render();
}

function deleteHabit(index) {
  const state = getState();
  state.habits.splice(index, 1);

  // Пересчитываем индексы в done
  Object.keys(state.done).forEach(day => {
    state.done[day] = state.done[day]
      .filter(i => i !== index)
      .map(i => i > index ? i - 1 : i);
  });

  saveState(state);
  render();
}

// Enter для добавления привычки
document.getElementById('habit-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addHabit();
});

render();
