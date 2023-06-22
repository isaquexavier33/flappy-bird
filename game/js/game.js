console.log("Flappy Bird");

const sprites = new Image();
sprites.src = "./game/assets/img/sprites.png";

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

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
      background.spriteX, background.spriteY,
      background.width, background.height,
      background.x, background.y,
      background.width, background.height,
    );

    context.drawImage(
      sprites,
      background.spriteX, background.spriteY,
      background.width, background.height,
      (background.x + background.width), background.y,
      background.width, background.height,
    )
  }
}

const floor = {
  spriteX: 0,
  spriteY: 611,
  width: 224,
  height: 112,
  x: 0,
  y: canvas.height - 112,

  draw() {
    context.drawImage(
      sprites,
      floor.spriteX, floor.spriteY,
      floor.width, floor.height,
      floor.x, floor.y,
      floor.width, floor.height
    );

    context.drawImage(
      sprites,
      floor.spriteX, floor.spriteY,
      floor.width, floor.height,
      (floor.x + floor.width), floor.y, // Deslocado à direita do primeiro chão
      floor.width, floor.height
    );
  }
}

const flappyBird = {
  spriteX: 0,
  spriteY: 0,
  width: 34,
  height: 24,
  x: 10,
  y: 50,
  gravity: 0.25,
  velocity: 0,

  update() {
    flappyBird.velocity += flappyBird.gravity
    flappyBird.y += flappyBird.velocity;
  },

  draw() {
    context.drawImage(
      sprites, // Image
      flappyBird.spriteX, flappyBird.spriteY, // PosX e Y do Sprite no spriteSheet
      flappyBird.width, flappyBird.height, // SpriteWidth, SpriteHeight
      flappyBird.x, flappyBird.y, // PosX e PosY no canvas
      flappyBird.width, flappyBird.height // width e height no canvas
    );
  }
}

function loop() {
  flappyBird.update();

  // A ordem em que você desenha importa na sobreposição
  background.draw();
  floor.draw();
  flappyBird.draw();

  requestAnimationFrame(loop);
}

loop();