let frames = 0;

// Sounds

const soundHit = new Audio("./game/assets/audio/hit.wav");
soundHit.volume = 0.8;

const soundPoint = new Audio("./game/assets/audio/point.wav");
soundPoint.volume = 0.4;

const soundFall = new Audio("./game/assets/audio/fall.wav");
soundFall.volume = 0.4;

const soundJump = new Audio("./game/assets/audio/jump.wav");
soundJump.volume = 0.1;

// Sprites

const sprites = new Image();
sprites.src = "./game/assets/img/sprites.png";

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

function createBackground() {
  const background = {
    spriteX: 390,
    spriteY: 0,
    width: 276,
    height: 204,
    x: 0,
    y: canvas.height - 204,

    draw() {
      context.fillStyle = "#70c5ce";
      context.fillRect(0, 0, canvas.width, canvas.height - 112);

      context.drawImage(
        sprites,
        background.spriteX,
        background.spriteY,
        background.width,
        background.height,
        background.x,
        background.y,
        background.width,
        background.height
      );

      context.drawImage(
        sprites,
        background.spriteX,
        background.spriteY,
        background.width,
        background.height,
        background.x + background.width,
        background.y,
        background.width,
        background.height
      );
    },
  };

  return background;
}

function createFloor() {
  const floor = {
    spriteX: 0,
    spriteY: 611,
    width: 224,
    height: 112,
    x: 0,
    y: canvas.height - 112,

    update() {
      const floorMovement = 1;

      const repeatIn = floor.width / 2;
      const movement = (floor.x -= floorMovement);
      floor.x = movement % repeatIn;
    },
    draw() {
      context.drawImage(
        sprites,
        floor.spriteX,
        floor.spriteY,
        floor.width,
        floor.height,
        floor.x,
        floor.y,
        floor.width,
        floor.height
      );

      context.drawImage(
        sprites,
        floor.spriteX,
        floor.spriteY,
        floor.width,
        floor.height,
        floor.x + floor.width,
        floor.y, // Deslocado à direita do primeiro chão
        floor.width,
        floor.height
      );
    },
  };

  return floor;
}

function createFlappyBird() {
  const flappyBird = {
    spriteX: 0,
    spriteY: 0,
    width: 34,
    height: 24,
    x: 10,
    y: 50,
    gravity: 0.25,
    velocity: 0,
    jumpSize: 4.6,
    movements: [
      { spriteX: 0, spriteY: 0 }, // asa pra cima
      { spriteX: 0, spriteY: 26 }, // asa no meio
      { spriteX: 0, spriteY: 52 }, // asa pra baixo
    ],
    currentFrame: 0,

    updateCurrentFrame() {
      const framesInterval = 10;
      const passedTheInterval = frames % framesInterval === 0;

      if (passedTheInterval) {
        const baseOfIncrement = 1;
        const increment = baseOfIncrement + flappyBird.currentFrame;
        const baseOfRepetition = flappyBird.movements.length;
        flappyBird.currentFrame = increment % baseOfRepetition;
      }
    },

    update() {
      if (hasCollision(flappyBird, globals.floor)) {
        soundFall.play();

        changeScreen(Screens.GAME_OVER);

        return;
      }

      flappyBird.velocity += flappyBird.gravity;
      flappyBird.y += flappyBird.velocity;
    },

    draw() {
      flappyBird.updateCurrentFrame();
      const { spriteX, spriteY } =
        flappyBird.movements[flappyBird.currentFrame];

      context.drawImage(
        sprites, // Image
        spriteX,
        spriteY, // PosX e Y do Sprite no spriteSheet
        flappyBird.width,
        flappyBird.height, // SpriteWidth, SpriteHeight
        flappyBird.x,
        flappyBird.y, // PosX e PosY no canvas
        flappyBird.width,
        flappyBird.height // width e height no canvas
      );
    },

    jump() {
      soundJump.play();
      flappyBird.currentFrame = 2;
      flappyBird.velocity = -flappyBird.jumpSize;
    },
  };

  return flappyBird;
}

