// настройки и DOM 
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');

const GRID_SIZE = 20;         // размер одной клетки (20px)
const TILE_COUNT = 20;        // 400 / 20 = 20 клеток по ширине/высоте
const MOVE_INTERVAL = 150;    // время между шагами змейки в мс 
//  состояние игры 
let snake = [];
let direction = { x: 1, y: 0 };      // текущее направление (изначально вправо)
let nextDirection = { x: 1, y: 0 };  // буфер для нажатий клавиш
let apple = { x: 0, y: 0 };
let score = 0;
let isGameOver = false;
let lastMoveTime = 0;
let rafId = null;                    // id текущего кадра

function initGame() {
    // изначально 3 сегмента
    snake = [
        { x: 10, y: 10 }, // голова
        { x: 9, y: 10 },  
        { x: 8, y: 10 }   // хвост
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    isGameOver = false;
    scoreElement.textContent = score;
    
    spawnApple();
    
    lastMoveTime = performance.now();
    // если рестарт остановка старого цикла  и запускаем новый
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(gameLoop);
}

//  генерация яблока в свободной клетке 
function spawnApple() {
    let newApple;
    let isOccupied = true;

    while (isOccupied) {
        newApple = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
        //  не находится ли яблоко внутри змейки
        isOccupied = snake.some(segment => segment.x === newApple.x && segment.y === newApple.y);
    }
    
    apple = newApple;
}

// логика движения 
function moveSnake() {
    // применяем накопленное направление
    direction = { ...nextDirection };
    // вычисление новой головы
    const head = snake[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };
    // добавляет новую голову в начало массива
    snake.unshift(newHead);
    //  съели ли яблоко
    if (newHead.x === apple.x && newHead.y === apple.y) {
        score++;
        scoreElement.textContent = score;
        spawnApple();
    } else {
        // если не съел, удаляем последний сегмент (хвост)
        snake.pop();
    }
}

// проверка столкновений 
function checkCollision() {
    const head = snake[0];
    // столкновение со стеной
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        isGameOver = true;
        return;
    }
    // столкновение с собственным телом (начиная со 2 сегмента)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            isGameOver = true;
            return;
        }
    }
}

// обновление состояния 
function update(currentTime) {
    if (isGameOver) return;
    // проверяем, прошло ли достаточно времени с последнего шага
    if (currentTime - lastMoveTime >= MOVE_INTERVAL) {
        lastMoveTime = currentTime;
        moveSnake();
        checkCollision();
    }
}

// сетка из клеток 
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= TILE_COUNT; i++) {
        const pos = i * GRID_SIZE + 0.5; // +0.5, чтобы линия была чёткой в 1px
        ctx.moveTo(pos, 0);              // вертикальная линия
        ctx.lineTo(pos, canvas.height);
        ctx.moveTo(0, pos);              // горизонтальная линия
        ctx.lineTo(canvas.width, pos);
    }
    ctx.stroke();
}

// отрисовка 
function draw() {
    // очищаем холст
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    // отрисовка яблока (красный круг)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(
        apple.x * GRID_SIZE + GRID_SIZE / 2, 
        apple.y * GRID_SIZE + GRID_SIZE / 2, 
        GRID_SIZE / 2 - 2, 
        0, 
        Math.PI * 2
    );
    ctx.fill();
    // отрисовка змейки: тело зелёное, голова ярко-жёлтая
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#facc15' : '#22c55e';

        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
    });

    // отрисовка экрана Game Over
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Игра окончена!', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '20px sans-serif';
        ctx.fillText(`Ваш счёт: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
}

// игровой цикл 
function gameLoop(currentTime) {
    update(currentTime);
    draw();

    // продолжаем цикл, даже если gameOver, чтобы отрисовать финальный экран
    if (!isGameOver) {
        rafId = requestAnimationFrame(gameLoop);
    }
}

// управление клавиатурой 
function handleKeyDown(e) {
    if (isGameOver) return;
    // блокируем прокрутку страницы стрелками
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    // запрет на разворот на 180 градусов
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
            break;
    }
}

// слушатели событий 
document.addEventListener('keydown', handleKeyDown);
restartBtn.addEventListener('click', initGame);

// запуск при загрузке страницы
initGame();
