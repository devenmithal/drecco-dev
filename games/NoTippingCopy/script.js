class Ball {

    constructor(x, y, radius, dx, dy, i){
        this.radius = radius;
        this.x = x;
        this.y = y;

        this.dx = dx;
        this.dy = dy;

        // mass is that of a sphere as opposed to circle
        // it *does* make a difference in how realistic it looks
        this.mass = this.radius * this.radius * this.radius;
        this.color = pickColor(i);
    };

    draw() {
        ctx.beginPath();
        ctx.arc(Math.round(this.x), Math.round(this.y), this.radius, 0, 2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.stroke();
        ctx.closePath();
    };

    speed() {
        // magnitude of velocity vector
        return Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    };
    angle() {
        // velocity's angle with the x axis
        return Math.atan2(this.dy, this.dx);
    };
    onGround() {
        return (this.y + this.radius >= height)
    };
};

function setup() {
    width = document.getElementById('game-container').offsetWidth - 100;
    containerHeight = window.innerHeight;
    height = width * 3 / 4 - width / 6;
    canvas = createCanvas(width, Math.max(height, containerHeight * 3 / 4)); // ~4:3 aspect ratio
    canvas.parent('game-container');
    ctx = drawingContext

    button = createButton('Submit move');
    button.position(width - 150, height - 50);
    button.parent('game-container');
    button.attribute('class', 'btn btn-success')
    button.mousePressed(nextTurn);

    input_box_1 = createInput('Velocity (Max 30)');
    input_box_1.position(width - 150, height - 90);
    input_box_1.parent('game-container');

    input_box_2 = createInput('Angle (Degrees)');
    input_box_2.position(width - 150, height - 130);
    input_box_2.parent('game-container');

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    // spawn the initial small thingies.
    for (i = 0; i<numStartingSmallBalls; i++) {
        objArray[objArray.length] = new Ball(width - 40, Math.round(height/2) + 10*(1 - i) - 10*(i), randomRadius(), 12*0, 12*0, i);
    }

    for(i = 0; i<objArray.length; i++){
        console.log(objArray[i]);
    }


    // manually spawn the few large ones that
    // start with no velocity. (lazy code)
    bigBalls = true;
    for (i = 0; i<numStartingBigBalls; i++) {
        let temp = new Ball(randomX(), randomY(), randomRadius(), randomDx(), randomDy(), i);
        temp.dx = randomDx() / 8;
        temp.dy = randomDy() / 12;
        objArray[objArray.length] = temp;
    }

    draw();
}

var canvas;
var inGame = false;
var done = false;
var winner = "";
var turn = 0;
var game;
var message = '';
var numberTextSize = 24;
var ctx;
var numTurns;
var curr_turns = 0;

let objArray = [];
let paused = false;
let bumped = false;

let leftHeld = false;
let upHeld = false;
let rightHeld = false;
let downHeld = false;
let arrowControlSpeed = .25;

let gravityOn = true;

let clearCanv = true;

let bigBalls = false;

let lastTime = (new Date()).getTime();
let currentTime = 0;
let dt = 0;

let numStartingSmallBalls = 2;
let numStartingBigBalls = 0;

function clearCanvas() {
    ctx.clearRect(0, 0, width, height);
}

function draw_hole(){
      ctx.beginPath();
      ctx.arc(Math.round(40), Math.round(height/2), 10, 0, 2*Math.PI);
      ctx.fillStyle = "rgb(128,128,128)";
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.stroke();
      ctx.closePath();
}

function keyDownHandler(event) {
    if (event.keyCode == 67) { // c
        objArray[objArray.length] = new Ball(randomX(), randomY(), randomRadius());
    } else if (event.keyCode == 80) { // p
        paused = !paused;
    } else if (event.keyCode == 71) { // g
        // This feature WAS taken out
        // because of a bug where
        // balls "merge" with each other
        // when under a lot of pressure.

        // putting back in

        gravityOn = !gravityOn;
    } else if (event.keyCode == 65) { // A
        leftHeld = true;
    } else if (event.keyCode == 87) { // W
        upHeld = true;
    } else if (event.keyCode == 68) { // D
        rightHeld = true;
    } else if (event.keyCode == 83) { // S
        downHeld = true;
    } else if (event.keyCode == 82) { // r
        objArray = [];
    } else if (event.keyCode == 75) { // k
        clearCanv = !clearCanv;
    } else if (event.keyCode == 88) { // x
        bigBalls = !bigBalls;
    }
}

function keyUpHandler(event) {
    if (event.keyCode == 65) { // A
        leftHeld = false;
    } else if (event.keyCode == 87) { // W
        upHeld = false;
    } else if (event.keyCode == 68) { // D
        rightHeld = false;
    } else if (event.keyCode == 83) { // S
        downHeld = false;
    }
}

function arrowControls() {
    if (leftHeld) { // left arrow
        for (let obj in objArray) {
            objArray[obj].dx -= arrowControlSpeed / objArray[obj].radius;
        }
    } if (upHeld) { // up arrow
        for (let obj in objArray) {
            objArray[obj].dy -= arrowControlSpeed / objArray[obj].radius;
        }
    } if (rightHeld) { // right arrow
        for (let obj in objArray) {
            objArray[obj].dx += arrowControlSpeed / objArray[obj].radius;
        }
    } if (downHeld) { // down arrow
        for (let obj in objArray) {
            objArray[obj].dy += arrowControlSpeed / objArray[obj].radius;
        }
    }
}

function canvasBackground() {
    canvas.background(152,251,152);
}

function wallCollision(ball) {
    if (ball.x - ball.radius + ball.dx < 0 ||
        ball.x + ball.radius + ball.dx > width) {
        ball.dx *= -1;
    }
    if (ball.y - ball.radius + ball.dy < 0 ||
        ball.y + ball.radius + ball.dy > height) {
        ball.dy *= -1;
    }
    if (ball.y + ball.radius > height) {
        ball.y = height - ball.radius;
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
    }
    if (ball.x + ball.radius > width) {
        ball.x = width - ball.radius;
    }
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
    }
}

