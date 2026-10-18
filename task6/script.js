(function () {
    'use strict';

    const CONFIG = Object.freeze({
        CELL_SIZE: 30,
        COLS: 20,
        ROWS: 20,
        INITIAL_LENGTH: 3,
        MOVE_INTERVAL_MS: 150,
        COLORS: Object.freeze({
            background: '#0f1317',
            grid: '#2a333d',
            gridAccent: '#3a4552',
            snakeHead: '#7fd67f',
            snakeBody: '#4caf50',
            apple: '#e74c3c',
            gameOverOverlay: 'rgba(0, 0, 0, 0.65)',
            gameOverText: '#ffffff',
            winOverlay: 'rgba(20, 60, 20, 0.72)',
            winText: '#eaffea',
        }),
    });

    const DIRECTION = Object.freeze({
        UP: Object.freeze({ x: 0, y: -1 }),
        DOWN: Object.freeze({ x: 0, y: 1 }),
        LEFT: Object.freeze({ x: -1, y: 0 }),
        RIGHT: Object.freeze({ x: 1, y: 0 }),
    });

    class SnakeModel {
        constructor(config) {
            this.config = config;
            this.reset();
        }

        reset() {
            const centerX = Math.floor(this.config.COLS / 2);
            const centerY = Math.floor(this.config.ROWS / 2);

            this.snake = [
                { x: centerX, y: centerY },
                { x: centerX - 1, y: centerY },
                { x: centerX - 2, y: centerY },
            ];

            this.direction = DIRECTION.RIGHT;
            this.pendingDirection = null;
            this.apple = this.spawnApple();
            this.score = 0;
            this.isGameOver = false;
            this.isWin = false;
            this.isRunning = false;
        }

        start() {
            this.reset();
            this.isRunning = true;
        }

        stop() {
            this.isRunning = false;
        }

        spawnApple() {
            const { COLS, ROWS } = this.config;
            const occupied = new Set(this.snake.map((s) => `${s.x}:${s.y}`));
            const free = [];

            for (let y = 0; y < ROWS; y++) {
                for (let x = 0; x < COLS; x++) {
                    if (!occupied.has(`${x}:${y}`)) free.push({ x, y });
                }
            }

            if (free.length === 0) return null;
            return free[Math.floor(Math.random() * free.length)];
        }

        requestDirection(nextDir) {
            if (!nextDir) return;

            const current = this.direction;
            if (nextDir.x === -current.x && nextDir.y === -current.y) return;

            this.pendingDirection = nextDir;
        }

        step() {
            if (!this.isRunning || this.isGameOver || this.isWin) return 'none';

            if (this.pendingDirection) {
                this.direction = this.pendingDirection;
                this.pendingDirection = null;
            }

            const head = this.snake[0];
            const newHead = {
                x: head.x + this.direction.x,
                y: head.y + this.direction.y,
            };

            if (this.checkCollision(newHead)) {
                this.isGameOver = true;
                this.isRunning = false;
                return 'dead';
            }

            this.snake.unshift(newHead);

            const ateApple =
                this.apple !== null &&
                newHead.x === this.apple.x &&
                newHead.y === this.apple.y;

            if (ateApple) {
                this.score += 1;
                this.apple = this.spawnApple();

                if (this.apple === null) {
                    this.isWin = true;
                    this.isRunning = false;
                    return 'win';
                }
                return 'ate';
            }

            this.snake.pop();
            return 'none';
        }

        checkCollision(point) {
            const { COLS, ROWS } = this.config;

            if (point.x < 0 || point.y < 0 || point.x >= COLS || point.y >= ROWS) {
                return true;
            }

            return this.snake.some((seg) => seg.x === point.x && seg.y === point.y);
        }

        getState() {
            return {
                snake: this.snake,
                apple: this.apple,
                score: this.score,
                isGameOver: this.isGameOver,
                isWin: this.isWin,
                isRunning: this.isRunning,
            };
        }
    }

    class SnakeView {
        constructor(canvas, config, dom) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.config = config;
            this.dom = dom;
        }

        render(state) {
            this.clear();
            this.drawGrid();
            this.drawApple(state.apple);
            this.drawSnake(state.snake);

            if (state.isGameOver) {
                this.drawGameOver(state.score);
            } else if (state.isWin) {
                this.drawWin(state.score);
            }
        }

        updateHud(state, phase) {
            this.dom.score.textContent = String(state.score);

            if (phase === 'idle') {
                this.dom.status.textContent = 'Нажмите «Старт»';
            } else if (phase === 'running') {
                this.dom.status.textContent = 'Игра идёт…';
            } else if (phase === 'over') {
                this.dom.status.textContent = `Игра окончена. Счёт: ${state.score}`;
            } else if (phase === 'won') {
                this.dom.status.textContent = `Победа! Счёт: ${state.score}`;
            }

            const running = phase === 'running';
            this.dom.startBtn.disabled = running;
            this.dom.restartBtn.disabled = !(phase === 'over' || phase === 'won');
        }

        clear() {
            const { ctx, canvas } = this;
            ctx.fillStyle = this.config.COLORS.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        drawGrid() {
            const { ctx } = this;
            const { CELL_SIZE, COLS, ROWS, COLORS } = this.config;

            const w = COLS * CELL_SIZE;
            const h = ROWS * CELL_SIZE;

            ctx.save();
            ctx.lineCap = 'butt';

            ctx.strokeStyle = COLORS.gridAccent;
            ctx.lineWidth = 2;

            for (let x = 1; x < COLS; x++) {
                const px = Math.floor(x * CELL_SIZE) + 0.5;
                ctx.beginPath();
                ctx.moveTo(px, 0);
                ctx.lineTo(px, h);
                ctx.stroke();
            }
            for (let y = 1; y < ROWS; y++) {
                const py = Math.floor(y * CELL_SIZE) + 0.5;
                ctx.beginPath();
                ctx.moveTo(0, py);
                ctx.lineTo(w, py);
                ctx.stroke();
            }

            ctx.strokeStyle = COLORS.grid;
            ctx.lineWidth = 1;

            for (let x = 1; x < COLS; x++) {
                const px = Math.floor(x * CELL_SIZE) + 0.5;
                ctx.beginPath();
                ctx.moveTo(px, 0);
                ctx.lineTo(px, h);
                ctx.stroke();
            }
            for (let y = 1; y < ROWS; y++) {
                const py = Math.floor(y * CELL_SIZE) + 0.5;
                ctx.beginPath();
                ctx.moveTo(0, py);
                ctx.lineTo(w, py);
                ctx.stroke();
            }

            ctx.restore();
        }

        drawSnake(snake) {
            const { ctx } = this;
            const { CELL_SIZE, COLORS } = this.config;
            const pad = 2;

            snake.forEach((seg, i) => {
                ctx.fillStyle = i === 0 ? COLORS.snakeHead : COLORS.snakeBody;
                ctx.fillRect(
                    seg.x * CELL_SIZE + pad,
                    seg.y * CELL_SIZE + pad,
                    CELL_SIZE - pad * 2,
                    CELL_SIZE - pad * 2
                );
            });
        }

        drawApple(apple) {
            if (!apple) return;

            const { ctx } = this;
            const { CELL_SIZE, COLORS } = this.config;
            const cx = apple.x * CELL_SIZE + CELL_SIZE / 2;
            const cy = apple.y * CELL_SIZE + CELL_SIZE / 2;

            ctx.fillStyle = COLORS.apple;
            ctx.beginPath();
            ctx.arc(cx, cy, CELL_SIZE / 2 - 3, 0, Math.PI * 2);
            ctx.fill();
        }

        drawGameOver(score) {
            const { ctx, canvas } = this;
            const { COLORS } = this.config;

            ctx.fillStyle = COLORS.gameOverOverlay;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = COLORS.gameOverText;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.font = 'bold 28px system-ui, sans-serif';
            ctx.fillText('Игра окончена', canvas.width / 2, canvas.height / 2 - 20);

            ctx.font = '18px system-ui, sans-serif';
            ctx.fillText(`Счёт: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        }

        drawWin(score) {
            const { ctx, canvas } = this;
            const { COLORS } = this.config;

            ctx.fillStyle = COLORS.winOverlay;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = COLORS.winText;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.font = 'bold 30px system-ui, sans-serif';
            ctx.fillText('Победа!', canvas.width / 2, canvas.height / 2 - 24);

            ctx.font = '18px system-ui, sans-serif';
            ctx.fillText(
                `Поле заполнено. Счёт: ${score}`,
                canvas.width / 2,
                canvas.height / 2 + 16
            );
        }
    }

    class SnakeController {
        constructor(model, view) {
            this.model = model;
            this.view = view;

            this.rafId = null;
            this.lastMoveTime = 0;
            this.lastFrameTime = 0;
            this.phase = 'idle';

            this.boundLoop = this.loop.bind(this);
            this.boundKeyDown = this.handleKeyDown.bind(this);

            this.bindEvents();
            this.renderFrame();
            this.view.updateHud(this.model.getState(), this.phase);
        }

        bindEvents() {
            window.addEventListener('keydown', this.boundKeyDown);
            this.view.dom.startBtn.addEventListener('click', () => this.startGame());
            this.view.dom.restartBtn.addEventListener('click', () => this.startGame());
        }

        handleKeyDown(event) {
            if (this.phase !== 'running') return;

            const map = {
                ArrowUp: DIRECTION.UP,
                ArrowDown: DIRECTION.DOWN,
                ArrowLeft: DIRECTION.LEFT,
                ArrowRight: DIRECTION.RIGHT,
            };

            const dir = map[event.key];
            if (!dir) return;

            event.preventDefault();
            this.model.requestDirection(dir);
        }

        startGame() {
            this.stopLoop();
            this.model.start();
            this.phase = 'running';

            const now = performance.now();
            this.lastFrameTime = now;
            this.lastMoveTime = now;

            this.view.updateHud(this.model.getState(), this.phase);
            this.renderFrame();

            this.rafId = requestAnimationFrame(this.boundLoop);
        }

        stopLoop() {
            if (this.rafId !== null) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        }

        loop(now) {
            this.update(now);
            this.renderFrame();

            if (this.phase === 'running') {
                this.rafId = requestAnimationFrame(this.boundLoop);
            }
        }

        update(now) {
            if (this.phase !== 'running') return;

            if (now - this.lastMoveTime >= this.model.config.MOVE_INTERVAL_MS) {
                this.lastMoveTime = now;

                const result = this.model.step();

                if (result === 'ate' || result === 'none') {
                    this.view.updateHud(this.model.getState(), this.phase);
                }

                if (result === 'dead') {
                    this.finishGame('over');
                } else if (result === 'win') {
                    this.finishGame('won');
                }
            }
        }

        finishGame(phase) {
            this.phase = phase;
            this.stopLoop();
            this.view.updateHud(this.model.getState(), this.phase);
            this.renderFrame();
        }

        renderFrame() {
            this.view.render(this.model.getState());
        }
    }

    function bootstrap() {
        const canvas = document.getElementById('board');
        if (!canvas) return;

        const dom = {
            score: document.getElementById('score'),
            status: document.getElementById('status'),
            startBtn: document.getElementById('startBtn'),
            restartBtn: document.getElementById('restartBtn'),
        };

        const model = new SnakeModel(CONFIG);
        const view = new SnakeView(canvas, CONFIG, dom);

        new SnakeController(model, view);
    }

    document.addEventListener('DOMContentLoaded', bootstrap);
})();