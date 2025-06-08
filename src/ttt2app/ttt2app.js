import { useEffect, useMemo, useState } from "react"; // Import React hooks (useState, useEffect, useMemo)
import "./app2styles.css"; // Import the stylesheet for the app

// Preload sound files for different events in the game
const xSound = new Audio(process.env.PUBLIC_URL + "/sounds/x.mp3");
const oSound = new Audio(process.env.PUBLIC_URL + "/sounds/o.mp3");
const winXSound = new Audio(process.env.PUBLIC_URL + "/sounds/win-x.mp3");
const winOSound = new Audio(process.env.PUBLIC_URL + "/sounds/win-o.mp3");
const drawSound = new Audio(process.env.PUBLIC_URL + "/sounds/draw.mp3");

// Square component that renders individual squares on the board
function Square({ value, onSquareClick, isWinningSquare }) {
  const isEmpty = value === null;  // Check if the square is empty
  return (
    <button className={`mysquare ${isWinningSquare ? "my-winning-square" : ""} ${isEmpty ? "empty" : ""}`}
      onClick={onSquareClick}>
      {value}
    </button>
  );
}

// Board component responsible for rendering the Tic-Tac-Toe board
function Board({ xIsNext, squares, onPlay, history, currentMove }) {
  // Handle a square click event
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)[0]) {
      return; // Ignore if the square is already filled or if there's a winner
    }
    const nextSquares = squares.slice(); // Create a copy of the squares
    nextSquares[i] = xIsNext ? "X" : "O"; // Place X or O depending on the player's turn
    onPlay(nextSquares, i); // Pass the updated board to the parent component
  }

  // Calculate the winner and the winning line
  const [winningPlayer, winningLine] = calculateWinner(squares);
  let status;
  if (winningPlayer) {
    status = "Winner: " + winningPlayer; // Set status to winner
  } else if (currentMove === history.length - 1 && history.length === 10) {
    status = "Draw!"; // Set status to draw if the game is over
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O"); // Set status for the next player
  }

  return (
    <>
      <div className="my-status"><h3>{status}</h3></div> {/* Display the game status */}
      <div className="board-container">
        <WinningOverlay winningLine={winningLine} /> {/* Display the winning line overlay */}
        <div className="board">
          {squares.map((square, index) => { // Render squares
            const isWinningSquare = winningLine?.includes(index); // Check if the square is part of the winning line
            return (
              <Square
                key={index}
                value={square}
                onSquareClick={() => handleClick(index)}
                isWinningSquare={isWinningSquare}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function Game() {
  const [selectedMove, setSelectedMove] = useState(null); // Track the selected move for jumping

  // Preload all sound files once when the component mounts
  useEffect(() => {
    [xSound, oSound, winXSound, winOSound, drawSound].forEach((sound) => {
      sound.load(); // Preload the sound files
    });
  }, []); // Empty dependency array ensures this runs only once on mount

  // State management for game history, current move, and sorting order
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), position: [null, null] }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true); // Control the order of the move history (ascending/descending)
  const xIsNext = currentMove % 2 === 0; // Determine if X is the next player
  const currentSquares = history[currentMove]?.squares || Array(9).fill(null); // Get the current board state

  // Function to handle a move (play a turn)
  function handlePlay(nextSquares, index) {
    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, position: squareCoords(index) }
    ];
    setHistory(nextHistory); // Update history with the new move
    setCurrentMove(nextHistory.length - 1); // Set the current move to the latest move

    if (xIsNext) {
      xSound.play(); // Play sound for X if it's X's turn
    } else {
      oSound.play(); // Play sound for O if it's O's turn
    }

    const [winningPlayer] = calculateWinner(nextSquares); // Check if the move resulted in a winner

    if (winningPlayer === "X") {
      winXSound.play(); // Play winning sound for X
    } else if (winningPlayer === "O") {
      winOSound.play(); // Play winning sound for O
    } else if (nextHistory.length === 10) {
      drawSound.play(); // Play draw sound if the game ends in a draw
    }
  }

  // Function to jump to a specific move in history
  function jumpTo(nextMove) {
    setCurrentMove(nextMove); // Set the current move to the selected move
    setSelectedMove(nextMove); // Set the selected move for display
  }

  // Toggle the order of move history (ascending or descending)
  function toggleOrder() {
    setIsAscending(!isAscending);
  }

  // Generate the list of moves
  let moves = history.map((moveData, move) => {
    const { position } = moveData;
    let description;
    if (move === history.length - 1) {
      description = `You are at move #${move}.`; // Highlight the current move
    } else if (move > 0) {
      description = `Go to move #${move}.`; // Button to jump to previous moves
    } else {
      description = "Go to game start."; // Button to reset the game
    }

    const player = move % 2 === 0 ? "O" : "X"; // Determine which player made the move

    return (
      <li key={move}>
        {move === 0 && move !== history.length - 1 ? (
          <button className="mybutton" onClick={() => jumpTo(move)}>{description}</button>
        ) : move === history.length - 1 ? (
          description // Do not add a button for the current move
        ) : (
          <button className="mybutton" onClick={() => jumpTo(move)}>
            {description} {/* Button to go to specific moves */}
          </button>
        )}
        {position[0] !== null ? ` (${player}: Row ${position[0] + 1}, Col ${position[1] + 1})` : ''} {/* Show move coordinates */}
      </li>
    );
  });

  if (!isAscending) {
    moves.reverse(); // Reverse the list of moves if not in ascending order
  }

  // Memoize the board to prevent unnecessary re-renders
  const board = useMemo(() => (
    <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} history={history} currentMove={currentMove} />
  ), [currentSquares, currentMove]); // Recalculate board when currentSquares or currentMove changes

  return (
    <div className="game">
      <div className="game-board">
        {board} {/* Render the game board */}
      </div>
      <div className="my-game-info">
        <button className="desc-button" onClick={toggleOrder}>
          {isAscending ? "Show Descending" : "Show Ascending"} {/* Button to toggle history order */}
        </button>
        <p><h4><u>History:</u></h4></p>
        <ul>{moves}</ul> {/* Display the list of moves */}
        {selectedMove !== null && (
          <p className="move-info">
            <i><b>(restarted at move #{selectedMove})</b></i>
          </p> /* Show which move the game was restarted at */
        )}
      </div>
    </div>
  );
}

