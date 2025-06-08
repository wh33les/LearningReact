/**
 * BASIC TIC-TAC-TOE GAME COMPONENT
 * 
 * This is a comprehensive tic-tac-toe game implementation based on the official React tutorial
 * with additional enhancements. It demonstrates fundamental React concepts and game programming.
 * 
 * Features implemented:
 * - 3x3 game board with clickable squares
 * - Two-player gameplay (X and O alternating)
 * - Win detection for all possible winning combinations
 * - Move history with ability to jump to any previous state
 * - Current move highlighting and position tracking
 * - Draw game detection
 * - Move list sorting (ascending/descending)
 * - Winning square highlighting
 * 
 * React concepts demonstrated:
 * - Functional components with hooks
 * - useState hook for state management
 * - Component composition and prop passing
 * - Event handling and user interaction
 * - Conditional rendering
 * - Lists and keys in React
 * - Immutable state updates
 * - Game state management patterns
 */

// Import the useState hook from React for managing component state
import { useState } from "react";
// Import CSS file containing all styles for this tic-tac-toe game
import "./app1styles.css";

/**
 * SQUARE COMPONENT
 * 
 * Represents a single square on the tic-tac-toe board.
 * This is a "controlled component" - it receives its value and click handler as props.
 * 
 * @param {Object} props - Component props
 * @param {string|null} props.value - The current value ('X', 'O', or null for empty)
 * @param {Function} props.onSquareClick - Function to call when square is clicked
 * @param {boolean} props.isWinningSquare - Whether this square is part of the winning line
 * @returns {JSX.Element} A button element representing the square
 */
function Square({ value, onSquareClick, isWinningSquare }) {
  return (
    <button
      // DYNAMIC CSS CLASSES
      // Combines base 'square' class with conditional 'winning-square' class
      // Template literal allows for dynamic class combination
      className={`square ${isWinningSquare ? "winning-square" : ""}`}

      // EVENT HANDLER
      // When clicked, call the function passed down from parent component
      onClick={onSquareClick}
    >
      {/* DISPLAY VALUE */}
      {/* Shows 'X', 'O', or nothing (if value is null) */}
      {value}
    </button>
  );
}

/**
 * BOARD COMPONENT
 * 
 * Manages the game board display and core game logic.
 * This component renders the 3x3 grid and handles square clicks.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.xIsNext - Whether X player should go next
 * @param {Array} props.squares - Array of 9 squares representing board state
 * @param {Function} props.onPlay - Callback when a move is made
 * @param {Array} props.history - Complete game history for game state analysis
 * @param {number} props.currentMove - Current move number for draw detection
 * @returns {JSX.Element} The complete game board with status
 */
