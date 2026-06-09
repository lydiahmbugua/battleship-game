class Ship {
  constructor(length) {
    this.length = length;
    this.hits = 0;
    this.sunk = false;
  }

  hit() {
    // FIXED: removed the erroneous `return` statement.
    // The original `return this.hits++` used post-increment, meaning it returned
    // the value BEFORE incrementing (e.g. 0 on the first hit). While isSunk()
    // still worked because it reads `this.hits` after the fact, returning the
    // pre-incremented value from a method called `hit()` is semantically wrong
    // and misleading to any caller. The return value was never used anyway, so
    // the `return` is simply dropped.
    this.hits++;
  }

  isSunk() {
    if (this.hits === this.length) {
      return (this.sunk = true);
    } else {
      return (this.sunk = false);
    }
  }
}

class Gameboard {
  constructor() {
    this.squares = [];
    this.missedAttacks = [];
    this.occupied = [];
    this.hits = [];
    this.buildBoard();
  }

  buildBoard() {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const square = new Square([i, j]);
        this.squares.push(square);
      }
    }
  }

  placeShip(ship, start, direction) {
    const originalStart = start;

    const checkBounds = (start) => {
      let counter = 0;
      while (counter < ship.length) {
        const correct = this.squares.find((square) => {
          return square.vertex[0] === start[0] && square.vertex[1] === start[1];
        });
        if (correct === undefined) {
          throw new Error("Out of Bounds!");
        } else {
          counter++;
          if (direction == "vertical") {
            start = [start[0] + 1, start[1]];
          } else {
            start = [start[0], start[1] + 1];
          }
        }
      }
      return true;
    };

    const fillSquares = (box) => {
      for (let i = 0; i < ship.length; i++) {
        this.occupied.push([box, ship]);
        if (direction == "vertical") {
          box = [box[0] + 1, box[1]];
        } else {
          box = [box[0], box[1] + 1];
        }
      }
    };

    const check = checkBounds(start);

    if (check == true) {
      if (this.occupied.length < 1) {
        fillSquares(originalStart);
      } else {
        start = originalStart;

        for (let i = 0; i < ship.length; i++) {
          for (let j = 0; j < this.occupied.length; j++) {
            if (
              this.occupied[j][0][0] == start[0] &&
              this.occupied[j][0][1] == start[1]
            ) {
              throw new Error("Square occupied");
            }
          }
          if (direction == "vertical") {
            start = [start[0] + 1, start[1]];
          } else {
            start = [start[0], start[1] + 1];
          }
        }
        fillSquares(originalStart);
      }
    }
  }

  getShipAt(box) {
    const search = this.occupied.find((square) => {
      return square[0][0] == box[0] && square[0][1] == box[1];
    });
    return search[1];
  }

  receiveAttack(coordinates) {
    console.log(coordinates);
    let hit = false;
    for (let i = 0; i < this.occupied.length; i++) {
      const box = this.occupied[i];
      if (coordinates[0] == box[0][0] && coordinates[1] == box[0][1]) {
        const checkHit = this.hits.find((square) => {
          return (
            Number(square[0]) === Number(coordinates[0]) &&
            Number(square[1]) === Number(coordinates[1])
          );
        });
        if (checkHit == undefined) {
          box[1].hit();
          hit = true;
          this.hits.push([coordinates[0], coordinates[1]]);
        } else {
          throw new Error("Square already hit!");
        }
        break;
      }
    }
    if (!hit) {
      const check = this.missedAttacks.find((square) => {
        return (
          Number(square[0]) === Number(coordinates[0]) &&
          Number(square[1]) === Number(coordinates[1])
        );
      });
      if (check == undefined) {
        this.missedAttacks.push(coordinates);
      } else {
        throw new Error("Square already hit!");
      }
    }
  }

  reportSunkShip() {
    const sunkBox = this.occupied.find((box) => box[1].sunk === true);
    if (sunkBox) {
      return "Ship has sunk!!";
    }
  }

  allSunk() {
    const uniqueShips = Array.from(new Set(this.occupied.map((box) => box[1])));
    return uniqueShips.every((ship) => ship.isSunk());
  }
}

class Square {
  constructor(vertex) {
    this.vertex = vertex;
  }
}

class Player {
  constructor(type) {
    this.gameboard = new Gameboard();
    this.type = type;
  }
}

export { Ship, Gameboard, Player };
