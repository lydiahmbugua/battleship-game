import { Ship, Gameboard, Player } from "./game";

describe("Ship", () => {
  describe("construction", () => {
    test("creates a ship with the correct length", () => {
      const ship = new Ship(4);
      expect(ship.length).toBe(4);
    });

    test("starts with 0 hits", () => {
      const ship = new Ship(3);
      expect(ship.hits).toBe(0);
    });

    test("starts not sunk", () => {
      const ship = new Ship(3);
      expect(ship.isSunk()).toBe(false);
    });
  });

  describe("hit()", () => {
    test("increments the hit count by 1", () => {
      const ship = new Ship(3);
      ship.hit();
      expect(ship.hits).toBe(1);
    });

    test("accumulates multiple hits", () => {
      const ship = new Ship(3);
      ship.hit();
      ship.hit();
      expect(ship.hits).toBe(2);
    });
  });

  describe("isSunk()", () => {
    test("is not sunk when hits are fewer than length", () => {
      const ship = new Ship(3);
      ship.hit();
      ship.hit();
      expect(ship.isSunk()).toBe(false);
    });

    test("is sunk when hits equal length", () => {
      const ship = new Ship(3);
      ship.hit();
      ship.hit();
      ship.hit();
      expect(ship.isSunk()).toBe(true);
    });

    test("a length-1 ship sinks after one hit", () => {
      const ship = new Ship(1);
      ship.hit();
      expect(ship.isSunk()).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────
// GAMEBOARD
// ─────────────────────────────────────────────

describe("Gameboard", () => {
  let board;

  beforeEach(() => {
    board = new Gameboard();
  });

  // ── Placing ships ──────────────────────────
  describe("placeShip()", () => {
    test("places a ship horizontally without throwing", () => {
      expect(() =>
        board.placeShip(new Ship(3), [0, 0], "horizontal"),
      ).not.toThrow();
    });

    test("places a ship vertically without throwing", () => {
      expect(() =>
        board.placeShip(new Ship(3), [0, 0], "vertical"),
      ).not.toThrow();
    });

    test("throws (or signals) when placement is out of bounds", () => {
      // A length-4 ship starting at column 8 on a 10×10 board goes out of bounds
      expect(() =>
        board.placeShip(new Ship(4), [0, 8], "horizontal"),
      ).toThrow();
    });

    test("throws (or signals) when ships overlap", () => {
      board.placeShip(new Ship(3), [0, 0], "horizontal");
      expect(() =>
        board.placeShip(new Ship(3), [0, 0], "horizontal"),
      ).toThrow();
    });
  });

  // ── receiveAttack() ────────────────────────
  describe("receiveAttack()", () => {
    beforeEach(() => {
      // Place a length-3 ship at (0,0)→(0,2) horizontally
      board.placeShip(new Ship(3), [0, 0], "horizontal");
    });

    test("records a hit on a ship occupying the attacked coordinate", () => {
      board.receiveAttack([0, 0]);
      // The ship at that coordinate should have 1 hit
      const ship = board.getShipAt([0, 0]);
      expect(ship.hits).toBe(1);
    });

    test("records a miss when no ship occupies the coordinate", () => {
      board.receiveAttack([5, 5]);
      expect(board.missedAttacks).toContainEqual([5, 5]);
    });

    test("does not add a hit coordinate to missedAttacks", () => {
      board.receiveAttack([0, 1]);
      expect(board.missedAttacks).not.toContainEqual([0, 1]);
    });

    test("throws (or signals) on a duplicate attack", () => {
      board.receiveAttack([0, 0]);
      expect(() => board.receiveAttack([0, 0])).toThrow();
    });
  });

  // ── Missed attacks tracking ────────────────
  describe("missedAttacks", () => {
    test("starts empty", () => {
      expect(board.missedAttacks).toHaveLength(0);
    });

    test("accumulates multiple misses", () => {
      board.placeShip(2, [0, 0], "horizontal");
      board.receiveAttack([5, 5]);
      board.receiveAttack([6, 6]);
      expect(board.missedAttacks).toHaveLength(2);
    });
  });

  // ── allSunk() ──────────────────────────────
  describe("allSunk()", () => {
    test("returns false when no ships have been sunk", () => {
      board.placeShip(new Ship(2), [0, 0], "horizontal");
      expect(board.allSunk()).toBe(false);
    });

    test("returns false when only some ships are sunk", () => {
      board.placeShip(new Ship(1), [0, 0], "horizontal");
      board.placeShip(new Ship(2), [2, 0], "horizontal");
      board.receiveAttack([0, 0]); // sinks the length-1 ship
      expect(board.allSunk()).toBe(false);
    });

    test("returns true when every ship has been sunk", () => {
      board.placeShip(new Ship(1), [0, 0], "horizontal");
      board.placeShip(new Ship(2), [2, 0], "horizontal");
      board.receiveAttack([0, 0]);
      board.receiveAttack([2, 0]);
      board.receiveAttack([2, 1]);
      expect(board.allSunk()).toBe(true);
    });

    test("returns true even with a single ship", () => {
      board.placeShip(new Ship(2), [0, 0], "horizontal");
      board.receiveAttack([0, 0]);
      board.receiveAttack([0, 1]);
      expect(board.allSunk()).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────
// PLAYER
// ─────────────────────────────────────────────
describe("Player", () => {
  describe("real player", () => {
    let human;

    beforeEach(() => {
      human = new Player("human");
    });

    test('creates a player with type "human"', () => {
      expect(human.type).toBe("human");
    });

    test("has its own Gameboard instance", () => {
      expect(human.gameboard).toBeInstanceOf(Gameboard);
    });

    test("two players have different gameboards", () => {
      const other = new Player("human");
      expect(human.gameboard).not.toBe(other.gameboard);
    });
  });

  describe("computer player", () => {
    let computer;

    beforeEach(() => {
      computer = new Player("computer");
    });

    test('creates a player with type "computer"', () => {
      expect(computer.type).toBe("computer");
    });

    test("has its own Gameboard instance", () => {
      expect(computer.gameboard).toBeInstanceOf(Gameboard);
    });
  });
});

/*
    test("makeRandomAttack() attacks a valid coordinate on the target board", () => {
      const target = new Gameboard();
      computer.makeRandomAttack(target);
      // After one random attack, exactly one cell has been attacked:
      // either a miss was recorded, or a ship was hit (hits > 0 somewhere).
      const totalAttacked =
        target.missedAttacks.length +
        target.getAllShips().reduce((sum, s) => sum + s.hits, 0);
      expect(totalAttacked).toBe(1);
    });

    test("makeRandomAttack() never repeats a coordinate", () => {
      const target = new Gameboard();
      const totalCells = 100; // 10×10 board
      for (let i = 0; i < totalCells; i++) {
        computer.makeRandomAttack(target);
      }
      const allAttacked = [
        ...target.missedAttacks,
        ...target.getAllShips().flatMap((s) => s.hitCoordinates ?? []),
      ];
      const unique = new Set(allAttacked.map((c) => `${c[0]},${c[1]}`));
      expect(unique.size).toBe(totalCells);
    });
  });
});*/
