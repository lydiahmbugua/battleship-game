import { Ship, Gameboard, Player } from "./game.js";

let humanPlayer = new Player("human");
let computerPlayer = new Player("computer");
let currentDirection = "";
let vertex = [];
let humanTurn = true;

function randomPlacement() {
  const point = [
    Math.floor(Math.random() * 10),
    Math.floor(Math.random() * 10),
  ];
  let direction = "";
  const directionGen = Math.floor(Math.random() * 2);
  if (directionGen == 0) {
    direction = "vertical";
  } else {
    direction = "horizontal";
  }
  return { point, direction };
}

function computerAttack() {
  let success = false;
  while (success === false) {
    try {
      const { point } = randomPlacement();
      humanPlayer.gameboard.receiveAttack(point);
      success = true;
      const attackedSquare = Array.from(grid.querySelectorAll(".square")).find(
        (sq) => sq.vertex[0] === point[0] && sq.vertex[1] === point[1],
      );
      if (attackedSquare) {
        const isMiss = humanPlayer.gameboard.missedAttacks.find(
          (coord) => coord[0] === point[0] && coord[1] === point[1],
        );
        if (isMiss) {
          attackedSquare.classList.add("miss");
        } else {
          attackedSquare.classList.add("hit");
        }
      }
      if (humanPlayer.gameboard.allSunk()) {
        // FIXED: same overlay2 visibility fix as in the victory path.
        overlay2.classList.remove("hidden");
        endgame.classList.remove("hidden");
        endgamePara.textContent =
          "Defeated! The enemy has sunk all your ships. Better luck next time, Captain!";
      } else {
        humanTurn = true;
      }
    } catch (e) {}
  }
}

const { point, direction } = randomPlacement();
let shipsArr = [];
const computerShips = [
  new Ship(5),
  new Ship(4),
  new Ship(3),
  new Ship(3),
  new Ship(2),
];
computerShips.forEach((ship) => {
  let success = false;
  while (success === false) {
    try {
      const { point, direction } = randomPlacement();
      computerPlayer.gameboard.placeShip(ship, point, direction);
      success = true;
    } catch (e) {}
  }
});
let carrierShip = new Ship(5);
let battleShip = new Ship(4);
let destroyerShip = new Ship(3);
let submarineShip = new Ship(3);
let patrolShip = new Ship(2);
shipsArr.push(
  carrierShip,
  battleShip,
  destroyerShip,
  patrolShip,
  submarineShip,
);

function buildGrid(box) {
  box.innerHTML = "";
  for (let k = 0; k < letters.length; k++) {
    const letter = document.createElement("div");
    letter.classList.add("coordinate");
    letter.textContent = `${letters[k]}`;
    box.append(letter);
  }
  for (let i = 0; i < 10; i++) {
    const number = document.createElement("div");
    number.classList.add("coordinate");
    number.textContent = `${i + 1}`;
    box.append(number);
    for (let j = 0; j < 10; j++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.vertex = [i, j];
      box.append(square);
      square.addEventListener("click", () => {
        if (shipsArr.length > 0) {
          try {
            let currentShip = shipsArr[0];
            vertex = [i, j];
            humanPlayer.gameboard.placeShip(
              currentShip,
              vertex,
              currentDirection,
            );
            myBoardTitle.textContent = "My Board";
            shipsArr.shift();
            const newShip = humanPlayer.gameboard.occupied.slice(
              -currentShip.length,
            );
            newShip.forEach((box) => {
              const findSquare = Array.from(
                grid.querySelectorAll(".square"),
              ).find((square) => {
                return (
                  square.vertex[0] == box[0][0] && square.vertex[1] == box[0][1]
                );
              });
              findSquare.classList.add("ship-box");
            });
            if (shipsArr.length === 0) {
              buttons.classList.add("hidden");
            }
          } catch (e) {
            myBoardTitle.textContent = e;
          }
        }
      });
    }
  }
}

