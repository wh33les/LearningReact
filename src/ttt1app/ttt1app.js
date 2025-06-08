// Import the useState hook from React
import { useState } from "react";
// Import the CSS for styling the app
import "./app1styles.css";

// Square component renders an individual square (button) in the board
function Square({ value, onSquareClick, isWinningSquare }) {
  return (
    // Render a button with a conditional className if it's a winning square
    <button className={`square ${isWinningSquare ? "winning-square" : ""}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

// Board component handles rendering the game board and managing game logic
function Board({ xIsNext, squares, onPlay, history, currentMove }) {

  // handleClick is called when a player clicks on a square
  function handleClick(i) {
    // Prevent moves if the square is already filled or there's a winner
    if (squares[i] || calculateWinner(squares)[0]) {
      return;
    }
    const nextSquares = squares.slice(); // Copy current squares to avoid direct mutation
    nextSquares[i] = xIsNext ? "X" : "O"; // Set the value of the square based on the current player
    onPlay(nextSquares, i); // Pass the updated squares and index to onPlay function
  }

  // Calculate the winner and the winning line
  const [winningPlayer, winningLine] = calculateWinner(squares);
  let status;  // Define the status of the game
  if (winningPlayer) {
    status = "Winner: " + winningPlayer;  // If there's a winner, show the winner
  } else if (currentMove === history.length - 1 && history.length === 10) {
    status = "Draw!";  // If it's a draw, show "Draw!"
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O"); // Show the next player (X or O)
  }

  return (
    <>
      <div className="status">{status}</div>  {/* Display the status */}
      {Array(3).fill(null).map((_, row) => (  // Loop to create rows of squares
        <div className="board-row" key={row}>
          {Array(3).fill(null).map((_, col) => {  // Loop to create individual squares in each row
            const index = row * 3 + col;  // Calculate the index of the square
            const isWinningSquare = winningLine?.includes(index); // Check if the square is part of the winning line
            return (
              // Render each square and pass necessary props
              <Square
                key={index}
                value={squares[index]}  // Set the value of the square
                onSquareClick={() => handleClick(index)}  // Handle click for each square
                isWinningSquare={isWinningSquare}  // Highlight winning squares
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

// Main Game component
export default function Game() {
  // State for keeping track of the history of the game (moves made and positions)
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), position: [null, null] }]);
  const [currentMove, setCurrentMove] = useState(0);  // Tracks the current move
  const [isAscending, setIsAscending] = useState(true);  // Sort order for moves
  const xIsNext = currentMove % 2 === 0;  // Determines if it's X's or O's turn
  const currentSquares = history[currentMove]?.squares || Array(9).fill(null);  // Get the current state of the squares

  // Function to handle the play, update history and current move
  function handlePlay(nextSquares, index) {
    const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, position: squareCoords(index) }];
    setHistory(nextHistory);  // Update history with the new move
    setCurrentMove(nextHistory.length - 1);  // Set current move to the latest move
  }

  // Jump to a specific move in the history
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  // Toggle between ascending and descending order of moves
  function toggleOrder() {
    setIsAscending(!isAscending);
  }

  // Generate a list of moves to display
  let moves = history.map((moveData, move) => {
    const { position } = moveData;
    let description;
    if (move === history.length - 1) {
      description = "You are at move #" + move;  // Show current move
    } else if (move > 0) {
      description = "Go to move #" + move;  // Show other moves
    } else {
      description = "Go to game start";  // Option to jump to the start of the game
    }

    const player = move % 2 === 0 ? "O" : "X";  // Determine which player made the move

    return (
      <li key={move}>
        {move === 0 && move !== history.length - 1 ? (
          <button className="button" onClick={() => jumpTo(move)}>{description}</button>
        ) : move === history.length - 1 ? (
          description
        ) : (
          <button className="button" onClick={() => jumpTo(move)}>{description}</button>
        )}
        {/* Display position if available */}
        {position[0] !== null ? ` (${player}: Row ${position[0] + 1}, Col ${position[1] + 1})` : ''}
      </li>
    );
  });

  // Reverse the order of moves if descending is selected
  if (!isAscending) {
    moves.reverse();
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} history={history} currentMove={currentMove} />
      </div>
      <div className="game-info">
        <button onClick={toggleOrder}>
          {isAscending ? "Show Descending" : "Show Ascending"}
        </button>
        <ol>{moves}</ol>  {/* Display the list of moves */}
      </div>
    </div>
  );
}

// Function to calculate the winner based on current board state
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Horizontal lines
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Vertical lines
    [0, 4, 8], [2, 4, 6],  // Diagonal lines
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], lines[i]];  // Return the winner and the winning line
    }
  }
  return [null, null];  // Return null if no winner
}

// Function to calculate the coordinates (row, col) of a square based on its index
function squareCoords(i) {
  const row = Math.trunc(i / 3);  // Calculate the row based on index
  const col = i % 3;  // Calculate the column based on index
  return [row, col];  // Return the coordinates
}