function createPipes() {
  const pipes = {
    width: 52,
    height: 400,
    floor: {
      spriteX: 0,
      spriteY: 169,
    },
    sky: {
      spriteX: 52,
      spriteY: 169,
    },
    spaces: 80,

    draw() {
      pipes.pairsOfPipes.forEach((pair) => {
        const yRandom = pair.y;
        const spacingBetweenPipes = 90;

        // Pipe of sky
        const pipeOfSkyX = pair.x;
        const pipeOfSkyY = yRandom;

        context.drawImage(
          sprites,
          pipes.sky.spriteX,
          pipes.sky.spriteY,
          pipes.width,
          pipes.height,
          pipeOfSkyX,
          pipeOfSkyY,
          pipes.width,
          pipes.height
        );

        // Pipe of floor
        const pipeOfFloorX = pair.x;
        const pipeOfFloorY = pipes.height + spacingBetweenPipes + yRandom;

        context.drawImage(
          sprites,
          pipes.floor.spriteX,
          pipes.floor.spriteY,
          pipes.width,
          pipes.height,
          pipeOfFloorX,
          pipeOfFloorY,
          pipes.width,
          pipes.height
        );

        pair.pipeOfSky = {
          x: pipeOfFloorX,
          y: pipes.height + pipeOfSkyY,
        };

        pair.pipeOfFloor = {
          x: pipeOfSkyX,
          y: pipeOfFloorY,
        };
      });
    },

    hasCollisionWithFlappyBird(pair) {
      const headOfFlappyBird = globals.flappyBird.y;
      const footOfFlappyBird = globals.flappyBird.y + globals.flappyBird.height;

      if (globals.flappyBird.x + globals.flappyBird.width > pair.x) {
        if (headOfFlappyBird < pair.pipeOfSky.y) {
          return true;
        }

        if (footOfFlappyBird > pair.pipeOfFloor.y) {
          return true;
        }
      }

      return false;
    },

    pairsOfPipes: [],
    update() {
      const passed100Frames = frames % 100 === 0;
      if (passed100Frames) {
        pipes.pairsOfPipes.push({
          x: canvas.width,
          y: -200 * (Math.random() + 1),
        });
      }

      pipes.pairsOfPipes.forEach((pair) => {
        pair.x -= 2;

        if (pipes.hasCollisionWithFlappyBird(pair)) {
          soundHit.play();
          changeScreen(Screens.GAME_OVER);
        }

        if (pair.x + pipes.width <= 0) pipes.pairsOfPipes.shift();
      });
    },
  };

  return pipes;
}

function createScore() {
  const score = {
    pointing: 0,

    draw() {
      context.font = "35px 'VT323'";
      context.textAlign = "right";
      context.fillStyle = "white";
      context.fillText(`Score: ${score.pointing}`, canvas.width - 10, 35);
    },

    update() {
      const framesInterval = 20;
      const passedTheInterval = frames % framesInterval === 0;

      let flappyBirdX = globals.flappyBird.x;
      let canoX;

      switch (globals.pipes.pairsOfPipes.length) {
        case 0:
          return;
        case 1:
          canoX = globals.pipes.pairsOfPipes[0].x;
          break;
        case 2:
          canoX = Math.min(
            globals.pipes.pairsOfPipes[0].x,
            globals.pipes.pairsOfPipes[1].x
          );
      }

      if (flappyBirdX === canoX) {
        score.pointing++;

        soundPoint.play();
      }
    },
  };

  return score;
}

const messageGetReady = {
  spriteX: 134,
  spriteY: 0,
  width: 174,
  height: 152,
  x: canvas.width / 2 - 174 / 2,
  y: 50,

  draw() {
    context.drawImage(
      sprites,
      messageGetReady.spriteX,
      messageGetReady.spriteY,
      messageGetReady.width,
      messageGetReady.height,
      messageGetReady.x,
      messageGetReady.y,
      messageGetReady.width,
      messageGetReady.height
    );
  },
};

const messageGameOver = {
  spriteX: 134,
  spriteY: 153,
  width: 226,
  height: 200,
  x: canvas.width / 2 - 226 / 2,
  y: 50,

  draw() {
    context.drawImage(
      sprites,
      messageGameOver.spriteX,
      messageGameOver.spriteY,
      messageGameOver.width,
      messageGameOver.height,
      messageGameOver.x,
      messageGameOver.y,
      messageGameOver.width,
      messageGameOver.height
    );
  },
};

//
// Telas
//
const globals = {};
let activeScreen = {};

function changeScreen(newScreen) {
  activeScreen = newScreen;

  if (activeScreen.init) activeScreen.init();
}

function hasCollision(flappyBird, floor) {
  const flappyBirdY = flappyBird.y + flappyBird.height;
  const floorY = floor.y;

  if (flappyBirdY >= floorY) return true;
  return false;
}

const Screens = {
  START: {
    init() {
      globals.background = createBackground();
      globals.flappyBird = createFlappyBird();
      globals.floor = createFloor();
      globals.pipes = createPipes();
    },

    draw() {
      globals.background.draw();
      globals.flappyBird.draw();
      globals.floor.draw();
      messageGetReady.draw();
    },

    click() {
      changeScreen(Screens.GAME);
    },

    update() {
      globals.floor.update();
    },
  },
  GAME: {
    init() {
      globals.score = createScore();
    },

    draw() {
      // A ordem em que você desenha importa na sobreposição
      globals.background.draw();
      globals.pipes.draw();
      globals.floor.draw();
      globals.flappyBird.draw();
      globals.score.draw();
    },

    click() {
      globals.flappyBird.jump();
    },

    update() {
      globals.flappyBird.update();
      globals.pipes.update();
      globals.floor.update();
      globals.score.update();
    },
  },
  GAME_OVER: {
    draw() {
      messageGameOver.draw();
    },

    update() {},

    click() {
      changeScreen(Screens.START);
    },
  },
};

function loop() {
  activeScreen.draw();
  activeScreen.update();

  frames++;

  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.code == "Space") if (activeScreen.click) activeScreen.click();
});

window.addEventListener("click", () => {
  if (activeScreen.click) activeScreen.click();
});

changeScreen(Screens.START);
loop();