function ballCollision() {
    for (let i=0; i<objArray.length-1; i++) {
        for (let j=i+1; j<objArray.length; j++) {
            let ob1 = objArray[i]
            let ob2 = objArray[j]
            let dist = distance(ob1, ob2)

            if (dist < ob1.radius + ob2.radius) {
                let theta1 = ob1.angle();
                let theta2 = ob2.angle();
                let phi = Math.atan2(ob2.y - ob1.y, ob2.x - ob1.x);
                let m1 = ob1.mass;
                let m2 = ob2.mass;
                let v1 = ob1.speed();
                let v2 = ob2.speed();

                let dx1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.cos(phi) + v1*Math.sin(theta1-phi) * Math.cos(phi+Math.PI/2);
                let dy1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.sin(phi) + v1*Math.sin(theta1-phi) * Math.sin(phi+Math.PI/2);
                let dx2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.cos(phi) + v2*Math.sin(theta2-phi) * Math.cos(phi+Math.PI/2);
                let dy2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.sin(phi) + v2*Math.sin(theta2-phi) * Math.sin(phi+Math.PI/2);

                ob1.dx = dx1F;
                ob1.dy = dy1F;
                ob2.dx = dx2F;
                ob2.dy = dy2F;

                staticCollision(ob1, ob2)

            }
        }
        wallCollision(objArray[i]);
    }

    if (objArray.length > 0)
        wallCollision(objArray[objArray.length-1])
}

