// las teclas que vamos a usar
const KEY_CODE_LEFT = 37;
const KEY_CODE_RIGHT = 39;
const KEY_CODE_SPACE = 32;

//define los márgenes del juego 
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const PLAYER_WIDTH = 20; //pone el limite lateral alm jugador
const PLAYER_MAX_SPEED = 600.0;
const LASER_MAX_SPEED = 500.0; //aumentar para que sea mas intensito :p
const LASER_COOLDOWN = 0.4; // tiempo de recuperación del laser

const ENEMIES_PER_ROW = 10; // caben hasta 15 sin montarse
const ENEMY_HORIZONTAL_PADDING = 80; //limites laterales
const ENEMY_VERTICAL_PADDING = 70; // limite superior e inferioir
const ENEMY_VERTICAL_SPACING = 80; //espacio entre lineas
const ENEMY_COOLDOWN = 4.0; //tiempo de recuperación del enemigo

const GAME_STATE = {
    lastTime: Date.now(),
    leftPressed: false,
    rightPressed: false,
    spacePressed: false,
    playerX: 0,
    playerY: 0,
    playerCooldown: 0,
    lasers: [],
    enemies: [],
    enemyLasers: [],
    gameOver: false
};

function rectsIntersect(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}
//Inserta los objetos en las posicines pasadas por parámetro
function setPosition(el, x, y) {
    el.style.transform = `translate(${x}px, ${y}px)`;
}
// controla que la nave no se pase de los límites
function clamp(v, min, max) {
    if (v < min) {
        return min;
    } else if (v > max) {
        return max;
    } else {
        return v;
    }
}
/*
 *  Perteneciente al jugador
 */
function rand(min, max) {
    if (min === undefined) min = 0;
    if (max === undefined) max = 1;
    return min + Math.random() * (max - min);
}

function createPlayer($container) {
    GAME_STATE.playerX = GAME_WIDTH / 2; // el anocho /2 = el medio :p
    GAME_STATE.playerY = GAME_HEIGHT - 50; // lo posiciona un poco más arriba del límite inferior
    const $player = document.createElement("img"); //
    $player.src = "img/player-green-1.png"; //le decimos que imagen es
    $player.className = "player";
    $container.appendChild($player); // crea del todo la instancia???? con los parametros dados (src & class name)
    setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
}

function destroyPlayer($container, player) {
    $container.removeChild(player);
    GAME_STATE.gameOver = true;
}

function updatePlayer(dt, $container) {
    if (GAME_STATE.leftPressed) { //moviemiento izquierda
        GAME_STATE.playerX -= dt * PLAYER_MAX_SPEED;
    }
    if (GAME_STATE.rightPressed) { //movimiento derecha
        GAME_STATE.playerX += dt * PLAYER_MAX_SPEED;
    }
    // control de limites
    GAME_STATE.playerX = clamp(
        GAME_STATE.playerX,
        PLAYER_WIDTH,
        GAME_WIDTH - PLAYER_WIDTH
    );

    if (GAME_STATE.spacePressed && GAME_STATE.playerCooldown <= 0) { // Creamos el laserattac
        createLaser($container, GAME_STATE.playerX, GAME_STATE.playerY);
        GAME_STATE.playerCooldown = LASER_COOLDOWN;
    }
    if (GAME_STATE.playerCooldown > 0) {
        GAME_STATE.playerCooldown -= dt;
    }

    const player = document.querySelector(".player");
    setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
}

/**
 * Perteneciente al Laser ---->
 */
function createLaser($container, x, y) {
    const $element = document.createElement("img"); //creamos un Elemento que recogerá una imagen
    $element.src = "img/laser-green-11.png"; // que será esta imagen
    $element.className = "laser"; // a la que le vamos a asociar el nombre de Laser
    $container.appendChild($element); // le ponemos este contexto al container
    const laser = { x, y, $element }; // creamos el laser con la posicion y su representación
    GAME_STATE.lasers.push(laser); // añadimos el laser a la array para gestionarlo
    setPosition($element, x, y); // lo posicionamos 
}

function updateLasers(dt, $container) {
    const lasers = GAME_STATE.lasers;
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        laser.y -= dt * LASER_MAX_SPEED;
        if (laser.y < 0) {
            destroyLaser($container, laser);
        }
        setPosition(laser.$element, laser.x, laser.y);
        const r1 = laser.$element.getBoundingClientRect();
        const enemies = GAME_STATE.enemies;
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            if (enemy.isDead) continue;
            const r2 = enemy.$element.getBoundingClientRect();
            if (rectsIntersect(r1, r2)) {
                // Enemy was hit
                destroyEnemy($container, enemy);
                destroyLaser($container, laser);
                break;
            }
        }
    }
    GAME_STATE.lasers = GAME_STATE.lasers.filter(e => !e.isDead);
}

