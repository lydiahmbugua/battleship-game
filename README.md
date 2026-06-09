# Battleship

A browser-based Battleship game built with vanilla JavaScript, HTML, and CSS. Play against a computer opponent in a classic 10×10 grid format.

## Live Demo

[Play Battleship](https://lydiahmbugua.github.io/battleship-game/) <!-- replace with your deployed URL -->

## Features

- 10×10 interactive game grids for both the player and computer
- Manual ship placement with horizontal and vertical orientation toggle
- Random ship placement with redo option
- Computer opponent with randomized attacks
- Real-time stats tracking — hits, misses, ships sunk, and ships remaining
- Win and lose detection with game over screen
- How to Play guide accessible at any time
- New Game button to reset and start fresh

## Tech Stack

- JavaScript (ES Modules)
- HTML5 & CSS3
- Webpack for bundling
- Jest & Babel for unit testing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
git clone https://github.com/lydiahmbugua/battleship-game.git
cd battleship-game
npm install
```

### Running the Development Server

```bash
npm run dev
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

## How to Play

1. Choose a direction — Horizontal or Vertical — then click squares on your board to place your ships, or click Random to place them automatically.
2. Click Redo to regenerate a random layout, or Start when you are happy with your placement.
3. Once ships are placed, click squares on the Enemy Board to attack.
4. The computer will automatically take its turn after yours.
5. Sink all 5 enemy ships to win — Carrier (5), Battleship (4), Destroyer (3), Submarine (3), and Patrol Boat (2).

## Project Structure

```
src/
├── game.js        # Ship, Gameboard, and Player classes
├── dom.js         # UI rendering and game logic
├── index.js       # Entry point
├── styles.css     # Styling
game.test.js       # Jest unit tests
template.html      # HTML template
webpack.dev.js     # Webpack dev config
webpack.prod.js    # Webpack production config
```

## Testing

Unit tests cover the core game logic classes:

- `Ship` — construction, hit tracking, and sunk detection
- `Gameboard` — ship placement, attack handling, missed attack tracking, and all-sunk detection
- `Player` — player types and gameboard ownership

Run tests with:

```bash
npm test
```

## Upcoming Features

The following features are currently in development:

### Dark Mode
A toggleable dark theme that switches the colour palette to deeper purples and blacks, reducing eye strain during extended play sessions. The current light lavender and pink design system will be preserved as the default.

### Two Player Mode
A local two-player mode where two people can play on the same device. Each player places their ships privately, then passes the device to their opponent to take turns attacking. The screen will be hidden between turns to prevent peeking at the opponent's board.

### Smart Computer Attacks
An upgraded computer AI using a hunt-and-target strategy. Instead of attacking randomly, the computer will switch to target mode after landing a hit — systematically attacking adjacent squares until the ship is sunk, then returning to hunt mode. This makes the computer a significantly more challenging opponent.

## License

ISC