function staticCollision(ob1, ob2, emergency=false)
{
    let overlap = ob1.radius + ob2.radius - distance(ob1, ob2);
    let smallerObject = ob1.radius < ob2.radius ? ob1 : ob2;
    let biggerObject = ob1.radius > ob2.radius ? ob1 : ob2;

    // When things go normally, this line does not execute.
    // "Emergency" is when staticCollision has run, but the collision
    // still hasn't been resolved. Which implies that one of the objects
    // is likely being jammed against a corner, so we must now move the OTHER one instead.
    // in other words: this line basically swaps the "little guy" role, because
    // the actual little guy can't be moved away due to being blocked by the wall.
    if (emergency) [smallerObject, biggerObject] = [biggerObject, smallerObject]

    let theta = Math.atan2((biggerObject.y - smallerObject.y), (biggerObject.x - smallerObject.x));
    smallerObject.x -= overlap * Math.cos(theta);
    smallerObject.y -= overlap * Math.sin(theta);

    if (distance(ob1, ob2) < ob1.radius + ob2.radius) {
        // we don't want to be stuck in an infinite emergency.
        // so if we have already run one emergency round; just ignore the problem.
        if (!emergency) staticCollision(ob1, ob2, true)
    }
}

function applyGravity() {
    for (let obj in objArray) {
        let ob = objArray[obj]

        // apply basic drag
        ob.dx *= .9999
        ob.dy *= .9999
    }
}

function moveObjects() {
    for (let i=0; i<objArray.length; i++) {
        let ob = objArray[i];
        if(done == false && ball_in_hole(ob)){
          winner = i + 1;
          done = true;
          message = "Player " + winner + " wins!";
        }
        ob.x += ob.dx * dt;
        ob.y += ob.dy * dt;
    }
}

function ball_in_hole(ob){
    if (Math.abs(ob.x - 40) <= 5 && Math.abs(ob.y -  Math.round(height/2)) <= 5){
      console.log("Ball in hole");
      return true;
    } else {
      return false;
    }
}

function drawObjects() {
    for (let obj in objArray) {
        objArray[obj].draw();
    }
}

function draw() {
    currentTime = (new Date()).getTime();
    dt = (currentTime - lastTime) / 1000; // delta time in seconds

    // dirty and lazy solution
    // instead of scaling up every velocity vector the program
    // we increase the speed of time
    dt *= 50;

    if (clearCanv) clearCanvas();
    canvasBackground();
    if(inGame){
      /*
      for (var x = 0; x < width; x += 40) {
          for (var y = 0; y < height; y += 40) {
              stroke(0);
              strokeWeight(1);
              line(x, 0, x, height);
              line(0, y, width, y);
            }
      }
      */

      if (!paused) {
          arrowControls();
          if (gravityOn) {
              applyGravity(); // (and drag)
          }
          moveObjects();
          ballCollision();
      }

      drawObjects();
      draw_hole();
      drawMessage();
    }
    //logger();

    lastTime = currentTime;
    window.requestAnimationFrame(draw);
}

function logger() {
    // log stuff
}

    /*
     */
function startGame() {
    message = '';
    player1 = document.getElementById("player-1").value;
    player2 = document.getElementById("player-2").value;
    numBarriers = document.getElementById("number-of-barriers").value;
    numTurns = 2*document.getElementById("number-of-turns").value;

    game = new Game({
      player1: player1,
      player2: player2
    });

    inGame = true
}

function nextTurn() {
    //logic for next turn
    velocity_str = input_box_1.value();
    input_box_1.value('Velocity (Max 30)');
    velocity = parseInt(velocity_str);
    // velocity = velocity%30;

    degree_str = input_box_2.value();
    input_box_2.value('Angle (Degrees)');
    degree = parseInt(degree_str);
    degree = degree%360;

    if(done == true){
      return;
    }
    objArray[turn].dx = velocity*Math.cos((degree/360)*2*Math.PI);
    objArray[turn].dy = velocity*Math.sin((degree/360)*2*Math.PI);

    if(turn == 0){
      turn = 1;
    } else {
      turn = 0;
    }
    curr_turns += 1;

    if(curr_turns == numTurns){
        hole = {dx: 40, dy: Math.round(height/2)};
        dist0 = distance(objArray[0], hole);
        dist1 = distance(objArray[1], hole);
        if(dist0 < dist1){
          message = "Player 1 wins!";
        } else if (dist0 > dist1) {
          message = "Player 2 wins!";
        } else {
          message = "Tie!";
        }
        done = true;
    }

}