function buildEnemyGrid(box) {
  box.innerHTML = "";
  for (let k = 0; k < letters.length; k++) {
    const letter = document.createElement("div");
    letter.classList.add("coordinate");
    letter.textContent = `${letters[k]}`;
    box.append(letter);
  }
  for (let i = 0; i < 10; i++) {
    const number = document.createElement("div");
    number.classList.add("coordinate");
    number.textContent = `${i + 1}`;
    box.append(number);
    for (let j = 0; j < 10; j++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.vertex = [i, j];
      box.append(square);
      square.addEventListener("click", () => {
        if (humanTurn == true) {
          if (shipsArr.length === 0) {
            try {
              computerPlayer.gameboard.receiveAttack(square.vertex);

              const isMiss = computerPlayer.gameboard.missedAttacks.find(
                (coord) =>
                  coord[0] === square.vertex[0] &&
                  coord[1] === square.vertex[1],
              );
              if (isMiss) {
                square.classList.add("miss");
                updateStats();
              } else {
                square.classList.add("hit");
                updateStats();
                const hitShip = computerPlayer.gameboard.getShipAt(
                  square.vertex,
                );
                if (hitShip.isSunk()) {
                  computerPlayer.gameboard.occupied
                    .filter((box) => box[1] === hitShip)
                    .forEach((box) => {
                      const sunkSquare = Array.from(
                        grid2.querySelectorAll(".square"),
                      ).find(
                        (sq) =>
                          sq.vertex[0] === box[0][0] &&
                          sq.vertex[1] === box[0][1],
                      );
                      if (sunkSquare) {
                        // FIXED: the 'hit' class was added first and never removed,
                        // so even though 'sunk' was applied, CSS specificity meant
                        // the red hit colour persisted over the intended dark-blue
                        // sunk colour. Removing 'hit' before adding 'sunk' ensures
                        // the correct style is shown.
                        sunkSquare.classList.remove("hit");
                        sunkSquare.classList.add("sunk");
                      }
                    });
                }
              }

              if (computerPlayer.gameboard.allSunk()) {
                // FIXED: overlay2 is the parent wrapper of the endgame modal.
                // The original only removed 'hidden' from `endgame` itself, but
                // `overlay2` was always hidden, so the modal was never visible.
                // Both the overlay and the inner panel must be un-hidden together.
                overlay2.classList.remove("hidden");
                endgame.classList.remove("hidden");
                endgamePara.textContent =
                  "Victory! You sank the entire enemy fleet. The seas are yours, Admiral!";
              } else {
                humanTurn = false;
                setTimeout(() => {
                  computerAttack();
                }, 500);
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
      });
    }
  }
}

const container = document.createElement("div");
container.classList.add("container");

const nav = document.createElement("div");
nav.classList.add("nav");

const logo = document.createElement("div");
logo.textContent = "Battleship";
logo.classList.add("logo");
const logoBadge = document.createElement("div");
logoBadge.classList.add("logo-badge");
const overlay = document.createElement("div");
overlay.classList.add("hidden");
overlay.classList.add("overlay");
overlay.addEventListener("click", () => {
  overlay.classList.add("hidden");
});
const overlay2 = document.createElement("div");
overlay2.classList.add("hidden");
overlay2.classList.add("overlay");

const endgame = document.createElement("div");
endgame.classList.add("hidden");
endgame.classList.add("endgame");
const endgameTitle = document.createElement("p");
endgameTitle.classList.add("how-title");
endgameTitle.textContent = "GAME OVER!";

const endgamePara = document.createElement("p");
endgamePara.classList.add("end-para");
endgamePara.textContent = "GAME OVER!";

const endGameBtn = document.createElement("button");
endGameBtn.classList.add("button");
endGameBtn.textContent = "New Game";
endGameBtn.addEventListener("click", () => {
  humanTurn = true;
  humanPlayer = new Player("human");
  computerPlayer = new Player("computer");
  shipsArr = [];
  carrierShip = new Ship(5);
  battleShip = new Ship(4);
  destroyerShip = new Ship(3);
  submarineShip = new Ship(3);
  patrolShip = new Ship(2);
  shipsArr.push(
    carrierShip,
    battleShip,
    destroyerShip,
    patrolShip,
    submarineShip,
  );

  // Place computer ships for the new game
  shipsArr.forEach((ship) => {
    let success = false;
    while (success === false) {
      try {
        const { point, direction } = randomPlacement();
        computerPlayer.gameboard.placeShip(ship, point, direction);
        success = true;
      } catch (e) {}
    }
  });

  const freshUniqueShips = Array.from(
    new Set(computerPlayer.gameboard.occupied.map((box) => box[1])),
  );

  currentDirection = "";
  verticalBtn.classList.remove("active");
  horizontalBtn.classList.remove("active");
  random.classList.remove("active");
  buttons.classList.remove("hidden");
  buildGrid(grid);
  buildEnemyGrid(grid2);
  verticalBtn.classList.remove("hidden");
  horizontalBtn.classList.remove("hidden");
  random.classList.remove("hidden");
  endgame.classList.add("hidden");
  // FIXED: hide the parent overlay2 wrapper on new game reset too, otherwise
  // the endgame modal remains visible even after starting a fresh game.
  overlay2.classList.add("hidden");

  // Reset stats display
  hitsNo.textContent = "0";
  missesNo.textContent = "0";
  sunkNo.textContent = "0";
  remainingNo.textContent = "5";
  buttonsPara.classList.remove("hidden");
  randomPara.classList.remove("hidden");
  redoPara.classList.add("hidden");
  startPara.classList.add("hidden");
  redo.classList.add("hidden");
  start.classList.add("hidden");
});

const howTo = document.createElement("div");
howTo.classList.add("how-to");
const howToTitle = document.createElement("p");
howToTitle.classList.add("how-title");
howToTitle.textContent = "How To Play Battleship";

const howToHeading = document.createElement("p");
howToHeading.classList.add("heading");
howToHeading.textContent = "The Goal";

const howToPara = document.createElement("p");
howToPara.classList.add("para");
howToPara.textContent =
  "Sink all of your opponent's ships before they sink yours.";

const howToHeading2 = document.createElement("p");
howToHeading2.classList.add("heading");
howToHeading2.textContent = "Setup";

const howToPara2 = document.createElement("p");
howToPara2.classList.add("para");
howToPara2.textContent =
  "Before the game starts, you place your 5 ships on your board. Each ship occupies a number of squares in a straight line, either horizontally or vertically. Ships cannot overlap or go out of bounds. Your fleet is:";

const howToList = document.createElement("ul");
const boat1 = document.createElement("li");
boat1.textContent = "Carrier: 5 Squares";
const boat2 = document.createElement("li");
boat2.textContent = "Battleship: 4 Squares";
const boat3 = document.createElement("li");
boat3.textContent = "Destroyer: 3 Squares";

const boat4 = document.createElement("li");
boat4.textContent = "Submarine: 3 Squares";
const boat5 = document.createElement("li");
boat5.textContent = "Patrol Boat: 2 Squares";

howToList.append(boat1, boat2, boat3, boat4, boat5);
howToPara2.append(howToList);

const howToHeading3 = document.createElement("p");
howToHeading3.classList.add("heading");
howToHeading3.textContent = "Taking Turns ";

const howToPara3 = document.createElement("p");
howToPara3.classList.add("para");
howToPara3.textContent =
  "Once ships are placed, you and the computer take turns attacking. On your turn, click a square on the enemy board. You'll be told if it's a hit or a miss. The computer then attacks your board automatically.";

const howToHeading4 = document.createElement("p");
howToHeading4.classList.add("heading");
howToHeading4.textContent = "Hits and Misses ";

const howToPara4 = document.createElement("p");
howToPara4.classList.add("para");
howToPara4.textContent =
  "A hit means one of your attacks landed on an enemy ship. A miss means the square was empty. Keep track of your hits and misses to figure out where the remaining ships are hiding.";

const howToHeading5 = document.createElement("p");
howToHeading5.classList.add("heading");
howToHeading5.textContent = "Sinking a Ship";

const howToPara5 = document.createElement("p");
howToPara5.classList.add("para");
howToPara5.textContent =
  "A ship is sunk when every square it occupies has been hit. When a ship is sunk it will be marked on the board.";

const howToHeading6 = document.createElement("p");
howToHeading6.classList.add("heading");
howToHeading6.textContent = "Winning ";

const howToPara6 = document.createElement("p");
howToPara6.classList.add("para");
howToPara6.textContent =
  "The first player to sink all 5 of the opponent's ships wins the game.";

howTo.append(
  howToTitle,
  howToHeading,
  howToPara,
  howToHeading2,
  howToPara2,
  howToHeading3,
  howToPara3,
  howToHeading4,
  howToPara4,
  howToHeading5,
  howToPara5,
  howToHeading6,
  howToPara6,
);

const statsBar = document.createElement("div");
statsBar.classList.add("stats-bar");

const hits = document.createElement("div");
hits.classList.add("stat");
const hitsNo = document.createElement("p");
hitsNo.classList.add("number");
hitsNo.textContent = `${computerPlayer.gameboard.hits.length}`;
const hitsWord = document.createElement("p");
hitsWord.classList.add("word");
hitsWord.textContent = "HITS";

const misses = document.createElement("div");
misses.classList.add("stat");
const missesNo = document.createElement("p");
missesNo.classList.add("number");
missesNo.textContent = `${computerPlayer.gameboard.missedAttacks.length}`;
const missesWord = document.createElement("p");
missesWord.classList.add("word");
missesWord.textContent = "MISSES";

const sunk = document.createElement("div");
sunk.classList.add("stat");
const sunkNo = document.createElement("p");
sunkNo.classList.add("number");

const uniqueShipsInit = Array.from(
  new Set(computerPlayer.gameboard.occupied.map((box) => box[1])),
);
sunkNo.textContent = `${uniqueShipsInit.filter((s) => s.isSunk()).length}`;

const sunkWord = document.createElement("p");
sunkWord.classList.add("word");
sunkWord.textContent = "SUNK";

const remaining = document.createElement("div");
remaining.classList.add("stat");
const remainingNo = document.createElement("p");
remainingNo.classList.add("number");

remainingNo.textContent = `${uniqueShipsInit.filter((s) => !s.isSunk()).length}`;

const remainingWord = document.createElement("p");
remainingWord.classList.add("word");
remainingWord.textContent = "REMAINING";

function updateStats() {
  hitsNo.textContent = `${computerPlayer.gameboard.hits.length}`;
  missesNo.textContent = `${computerPlayer.gameboard.missedAttacks.length}`;
  const uniqueShips = Array.from(
    new Set(computerPlayer.gameboard.occupied.map((box) => box[1])),
  );
  const sunkCount = uniqueShips.filter((ship) => ship.isSunk()).length;
  const remainingCount = uniqueShips.filter((ship) => !ship.isSunk()).length;
  sunkNo.textContent = sunkCount;
  remainingNo.textContent = remainingCount;
}

const boards = document.createElement("div");
boards.classList.add("boards");

const myBoard = document.createElement("div");
myBoard.classList.add("board");
const myBoardTitle = document.createElement("div");
myBoardTitle.classList.add("title");
myBoardTitle.textContent = "My Board";
const grid = document.createElement("div");
grid.classList.add("grid");
myBoard.append(myBoardTitle, grid);
const letters = " ABCDEFGHIJ".split("");
buildGrid(grid);

const enemyBoard = document.createElement("div");
enemyBoard.classList.add("board");
const enemyBoardTitle = document.createElement("div");
enemyBoardTitle.classList.add("title");
enemyBoardTitle.textContent = "Enemy Board";
const grid2 = document.createElement("div");
grid2.classList.add("grid");
enemyBoard.append(enemyBoardTitle, grid2);
buildEnemyGrid(grid2);

const uniqueComputerShips = Array.from(
  new Set(computerPlayer.gameboard.occupied.map((box) => box[1])),
);

const buttons = document.createElement("div");
buttons.classList.add("buttons");
const buttonsPara = document.createElement("div");
buttonsPara.classList.add("end-para");
buttonsPara.textContent =
  "To place ships, pick a direction first then click a square.";
const buttonsBox = document.createElement("div");
buttonsBox.classList.add("buttons-box");
const verticalBtn = document.createElement("button");
verticalBtn.classList.add("button");
verticalBtn.textContent = "Vertical";
const horizontalBtn = document.createElement("button");
horizontalBtn.classList.add("button");
horizontalBtn.textContent = "Horizontal";
verticalBtn.addEventListener("click", () => {
  currentDirection = "vertical";
  verticalBtn.classList.add("active");
  horizontalBtn.classList.remove("active");
});
horizontalBtn.addEventListener("click", () => {
  currentDirection = "horizontal";
  horizontalBtn.classList.add("active");
  verticalBtn.classList.remove("active");
});

const newGameBtn = document.createElement("button");
newGameBtn.classList.add("button");
newGameBtn.textContent = "New Game";
newGameBtn.addEventListener("click", () => {
  humanTurn = true;
  humanPlayer = new Player("human");
  computerPlayer = new Player("computer");
  shipsArr = [];
  carrierShip = new Ship(5);
  battleShip = new Ship(4);
  destroyerShip = new Ship(3);
  submarineShip = new Ship(3);
  patrolShip = new Ship(2);
  shipsArr.push(
    carrierShip,
    battleShip,
    destroyerShip,
    patrolShip,
    submarineShip,
  );

  const newComputerShips = [
    new Ship(5),
    new Ship(4),
    new Ship(3),
    new Ship(3),
    new Ship(2),
  ];
  newComputerShips.forEach((ship) => {
    let success = false;
    while (success === false) {
      try {
        const { point, direction } = randomPlacement();
        computerPlayer.gameboard.placeShip(ship, point, direction);
        success = true;
      } catch (e) {}
    }
  });

  const freshUniqueShips = Array.from(
    new Set(computerPlayer.gameboard.occupied.map((box) => box[1])),
  );

  hitsNo.textContent = "0";
  missesNo.textContent = "0";
  sunkNo.textContent = "0";
  remainingNo.textContent = "5";
  currentDirection = "";
  verticalBtn.classList.remove("active");
  horizontalBtn.classList.remove("active");
  random.classList.remove("active");
  buttons.classList.remove("hidden");
  buildGrid(grid);
  buildEnemyGrid(grid2);
  buttonsPara.classList.remove("hidden");
  randomPara.classList.remove("hidden");
  redoPara.classList.add("hidden");
  startPara.classList.add("hidden");
  verticalBtn.classList.remove("hidden");
  horizontalBtn.classList.remove("hidden");
  random.classList.remove("hidden");
});

const howToBtn = document.createElement("button");
howToBtn.classList.add("button");
howToBtn.textContent = "How to Play";
howToBtn.addEventListener("click", () => {
  overlay.classList.remove("hidden");
});
const randomPara = document.createElement("p");
randomPara.classList.add("end-para");
randomPara.textContent = "Or place ships randomly";
const random = document.createElement("button");
random.classList.add("button");
random.textContent = "Random";
random.addEventListener("click", () => {
  random.classList.add("active");
  verticalBtn.classList.remove("active");
  horizontalBtn.classList.remove("active");
  randomPara.classList.add("hidden");
  buttonsPara.classList.add("hidden");
  redoPara.classList.remove("hidden");
  startPara.classList.remove("hidden");
  shipsArr.forEach((ship) => {
    let success = false;
    while (success === false) {
      try {
        const { point, direction } = randomPlacement();
        humanPlayer.gameboard.placeShip(ship, point, direction);
        success = true;
      } catch (e) {
        console.log(e);
      }
    }
  });
  shipsArr = [];
  if (shipsArr.length === 0) {
    verticalBtn.classList.add("hidden");
    horizontalBtn.classList.add("hidden");
    random.classList.add("hidden");
    redo.classList.remove("hidden");
    start.classList.remove("hidden");
  }
  console.log(humanPlayer.gameboard.occupied);
  humanPlayer.gameboard.occupied.forEach((box) => {
    const findSquare = Array.from(grid.querySelectorAll(".square")).find(
      (square) => {
        return square.vertex[0] == box[0][0] && square.vertex[1] == box[0][1];
      },
    );
    findSquare.classList.add("ship-box");
  });
});
const redoPara = document.createElement("p");
redoPara.classList.add("hidden");
redoPara.classList.add("end-para");
redoPara.textContent = "Redo Placement";

const redo = document.createElement("button");
redo.classList.add("hidden");
redo.classList.add("button");
redo.textContent = "Redo";
redo.addEventListener("click", () => {
  humanPlayer = new Player("human");
  shipsArr = [];
  carrierShip = new Ship(5);
  battleShip = new Ship(4);
  destroyerShip = new Ship(3);
  submarineShip = new Ship(3);
  patrolShip = new Ship(2);
  shipsArr.push(
    carrierShip,
    battleShip,
    destroyerShip,
    patrolShip,
    submarineShip,
  );
  buildGrid(grid);
  shipsArr.forEach((ship) => {
    let success = false;
    while (success === false) {
      try {
        const { point, direction } = randomPlacement();
        humanPlayer.gameboard.placeShip(ship, point, direction);
        success = true;
      } catch (e) {
        console.log(e);
      }
    }
  });
  shipsArr = [];
  if (shipsArr.length === 0) {
    verticalBtn.classList.add("hidden");
    horizontalBtn.classList.add("hidden");
    random.classList.add("hidden");
    redo.classList.remove("hidden");
    start.classList.remove("hidden");
  }
  humanPlayer.gameboard.occupied.forEach((box) => {
    const findSquare = Array.from(grid.querySelectorAll(".square")).find(
      (square) => {
        return square.vertex[0] == box[0][0] && square.vertex[1] == box[0][1];
      },
    );
    findSquare.classList.add("ship-box");
  });
});
const startPara = document.createElement("p");
startPara.classList.add("hidden");
startPara.classList.add("end-para");
startPara.textContent = "Or start game";
const start = document.createElement("button");
start.classList.add("hidden");
start.classList.add("button");
start.textContent = "Start";
start.addEventListener("click", () => {
  buttons.classList.add("hidden");
});
buttonsBox.append(verticalBtn, horizontalBtn);
buttons.append(
  buttonsPara,
  buttonsBox,
  randomPara,
  random,
  redoPara,
  redo,
  startPara,
  start,
);
boards.append(myBoard, buttons, enemyBoard);
hits.append(hitsNo, hitsWord);
misses.append(missesNo, missesWord);
sunk.append(sunkNo, sunkWord);
remaining.append(remainingNo, remainingWord);
statsBar.append(hits, misses, sunk, remaining);
logoBadge.append(newGameBtn, howToBtn);
nav.append(logo, logoBadge);
container.append(nav, statsBar, boards);
endgame.append(endgameTitle, endgamePara, endGameBtn);
overlay.append(howTo);
overlay2.append(endgame);

export { container, overlay, overlay2 };