function Board({ xIsNext, squares, onPlay, history, currentMove }) {

  /**
   * HANDLE SQUARE CLICK
   * 
   * Processes when a player clicks on a square to make a move.
   * Implements core game rules and validation.
   * 
   * @param {number} i - Index of the clicked square (0-8)
   */
  function handleClick(i) {
    // MOVE VALIDATION
    // Prevent moves if:
    // 1. Square is already occupied (squares[i] is truthy)
    // 2. Game is already won (calculateWinner returns a winner)
    if (squares[i] || calculateWinner(squares)[0]) {
      return; // Exit early - invalid move
    }

    // IMMUTABLE STATE UPDATE
    // Create a copy of squares array to avoid mutating state directly
    // This is crucial for React's change detection and debugging tools
    const nextSquares = squares.slice();

    // PLACE PLAYER'S MARK
    // Use ternary operator to place X or O based on whose turn it is
    nextSquares[i] = xIsNext ? "X" : "O";

    // NOTIFY PARENT COMPONENT
    // Pass the new board state and move position up to parent
    onPlay(nextSquares, i);
  }

  // GAME STATE ANALYSIS
  // Calculate current game status using the win detection algorithm
  const [winningPlayer, winningLine] = calculateWinner(squares);

  // STATUS MESSAGE GENERATION
  let status;
  if (winningPlayer) {
    // GAME WON
    status = "Winner: " + winningPlayer;
  } else if (currentMove === history.length - 1 && history.length === 10) {
    // DRAW GAME
    // All 9 squares filled (history length 10 includes initial state) and no winner
    status = "Draw!";
  } else {
    // GAME IN PROGRESS
    // Show whose turn it is next
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  // COMPONENT RENDER
  return (
    <>
      {/* GAME STATUS DISPLAY */}
      <div className="status">{status}</div>

      {/* GAME BOARD GENERATION */}
      {/* 
            Create 3 rows using Array(3).fill(null).map()
            This pattern creates [null, null, null] then maps over indices
            */}
      {Array(3).fill(null).map((_, row) => (
        <div className="board-row" key={row}>
          {/* 
                    Create 3 columns for each row
                    Same pattern creates 3 squares per row
                    */}
          {Array(3).fill(null).map((_, col) => {
            // CALCULATE SQUARE INDEX
            // Convert 2D coordinates (row, col) to 1D index (0-8)
            // Formula: row * 3 + col
            // Examples: (0,0)=0, (0,2)=2, (1,0)=3, (2,2)=8
            const index = row * 3 + col;

            // WIN HIGHLIGHTING
            // Check if this square is part of the winning line
            const isWinningSquare = winningLine?.includes(index);

            return (
              <Square
                key={index}                                    // Unique key for React reconciliation
                value={squares[index]}                        // Current square value (X, O, or null)
                onSquareClick={() => handleClick(index)}      // Click handler with index closure
                isWinningSquare={isWinningSquare}            // Winning square highlighting
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

/**
 * MAIN GAME COMPONENT
 * 
 * Top-level component that manages the entire tic-tac-toe game.
 * Handles game history, move navigation, and overall game state.
 * 
 * @returns {JSX.Element} Complete tic-tac-toe game interface
 */
export default function Game() {
  // ===== GAME STATE MANAGEMENT =====

  /**
   * GAME HISTORY STATE
   * 
   * Tracks the complete history of game states.
   * Each entry contains:
   * - squares: Array of 9 values representing the board
   * - position: [row, col] coordinates of the move that created this state
   * 
   * Starts with one entry representing the empty board
   */
  const [history, setHistory] = useState([
    {
      squares: Array(9).fill(null),    // Empty 3x3 board
      position: [null, null]           // No move for initial state
    }
  ]);

  /**
   * CURRENT MOVE STATE
   * 
   * Index into the history array representing which game state we're viewing.
   * Allows players to "time travel" through the game history.
   * 0 = initial empty board, 1 = after first move, etc.
   */
  const [currentMove, setCurrentMove] = useState(0);

  /**
   * MOVE LIST ORDERING STATE
   * 
   * Controls whether move history is displayed in ascending (true) or descending (false) order.
   * Allows players to view moves chronologically or reverse-chronologically.
   */
  const [isAscending, setIsAscending] = useState(true);

  // ===== DERIVED STATE =====
  // These values are calculated from the primary state above

  /**
   * CURRENT PLAYER CALCULATION
   * 
   * Determines whose turn it is based on move number.
   * Even moves (0, 2, 4, 6, 8) = X's turn
   * Odd moves (1, 3, 5, 7) = O's turn
   * This ensures X always goes first and players alternate correctly.
   */
  const xIsNext = currentMove % 2 === 0;

  /**
   * CURRENT BOARD STATE
   * 
   * Gets the board configuration for the currently selected move.
   * Uses optional chaining (?.) and nullish coalescing (??) for safety.
   * Falls back to empty board if history[currentMove] doesn't exist.
   */
  const currentSquares = history[currentMove]?.squares || Array(9).fill(null);

  /**
   * HANDLE PLAYER MOVE
   * 
   * Processes a new move by updating the game history.
   * This function maintains immutable state updates and handles time travel.
   * 
   * @param {Array} nextSquares - The new board state after the move
   * @param {number} index - The square index where the move was made
   */
  function handlePlay(nextSquares, index) {
    // CALCULATE MOVE POSITION
    // Convert square index to row/column coordinates for display
    const position = squareCoords(index);

    // UPDATE HISTORY WITH NEW MOVE
    // Key concept: When time traveling to an earlier move and making a new move,
    // we discard all "future" history and create a new timeline from that point
    const nextHistory = [
      ...history.slice(0, currentMove + 1),    // Keep history up to current move
      { squares: nextSquares, position }        // Add new move
    ];

    // UPDATE STATE
    setHistory(nextHistory);                      // Save new history
    setCurrentMove(nextHistory.length - 1);      // Jump to the new latest move
  }

  /**
   * TIME TRAVEL FUNCTION
   * 
   * Allows players to jump to any previous game state.
   * This demonstrates React's ability to recreate any previous state.
   * 
   * @param {number} nextMove - The move number to jump to (0-based index)
   */
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  /**
   * TOGGLE MOVE LIST ORDER
   * 
   * Switches between ascending and descending order for the move history display.
   * Provides a better user experience for reviewing game progression.
   */
  function toggleOrder() {
    setIsAscending(!isAscending);
  }

  // ===== MOVE HISTORY GENERATION =====

  /**
   * CREATE MOVE LIST
   * 
   * Generates a list of buttons/text for each move in the game history.
   * Each entry allows jumping to that game state or shows current position.
   */
  let moves = history.map((moveData, move) => {
    // EXTRACT MOVE DATA
    const { position } = moveData;

    // GENERATE MOVE DESCRIPTION
    let description;
    if (move === history.length - 1) {
      // CURRENT MOVE (latest in history)
      description = "You are at move #" + move;
    } else if (move > 0) {
      // PREVIOUS MOVES
      description = "Go to move #" + move;
    } else {
      // INITIAL STATE (move 0)
      description = "Go to game start";
    }

    // DETERMINE PLAYER FOR THIS MOVE
    // Even move numbers were made by O (since X starts and it's the previous move)
    // Odd move numbers were made by X
    const player = move % 2 === 0 ? "O" : "X";

    // CREATE LIST ITEM
    return (
      <li key={move}>
        {/* CONDITIONAL RENDERING FOR BUTTONS VS TEXT */}
        {move === 0 && move !== history.length - 1 ? (
          // GAME START BUTTON (when not current move)
          <button className="mybutton" onClick={() => jumpTo(move)}>
            {description}
          </button>
        ) : move === history.length - 1 ? (
          // CURRENT MOVE (no button, just text)
          description
        ) : (
          // PREVIOUS MOVES (clickable buttons)
          <button className="mybutton" onClick={() => jumpTo(move)}>
            {description}
          </button>
        )}

        {/* MOVE POSITION DISPLAY */}
        {/* Show coordinates if this move placed a piece (position[0] not null) */}
        {position[0] !== null ?
          ` (${player}: Row ${position[0] + 1}, Col ${position[1] + 1})` :
          ''
        }
      </li>
    );
  });

  // APPLY MOVE ORDER PREFERENCE
  // Reverse the moves array if user wants descending order
  if (!isAscending) {
    moves.reverse();
  }

  // ===== COMPONENT RENDER =====
  return (
    <div className="game">
      {/* GAME BOARD SECTION */}
      <div className="game-board">
        <Board
          xIsNext={xIsNext}           // Pass current player info
          squares={currentSquares}    // Pass current board state
          onPlay={handlePlay}         // Pass move handler
          history={history}           // Pass complete history for context
          currentMove={currentMove}   // Pass current move for status calculation
        />
      </div>

      {/* GAME CONTROLS AND HISTORY SECTION */}
      <div className="game-info">
        {/* MOVE ORDER TOGGLE BUTTON */}
        <button onClick={toggleOrder}>
          {isAscending ? "Show Descending" : "Show Ascending"}
        </button>

        {/* MOVE HISTORY LIST */}
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

// ===== UTILITY FUNCTIONS =====

/**
 * WIN DETECTION ALGORITHM
 * 
 * Determines if there's a winner on the current board.
 * Checks all possible winning combinations in tic-tac-toe.
 * 
 * @param {Array} squares - Array of 9 squares representing the board
 * @returns {Array} - [winner, winningLine] where winner is 'X'|'O'|null and winningLine is array of indices
 */
function calculateWinner(squares) {
  // WINNING COMBINATIONS
  // All possible ways to win in tic-tac-toe (rows, columns, diagonals)
  const lines = [
    // ROWS
    [0, 1, 2],    // Top row
    [3, 4, 5],    // Middle row  
    [6, 7, 8],    // Bottom row

    // COLUMNS
    [0, 3, 6],    // Left column
    [1, 4, 7],    // Middle column
    [2, 5, 8],    // Right column

    // DIAGONALS
    [0, 4, 8],    // Top-left to bottom-right
    [2, 4, 6],    // Top-right to bottom-left
  ];

  // CHECK EACH WINNING COMBINATION
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];    // Destructure the three positions

    // CHECK IF ALL THREE POSITIONS HAVE THE SAME NON-NULL VALUE
    if (squares[a] &&                           // Position a is not empty
      squares[a] === squares[b] &&            // Position a equals position b
      squares[a] === squares[c]) {            // Position a equals position c

      // WINNER FOUND
      return [squares[a], lines[i]];          // Return winner and winning positions
    }
  }

  // NO WINNER
  return [null, null];
}

/**
 * COORDINATE CONVERSION UTILITY
 * 
 * Converts a square index (0-8) to row/column coordinates for display.
 * 
 * @param {number} i - Square index (0-8)
 * @returns {Array} - [row, column] coordinates (0-indexed)
 * 
 * Examples:
 * squareCoords(0) returns [0, 0] (top-left)
 * squareCoords(4) returns [1, 1] (center)  
 * squareCoords(8) returns [2, 2] (bottom-right)
 */
function squareCoords(i) {
  const row = Math.trunc(i / 3);    // Integer division: 0-2→0, 3-5→1, 6-8→2
  const col = i % 3;                // Remainder: 0,3,6→0, 1,4,7→1, 2,5,8→2
  return [row, col];
}