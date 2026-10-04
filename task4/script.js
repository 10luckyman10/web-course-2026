const LENGTH = 4;

let secretNumber = [];
let attempts = 0;
let history = [];
let isGameOver = false;

const guessInput = document.getElementById('guessInput');
const checkBtn = document.getElementById('checkBtn');
const newGameBtn = document.getElementById('newGameBtn');
const messageEl = document.getElementById('message');
const attemptsCountEl = document.getElementById('attemptsCount');
const historyListEl = document.getElementById('historyList');

function generateSecretNumber() {
    const digits = [];
    while (digits.length < LENGTH) {
        const randomDigit = Math.floor(Math.random() * 10);
        if (!digits.includes(randomDigit)) {
            digits.push(randomDigit);
        }
    }
    return digits;
}

function validateInput(inputString) {
    if (inputString.length !== LENGTH) {
        return { isValid: false, error: `Нужно ввести ровно ${LENGTH} цифры.` };
    }
    if (!/^\d+$/.test(inputString)) {
        return { isValid: false, error: 'Можно вводить только цифры.' };
    }
    const digits = inputString.split('').map(Number);
    const uniqueDigits = new Set(digits);
    if (uniqueDigits.size !== LENGTH) {
        return { isValid: false, error: 'Цифры не должны повторяться.' };
    }
    return { isValid: true, error: '', digits: digits };
}

function countBullsAndCows(secret, guess) {
    let bulls = 0;
    let cows = 0;

    for (let i = 0; i < LENGTH; i++) {
        if (guess[i] === secret[i]) {
            bulls++;
        } else if (secret.includes(guess[i])) {
            cows++;
        }
    }
    return { bulls, cows };
}


function renderHistory() {
    historyListEl.innerHTML = '';

    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.guess} → ${item.bulls} бык., ${item.cows} кор.`;
        historyListEl.appendChild(li);
    });

    historyListEl.scrollTop = historyListEl.scrollHeight;
}

function updateAttemptsDisplay() {
    attemptsCountEl.textContent = attempts;
}

function showMessage(text, isError = false, isSuccess = false) {
    messageEl.textContent = text;
    messageEl.className = 'message';
    if (isError) messageEl.classList.add('error');
    if (isSuccess) messageEl.classList.add('success');
}


function handleCheck() {
    if (isGameOver) return;

    const inputValue = guessInput.value.trim();
    const validation = validateInput(inputValue);

    if (!validation.isValid) {
        showMessage(validation.error, true);
        return;
    }

    showMessage('');

    const guessDigits = validation.digits;
    const result = countBullsAndCows(secretNumber, guessDigits);

    attempts++;
    history.push({
        guess: inputValue,
        bulls: result.bulls,
        cows: result.cows
    });

    updateAttemptsDisplay();
    renderHistory();

    guessInput.value = '';
    guessInput.focus();

    if (result.bulls === LENGTH) {
        isGameOver = true;
        showMessage(`Победа! Угадано за ${attempts} попыток`, false, true);
        guessInput.disabled = true;
        checkBtn.disabled = true;
    }
}

function startNewGame() {
    secretNumber = generateSecretNumber();
    attempts = 0;
    history = [];
    isGameOver = false;

    guessInput.disabled = false;
    checkBtn.disabled = false;
    guessInput.value = '';
    showMessage('');
    updateAttemptsDisplay();
    renderHistory();
    guessInput.focus();
}


checkBtn.addEventListener('click', handleCheck);
newGameBtn.addEventListener('click', startNewGame);

guessInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleCheck();
    }
});

startNewGame();