/*
* This handles the barrier creation
*/
function mouseClicked() {
}

function drawMessage() {
    fill(0,0,0);
    stroke(0,0,0);
    strokeWeight(1);
    textSize(30);
    textAlign(CENTER, CENTER);

    text(message, width / 2, height / 2 - 50);
}

/*
* Need to change instances of NoTipping to BarrierPutPut
*/
function gameOver() {
    $.get('https://cims.nyu.edu/drecco2016/games/NoTipping/saveScore.php', {
        score: game.players[turn].name,
        gamename: 'NoTipping',
        playername: game.players[0].name + ' vs ' + game.players[1].name
    }).done(function(data) {
        console.log("Saved success");
        console.log(data);
    }).fail(function(data) {
        console.log("Saved failure");
        console.log(data);
    });
}

/*
 * Object for the board state. Maintains following information:
 */
class Board {

    /*
     * This should only really hold the locations of the barriers on the map
     */

    constructor() {
    }
}

/*
 * Object for the respective player. Contains the following information:
 *
 * - name: Name of the player
 * - timeLeft: Amount of time player has left (unnecessary(?))
 * - numberOfWeights: The total number of weights
 * - containsWeights: An array containing the weights they have available to use
 */
class Player {

    constructor(name, timeLeft) {
        this.timeLeft = timeLeft;
        this.name = name;
    }
}

class Game {

    /*
     */
    constructor(properties) {
        this.gameOver = false;
        this.players = new Array(2);
        this.players[0] = new Player(properties.player1, this.totalTime);
        this.players[1] = new Player(properties.player2, this.totalTime);

        this.board = new Board(this.numberOfWeights, this.boardLength, this.boardWeight);
    }

    /*
     * Update the player's time based on the amount of time that they took.
     * (May be unnecessary for 2-player games)
     */
    updateTime(turn, time) {
        this.players[this.currentTurn].timeLeft -= time;

        if(this.players[this.currentTurn].timeLeft <= 0) {
            this.gameOver = true;
            return this.players[this.currentTurn].name + ' ran out of time';
        } else {
            return this.players[this.currentTurn].name + ' has ' + this.players[this.currentTurn].timeLeft + ' time left.';
        }
    }
}

function randomColor() {
    let red = Math.floor(Math.random() * 3) * 127;
    let green = Math.floor(Math.random() * 3) * 127;
    let blue = Math.floor(Math.random() * 3) * 127;

    // dim down the small balls
    if (!bigBalls){
        red *= 0.65
        green *= 0.65
        blue *= 0.65
    }

    let rc = "rgb(" + red + ", " + green + ", " + blue + ")";
    return rc;
}

function pickColor(i){
  if(i == 0){
    return "#ff0000";
  } else if (i == 1) {
    return "#0000ff";
  } else {
    return randomColor();
  }
}

function randomX() {
    let x = Math.floor(Math.random() * width);
    if (x < 30) {
        x = 30;
    } else if (x + 30 > width) {
        x = width - 30;
    }
    return x;
}

function randomY() {
    let y = Math.floor(Math.random() * height);
    if (y < 30) {
        y = 30;
    } else if (y + 30 > height) {
        y = height - 30;
    }
    return y;
}

function randomRadius() {
    if (bigBalls) {
        let r = Math.ceil(Math.random() * 10 + 20);
        return r;
    } else {
        // let r = Math.ceil(Math.random() * 2 + 2);
        let r = 5;
        return r;
    }
}

function randomDx() {
    let r = Math.floor(Math.random() * 10 - 4);
    return r;
}

function randomDy() {
    let r = Math.floor(Math.random() * 10 - 3);
    return r;
}

function distanceNextFrame(a, b) {
    return Math.sqrt((a.x + a.dx - b.x - b.dx)**2 + (a.y + a.dy - b.y - b.dy)**2) - a.radius - b.radius;
}

function distance(a, b) {
    return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2);
}
