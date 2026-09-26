// Массив задач 
let tasks = [];
let nextId = 1;
let currentFilter = 'all';

// Ссылки на DOM-элементы
const form = document.getElementById('add-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const counter = document.getElementById('counter');
const filtersBox = document.getElementById('filters');

// --- Добавление задачи ---
function addTask(text) {
    text = text.trim();
    if (text === '') {
        alert('Введите текст задачи!');
        return;
    }
    tasks.push({ id: nextId++, text: text, completed: false });
    render();
}

form.addEventListener('submit', function (e) {
    e.preventDefault(); // Enter 
    addTask(input.value);
    input.value = '';
    input.focus();
});

// --- Изменение статуса ---
function toggleTask(id) {
    tasks = tasks.map(function (task) {
        if (task.id === id) {
            return { id: task.id, text: task.text, completed: !task.completed };
        }
        return task;
    });
    render();
}

// --- Удаление ---
function deleteTask(id) {
    tasks = tasks.filter(function (task) {
        return task.id !== id;
    });
    render();
}

// --- Фильтрация ---
function getVisibleTasks() {
    if (currentFilter === 'active') {
        return tasks.filter(function (t) { return !t.completed; });
    }
    if (currentFilter === 'completed') {
        return tasks.filter(function (t) { return t.completed; });
    }
    return tasks;
}

// --- Рендер ---
function render() {
    // 1. Очищает список
    list.innerHTML = '';

    // 2. Рисует видимые задачи через map
    const visible = getVisibleTasks();
    const items = visible.map(function (task) {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.completed ? ' completed' : '');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', function () {
            toggleTask(task.id);
        });

        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = task.text;

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = 'Удалить';
        delBtn.addEventListener('click', function () {
            deleteTask(task.id);
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(delBtn);
        return li;
    });

    items.forEach(function (li) {
        list.appendChild(li);
    });

    // 3. Счётчик (по всем задачам)
    const done = tasks.filter(function (t) { return t.completed; }).length;
    const left = tasks.length - done;
    counter.textContent = 'Осталось: ' + left + ', Выполнено: ' + done;

    // 4. Подсветка активного фильтра
    const buttons = filtersBox.querySelectorAll('.filter-btn');
    buttons.forEach(function (btn) {
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// --- Фильтры ---
filtersBox.addEventListener('click', function (e) {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    currentFilter = btn.dataset.filter;
    render();
});

// Первый рендер
render();