// Function to calculate the winner based on the squares' state
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], lines[i]]; // Return the winner and the winning line
    }
  }
  return [null, null]; // No winner
}

// Function to calculate the row and column coordinates of a square from its index
function squareCoords(i) {
  const row = Math.trunc(i / 3);
  const col = i % 3;
  return [row, col]; // Return the coordinates [row, column]
}

// Component that renders the overlay for the winning line
function WinningOverlay({ winningLine }) {
  const [dashOffset, setDashOffset] = useState(null); // State to handle stroke animation

  useEffect(() => {
    if (winningLine) {
      setDashOffset(null); // Reset dashOffset on winning line change
      setTimeout(() => setDashOffset(0), 50); // Trigger animation after a small delay
    }
  }, [winningLine]); // Only run when winningLine changes

  if (!winningLine) return null; // Return null if no winning line

  // Define board and square sizes
  const squareSize = 100;
  const boardSize = 3 * squareSize;
  const padding = 50; // Padding around the board for the SVG element

  // Calculate coordinates of the winning line's center
  const rowCoords = winningLine.map(index => Math.floor(index / 3) * squareSize + squareSize / 2);
  const colCoords = winningLine.map(index => (index % 3) * squareSize + squareSize / 2);

  const centerX = (Math.min(...colCoords) + Math.max(...colCoords)) / 2;
  const centerY = (Math.min(...rowCoords) + Math.max(...rowCoords)) / 2;

  // Determine the dimensions and rotation of the ellipse for the winning line
  let ellipseWidth, ellipseHeight, rotation = 0;
  if (rowCoords[0] === rowCoords[1]) {
    // Horizontal winning line
    ellipseWidth = squareSize * 3.2;
    ellipseHeight = squareSize * 1.2;
  } else if (colCoords[0] === colCoords[1]) {
    // Vertical winning line
    ellipseWidth = squareSize * 1.2;
    ellipseHeight = squareSize * 3.2;
  } else {
    // Diagonal winning line
    ellipseWidth = squareSize * 4.2;
    ellipseHeight = squareSize * 1.5;
    rotation = winningLine[0] === 0 ? 45 : -45; // Set rotation for diagonal lines
  }

  // Calculate the circumference of the ellipse for stroke animation
  const circumference = Math.PI * (3 * (ellipseWidth + ellipseHeight) - Math.sqrt((3 * ellipseWidth + ellipseHeight) * (ellipseWidth + 3 * ellipseHeight)));

  return (
    <svg
      className="winning-overlay"
      width={boardSize + 2 * padding}  // Increased size for SVG
      height={boardSize + 2 * padding} // Increased size for SVG
      viewBox={`-${padding} -${padding} ${boardSize + 2 * padding} ${boardSize + 2 * padding}`} // Adjust viewBox for padding
    >
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={ellipseWidth / 2}
        ry={ellipseHeight / 2}
        stroke="rgb(88 196 220)"
        strokeWidth="5"
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset === null ? circumference : dashOffset}
        transform={`rotate(${rotation}, ${centerX}, ${centerY})`} // Rotate the ellipse for diagonals
        style={{
          transition: dashOffset === null ? "none" : "stroke-dashoffset 1s ease-out",
        }}
      />
    </svg>
  );
}