function destroyLaser($container, laser) {
    $container.removeChild(laser.$element);
    laser.isDead = true;
}
/**
 * Perteneciente el enemigo
 */
function createEnemy($container, x, y) {
    const $element = document.createElement("img");
    $element.src = "img/enemy-red-2.png";
    $element.className = "enemy";
    $container.appendChild($element);
    const enemy = {
        x,
        y,
        cooldown: rand(0.5, ENEMY_COOLDOWN),
        $element
    };
    GAME_STATE.enemies.push(enemy);
    setPosition($element, x, y);
}

function updateEnemies(dt, $container) {
    const dx = Math.sin(GAME_STATE.lastTime / 1000.0) * 50;
    const dy = Math.cos(GAME_STATE.lastTime / 1000.0) * 10;

    const enemies = GAME_STATE.enemies;
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const x = enemy.x + dx;
        const y = enemy.y + dy;
        setPosition(enemy.$element, x, y);
        enemy.cooldown -= dt;
        if (enemy.cooldown <= 0) {
            createEnemyLaser($container, x, y);
            enemy.cooldown = ENEMY_COOLDOWN;
        }
    }
    GAME_STATE.enemies = GAME_STATE.enemies.filter(e => !e.isDead);
}

function destroyEnemy($container, enemy) {
    $container.removeChild(enemy.$element);
    enemy.isDead = true;
}

function createEnemyLaser($container, x, y) {
    const $element = document.createElement("img");
    $element.src = "img/laser-red-5.png";
    $element.className = "enemy-laser";
    $container.appendChild($element);
    const laser = { x, y, $element };
    GAME_STATE.enemyLasers.push(laser);
    setPosition($element, x, y);
}

function updateEnemyLasers(dt, $container) {
    const lasers = GAME_STATE.enemyLasers;
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        laser.y += dt * LASER_MAX_SPEED;
        if (laser.y > GAME_HEIGHT) {
            destroyLaser($container, laser);
        }
        setPosition(laser.$element, laser.x, laser.y);
        const r1 = laser.$element.getBoundingClientRect();
        const player = document.querySelector(".player");
        const r2 = player.getBoundingClientRect();
        if (rectsIntersect(r1, r2)) {
            // Player was hit
            destroyPlayer($container, player);
            break;
        }
    }
    GAME_STATE.enemyLasers = GAME_STATE.enemyLasers.filter(e => !e.isDead);
}
/**
 * CONTROLES
 */

//inicializa el espacio de juego
function init() {
    const $container = document.querySelector(".game");
    createPlayer($container);

    const enemySpacing = (GAME_WIDTH - ENEMY_HORIZONTAL_PADDING * 2) / (ENEMIES_PER_ROW - 1);
    for (let j = 0; j < 3; j++) {
        const y = ENEMY_VERTICAL_PADDING + j * ENEMY_VERTICAL_SPACING;
        for (let i = 0; i < ENEMIES_PER_ROW; i++) {
            const x = i * enemySpacing + ENEMY_HORIZONTAL_PADDING;
            createEnemy($container, x, y);
        }
    }
}

//Indica si hemos ganado
function playerHasWon() {
    return GAME_STATE.enemies.length === 0;
}

function update(e) {
    const currentTime = Date.now();
    const dt = (currentTime - GAME_STATE.lastTime) / 1000.0;
    //console.log(`dt=${dt}`)
    if (GAME_STATE.gameOver) { // si hemos perdido 
        document.querySelector(".game-over").style.display = "block";
        return;
    }

    if (playerHasWon()) { //si hemos ganado
        document.querySelector(".congratulations").style.display = "block";
        return;
    }

    const $container = document.querySelector(".game"); //obtemenos el "objeto" .game del css
    updatePlayer(dt, $container);
    updateLasers(dt, $container);
    updateEnemies(dt, $container);
    updateEnemyLasers(dt, $container);

    GAME_STATE.lastTime = currentTime;
    window.requestAnimationFrame(update);
}
//si presionamos alguna tecla 
function onKeyDown(e) {
    if (e.keyCode === KEY_CODE_LEFT) {
        GAME_STATE.leftPressed = true;
    } else if (e.keyCode === KEY_CODE_RIGHT) {
        GAME_STATE.rightPressed = true;
    } else if (e.keyCode === KEY_CODE_SPACE) {
        GAME_STATE.spacePressed = true;
    }
}
// si dejamos de pulsarla
function onKeyUp(e) {
    if (e.keyCode === KEY_CODE_LEFT) {
        GAME_STATE.leftPressed = false;
    } else if (e.keyCode === KEY_CODE_RIGHT) {
        GAME_STATE.rightPressed = false;
    } else if (e.keyCode === KEY_CODE_SPACE) {
        GAME_STATE.spacePressed = false;
    }
}

/**
 * RUN
 */
init();
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.requestAnimationFrame(update);