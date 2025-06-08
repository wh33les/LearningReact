/**
 * ADVANCED TIC-TAC-TOE GAME COMPONENT
 * 
 * This is an enhanced version of the basic tic-tac-toe game with advanced features
 * that demonstrate sophisticated React patterns and modern web development techniques.
 * 
 * Advanced features implemented:
 * - Audio feedback system with preloaded sounds
 * - Animated SVG winning line overlay with stroke animation
 * - Enhanced move history with coordinate tracking
 * - Performance optimization with React.useMemo
 * - Modern dark theme with CSS custom properties
 * - Hover effects and visual state management
 * - Complex component composition and prop drilling
 * - Advanced state management patterns
 * 
 * React concepts demonstrated:
 * - useEffect hook for side effects (audio preloading)
 * - useMemo hook for performance optimization
 * - useState hook for complex state management
 * - Component composition with multiple child components
 * - Event handling with audio integration
 * - Conditional rendering with complex logic
 * - SVG integration and animation
 * - CSS-in-JS concepts with dynamic styling
 * 
 * Web development concepts:
 * - Audio API integration and management
 * - SVG graphics and animation
 * - CSS custom properties (variables)
 * - Performance optimization techniques
 * - Accessibility considerations
 * - Modern ES6+ JavaScript features
 */

// ===== REACT HOOKS IMPORTS =====
/**
 * React Hooks for state management and side effects
 * 
 * useEffect: Manages side effects (audio preloading, animation triggers)
 * useMemo: Optimizes performance by memoizing expensive calculations
 * useState: Manages component state (game state, UI state)
 */
import { useEffect, useMemo, useState } from "react";

// ===== STYLESHEET IMPORT =====
/**
 * Component-specific styles
 * 
 * Contains all CSS for the advanced tic-tac-toe game including:
 * - Dark theme styling with CSS custom properties
 * - Grid layout for the game board
 * - Button styling with hover effects
 * - SVG overlay positioning and animation
 * - Responsive design considerations
 */
import "./app2styles.css";

// ===== AUDIO SYSTEM SETUP =====
/**
 * PRELOADED GAME AUDIO FILES
 * 
 * Audio files are created at module level (outside component) to prevent
 * recreation on every render. This improves performance and ensures
 * consistent audio behavior across game sessions.
 * 
 * process.env.PUBLIC_URL: React environment variable that provides the
 * correct path to public assets regardless of deployment configuration
 */

/**
 * Move sound effects - played when players make moves
 */
const xSound = new Audio(process.env.PUBLIC_URL + "/sounds/x.mp3");    // X player move sound
const oSound = new Audio(process.env.PUBLIC_URL + "/sounds/o.mp3");    // O player move sound

/**
 * Victory sound effects - played when games are won
 */
const winXSound = new Audio(process.env.PUBLIC_URL + "/sounds/win-x.mp3");  // X player victory
const winOSound = new Audio(process.env.PUBLIC_URL + "/sounds/win-o.mp3");  // O player victory

/**
 * Game end sound effect - played for draw games
 */
const drawSound = new Audio(process.env.PUBLIC_URL + "/sounds/draw.mp3");   // Draw game sound

// ===== COMPONENT DEFINITIONS =====

/**
 * SQUARE COMPONENT
 * 
 * Enhanced version of the basic square with additional features:
 * - Winning square highlighting
 * - Empty square detection for hover effects
 * - Dynamic CSS class management
 * - Accessibility improvements
 * 
 * @param {Object} props - Component properties
 * @param {string|null} props.value - Square content ('X', 'O', or null)
 * @param {Function} props.onSquareClick - Click event handler
 * @param {boolean} props.isWinningSquare - Whether this square is part of winning line
 * @returns {JSX.Element} Enhanced game square button
 */
function Square({ value, onSquareClick, isWinningSquare }) {
  // EMPTY STATE DETECTION
  // Used for applying hover effects only to clickable (empty) squares
  const isEmpty = value === null;

  return (
    <button
      // DYNAMIC CSS CLASS COMPOSITION
      // Combines multiple CSS classes based on square state:
      // - 'mysquare': Base styling for all squares
      // - 'my-winning-square': Applied only to winning squares
      // - 'empty': Applied only to empty squares (enables hover effects)
      className={`mysquare ${isWinningSquare ? "my-winning-square" : ""} ${isEmpty ? "empty" : ""}`}

      // EVENT HANDLER
      // Calls parent-provided function when square is clicked
      onClick={onSquareClick}
    >
      {/* SQUARE CONTENT */}
      {/* Displays 'X', 'O', or nothing based on value */}
      {value}
    </button>
  );
}

/**
 * BOARD COMPONENT
 * 
 * Manages the game board display, user interactions, and game status.
 * This component orchestrates the core game experience.
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.xIsNext - Whether X player goes next
 * @param {Array} props.squares - Current board state (9-element array)
 * @param {Function} props.onPlay - Callback when move is made
 * @param {Array} props.history - Complete game history
 * @param {number} props.currentMove - Current move number
 * @returns {JSX.Element} Complete game board with status and overlay
 */
function Board({ xIsNext, squares, onPlay, history, currentMove }) {

  /**
   * MOVE HANDLING FUNCTION
   * 
   * Processes player moves with validation and state updates.
   * Implements game rules and prevents invalid moves.
   * 
   * @param {number} i - Index of clicked square (0-8)
   */
  function handleClick(i) {
    // MOVE VALIDATION
    // Prevent moves if:
    // 1. Square is already occupied
    // 2. Game has already been won
    if (squares[i] || calculateWinner(squares)[0]) {
      return; // Exit early for invalid moves
    }

    // IMMUTABLE STATE UPDATE
    // Create new array instead of modifying existing state
    // Essential for React's change detection and debugging
    const nextSquares = squares.slice();

    // PLACE PLAYER MARK
    // Determine which symbol to place based on turn order
    nextSquares[i] = xIsNext ? "X" : "O";

    // PROPAGATE CHANGE TO PARENT
    // Pass new state and move position to parent component
    onPlay(nextSquares, i);
  }

  // GAME STATE ANALYSIS
  // Calculate current game status and winning information
  const [winningPlayer, winningLine] = calculateWinner(squares);

  // STATUS MESSAGE GENERATION
  let status;
  if (winningPlayer) {
    // VICTORY CONDITION
    status = "Winner: " + winningPlayer;
  } else if (currentMove === history.length - 1 && history.length === 10) {
    // DRAW CONDITION
    // All 9 squares filled (history length 10 includes initial empty state)
    status = "Draw!";
  } else {
    // GAME IN PROGRESS
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  // COMPONENT RENDER
  return (
    <>
      {/* GAME STATUS DISPLAY */}
      <div className="my-status">
        <h3>{status}</h3>
      </div>

      {/* BOARD CONTAINER WITH OVERLAY SYSTEM */}
      <div className="board-container">
        {/* WINNING LINE ANIMATION OVERLAY */}
        <WinningOverlay winningLine={winningLine} />

        {/* GAME BOARD GRID */}
        <div className="board">
          {/* DYNAMIC SQUARE GENERATION */}
          {squares.map((square, index) => {
            // WINNING SQUARE DETECTION
            // Check if current square is part of winning line
            const isWinningSquare = winningLine?.includes(index);

            return (
              <Square
                key={index}                                    // React key for list reconciliation
                value={square}                                // Square content (X, O, or null)
                onSquareClick={() => handleClick(index)}      // Click handler with closure
                isWinningSquare={isWinningSquare}            // Winning state for styling
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

/**
 * MAIN GAME COMPONENT
 * 
 * Top-level component that manages the complete game experience including:
 * - Game state and history management
 * - Audio system integration
 * - Move navigation and time travel
 * - Performance optimization
 * - User interface coordination
 * 
 * @returns {JSX.Element} Complete advanced tic-tac-toe game
 */
export default function Game() {
  // ===== STATE MANAGEMENT =====

  /**
   * SELECTED MOVE TRACKING
   * 
   * Tracks when user jumps to a specific move for UI feedback.
   * Used to display "restarted at move #X" message.
   */
  const [selectedMove, setSelectedMove] = useState(null);

  // ===== AUDIO SYSTEM INITIALIZATION =====

  /**
   * AUDIO PRELOADING EFFECT
   * 
   * Preloads all audio files when component mounts to ensure smooth playback.
   * Uses useEffect with empty dependency array to run only once.
   */
  useEffect(() => {
    // PRELOAD ALL AUDIO FILES
    [xSound, oSound, winXSound, winOSound, drawSound].forEach((sound) => {
      sound.load(); // Browser API to preload audio file
    });
  }, []); // Empty dependency array = run once on mount

  // ===== GAME STATE MANAGEMENT =====

  /**
   * GAME HISTORY STATE
   * 
   * Maintains complete game history with move positions.
   * Each entry contains:
   * - squares: Board state after the move
   * - position: [row, col] coordinates of the move
   */
  const [history, setHistory] = useState([
    {
      squares: Array(9).fill(null),    // Initial empty board
      position: [null, null]           // No position for initial state
    }
  ]);

  /**
   * CURRENT MOVE STATE
   * 
   * Index into history array representing current viewing position.
   * Enables time travel through game history.
   */
  const [currentMove, setCurrentMove] = useState(0);

  /**
   * MOVE LIST ORDERING STATE
   * 
   * Controls display order of move history (ascending/descending).
   */
  const [isAscending, setIsAscending] = useState(true);

  // ===== DERIVED STATE CALCULATIONS =====

  /**
   * CURRENT PLAYER CALCULATION
   * 
   * Determines active player based on move count.
   * Even moves = X's turn, Odd moves = O's turn
   */
  const xIsNext = currentMove % 2 === 0;

  /**
   * CURRENT BOARD STATE
   * 
   * Extracts board configuration for current move with fallback.
   */
  const currentSquares = history[currentMove]?.squares || Array(9).fill(null);

  // ===== GAME ACTION HANDLERS =====

  /**
   * MOVE PROCESSING FUNCTION
   * 
   * Handles new moves with audio feedback and history management.
   * Integrates game logic with audio system and state updates.
   * 
   * @param {Array} nextSquares - New board state after move
   * @param {number} index - Square index where move was made
   */
  function handlePlay(nextSquares, index) {
    // HISTORY UPDATE WITH TIME TRAVEL SUPPORT
    // When jumping back in time and making new move, discard "future" history
    const nextHistory = [
      ...history.slice(0, currentMove + 1),     // Keep history up to current point
      {
        squares: nextSquares,
        position: squareCoords(index)          // Add new move with coordinates
      }
    ];

    // STATE UPDATES
    setHistory(nextHistory);                       // Update game history
    setCurrentMove(nextHistory.length - 1);       // Jump to latest move

    // AUDIO FEEDBACK FOR MOVES
    // Play different sounds for X and O moves
    if (xIsNext) {
      xSound.play().catch(console.error);       // Handle audio play failures gracefully
    } else {
      oSound.play().catch(console.error);
    }

    // GAME END AUDIO FEEDBACK
    // Check for victory or draw conditions and play appropriate sounds
    const [winningPlayer] = calculateWinner(nextSquares);

    if (winningPlayer === "X") {
      winXSound.play().catch(console.error);     // X victory sound
    } else if (winningPlayer === "O") {
      winOSound.play().catch(console.error);     // O victory sound
    } else if (nextHistory.length === 10) {
      drawSound.play().catch(console.error);     // Draw game sound
    }
  }

  /**
   * TIME TRAVEL FUNCTION
   * 
   * Allows jumping to any previous game state.
   * Demonstrates React's ability to recreate any historical state.
   * 
   * @param {number} nextMove - Move number to jump to
   */
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);     // Update current viewing position
    setSelectedMove(nextMove);    // Track jump for UI feedback
  }

  /**
   * MOVE ORDER TOGGLE FUNCTION
   * 
   * Switches between ascending and descending move list display.
   */
  function toggleOrder() {
    setIsAscending(!isAscending);
  }

  // ===== MOVE HISTORY GENERATION =====

  /**
   * MOVE LIST CREATION
   * 
   * Generates interactive move history with detailed information.
   * Each move shows coordinates and provides jump functionality.
   */
  let moves = history.map((moveData, move) => {
    const { position } = moveData;

    // MOVE DESCRIPTION GENERATION
    let description;
    if (move === history.length - 1) {
      description = `You are at move #${move}.`;     // Current position
    } else if (move > 0) {
      description = `Go to move #${move}.`;          // Previous moves
    } else {
      description = "Go to game start.";             // Initial state
    }

    // PLAYER IDENTIFICATION
    // Determine which player made this move
    const player = move % 2 === 0 ? "O" : "X";

    return (
      <li key={move}>
        {/* CONDITIONAL BUTTON RENDERING */}
        {move === 0 && move !== history.length - 1 ? (
          // GAME START BUTTON (when not current)
          <button className="mybutton" onClick={() => jumpTo(move)}>
            {description}
          </button>
        ) : move === history.length - 1 ? (
          // CURRENT MOVE (text only, no button)
          description
        ) : (
          // HISTORICAL MOVES (clickable buttons)
          <button className="mybutton" onClick={() => jumpTo(move)}>
            {description}
          </button>
        )}

        {/* MOVE COORDINATE DISPLAY */}
        {/* Show position if move placed a piece */}
        {position[0] !== null ?
          ` (${player}: Row ${position[0] + 1}, Col ${position[1] + 1})` :
          ''
        }
      </li>
    );
  });

  // APPLY SORTING PREFERENCE
  if (!isAscending) {
    moves.reverse();
  }

  // ===== PERFORMANCE OPTIMIZATION =====

  /**
   * MEMOIZED BOARD COMPONENT
   * 
   * Uses React.useMemo to prevent unnecessary re-renders of the board.
   * Only recalculates when dependencies (currentSquares, currentMove) change.
   * 
   * Performance benefits:
   * - Reduces render cycles
   * - Prevents expensive DOM operations
   * - Improves game responsiveness
   * - Optimizes SVG animation performance
   */
  const board = useMemo(() => (
    <Board
      xIsNext={xIsNext}
      squares={currentSquares}
      onPlay={handlePlay}
      history={history}
      currentMove={currentMove}
    />
  ), [currentSquares, currentMove]); // Dependencies for memoization

  // ===== COMPONENT RENDER =====

  return (
    <div className="game">
      {/* GAME BOARD SECTION */}
      <div className="game-board">
        {board} {/* Render memoized board component */}
      </div>

      {/* GAME CONTROLS AND HISTORY */}
      <div className="my-game-info">
        {/* MOVE ORDER TOGGLE */}
        <button className="desc-button" onClick={toggleOrder}>
          {isAscending ? "Show Descending" : "Show Ascending"}
        </button>

        {/* HISTORY SECTION HEADER */}
        <h4><u>History:</u></h4>

        {/* MOVE LIST */}
        <ul>{moves}</ul>

        {/* JUMP FEEDBACK MESSAGE */}
        {selectedMove !== null && (
          <p className="move-info">
            <i><b>(restarted at move #{selectedMove})</b></i>
          </p>
        )}
      </div>
    </div>
  );
}

// ===== UTILITY FUNCTIONS =====

/**
 * WIN DETECTION ALGORITHM
 * 
 * Analyzes board state to determine if there's a winner.
 * Returns both the winning player and the winning line coordinates.
 * 
 * @param {Array} squares - Current board state (9 elements)
 * @returns {Array} [winner, winningLine] - Winner ('X'|'O'|null) and line coordinates
 */
function calculateWinner(squares) {
  // ALL POSSIBLE WINNING COMBINATIONS
  const lines = [
    [0, 1, 2],    // Top row
    [3, 4, 5],    // Middle row
    [6, 7, 8],    // Bottom row
    [0, 3, 6],    // Left column
    [1, 4, 7],    // Middle column
    [2, 5, 8],    // Right column
    [0, 4, 8],    // Diagonal: top-left to bottom-right
    [2, 4, 6],    // Diagonal: top-right to bottom-left
  ];

  // CHECK EACH WINNING COMBINATION
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];

    // WINNING CONDITION CHECK
    if (squares[a] &&                      // Position a is occupied
      squares[a] === squares[b] &&       // Positions a and b match
      squares[a] === squares[c]) {       // Positions a and c match

      return [squares[a], lines[i]];     // Return winner and winning line
    }
  }

  return [null, null]; // No winner found
}

/**
 * COORDINATE CONVERSION UTILITY
 * 
 * Converts linear square index to 2D grid coordinates.
 * Used for displaying move positions in human-readable format.
 * 
 * @param {number} i - Square index (0-8)
 * @returns {Array} [row, col] - Zero-indexed coordinates
 */
function squareCoords(i) {
  const row = Math.trunc(i / 3);    // Integer division for row
  const col = i % 3;                // Remainder for column
  return [row, col];
}

/**
 * WINNING OVERLAY COMPONENT
 * 
 * Creates an animated SVG overlay that highlights the winning line.
 * Features smooth stroke animation using CSS transitions and SVG techniques.
 * 
 * @param {Object} props - Component properties
 * @param {Array|null} props.winningLine - Array of winning square indices
 * @returns {JSX.Element|null} Animated SVG overlay or null
 */
function WinningOverlay({ winningLine }) {
  // ANIMATION STATE MANAGEMENT
  const [dashOffset, setDashOffset] = useState(null);

  // ANIMATION TRIGGER EFFECT
  useEffect(() => {
    if (winningLine) {
      setDashOffset(null);                          // Reset animation
      setTimeout(() => setDashOffset(0), 50);       // Trigger animation with delay
    }
  }, [winningLine]); // Re-run when winning line changes

  // EARLY RETURN FOR NO WINNER
  if (!winningLine) return null;

  // ===== SVG COORDINATE CALCULATIONS =====

  // LAYOUT CONSTANTS
  const squareSize = 100;                    // Size of each game square
  const boardSize = 3 * squareSize;          // Total board size
  const padding = 50;                        // Extra space around board

  // WINNING LINE COORDINATE MAPPING
  // Convert square indices to pixel coordinates
  const rowCoords = winningLine.map(index =>
    Math.floor(index / 3) * squareSize + squareSize / 2
  );
  const colCoords = winningLine.map(index =>
    (index % 3) * squareSize + squareSize / 2
  );

  // ELLIPSE CENTER CALCULATION
  // Find center point of winning line for ellipse positioning
  const centerX = (Math.min(...colCoords) + Math.max(...colCoords)) / 2;
  const centerY = (Math.min(...rowCoords) + Math.max(...rowCoords)) / 2;

  // ===== ELLIPSE DIMENSION CALCULATION =====

  let ellipseWidth, ellipseHeight, rotation = 0;

  if (rowCoords[0] === rowCoords[1]) {
    // HORIZONTAL WINNING LINE
    ellipseWidth = squareSize * 3.2;       // Wide ellipse
    ellipseHeight = squareSize * 1.2;      // Narrow height
  } else if (colCoords[0] === colCoords[1]) {
    // VERTICAL WINNING LINE  
    ellipseWidth = squareSize * 1.2;       // Narrow width
    ellipseHeight = squareSize * 3.2;      // Tall ellipse
  } else {
    // DIAGONAL WINNING LINE
    ellipseWidth = squareSize * 4.2;       // Extra wide for diagonal
    ellipseHeight = squareSize * 1.5;      // Medium height
    rotation = winningLine[0] === 0 ? 45 : -45; // Rotation direction
  }

  // ===== ANIMATION CALCULATION =====

  /**
   * ELLIPSE CIRCUMFERENCE ESTIMATION
   * 
   * Uses Ramanujan's approximation for ellipse perimeter.
   * More accurate than simple π(a+b) formula.
   * Used for stroke-dasharray animation effect.
   */
  const circumference = Math.PI * (
    3 * (ellipseWidth + ellipseHeight) -
    Math.sqrt((3 * ellipseWidth + ellipseHeight) * (ellipseWidth + 3 * ellipseHeight))
  );

  // ===== SVG RENDER =====

  return (
    <svg
      className="winning-overlay"
      width={boardSize + 2 * padding}
      height={boardSize + 2 * padding}
      viewBox={`-${padding} -${padding} ${boardSize + 2 * padding} ${boardSize + 2 * padding}`}
    >
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={ellipseWidth / 2}
        ry={ellipseHeight / 2}

        // STYLING
        stroke="var(--accent-color)"              // Use CSS custom property
        strokeWidth="5"
        fill="transparent"

        // ANIMATION PROPERTIES
        strokeDasharray={circumference}           // Dash length = full circumference
        strokeDashoffset={dashOffset === null ? circumference : dashOffset}

        // ROTATION FOR DIAGONALS
        transform={`rotate(${rotation}, ${centerX}, ${centerY})`}

        // CSS TRANSITION
        style={{
          transition: dashOffset === null ? "none" : "stroke-dashoffset 1s ease-out",
        }}
      />
    </svg>
  );
}

/**
 * ARCHITECTURAL NOTES
 * 
 * This advanced tic-tac-toe implementation demonstrates several
 * important software development concepts:
 * 
 * 1. PROGRESSIVE ENHANCEMENT
 *    - Builds upon basic tic-tac-toe with advanced features
 *    - Maintains core functionality while adding enhancements
 *    - Shows evolution from simple to complex
 * 
 * 2. PERFORMANCE OPTIMIZATION
 *    - Uses React.useMemo for expensive components
 *    - Manages audio resources efficiently
 *    - Optimizes re-rendering patterns
 * 
 * 3. USER EXPERIENCE DESIGN
 *    - Audio feedback for actions
 *    - Visual animations for game events
 *    - Comprehensive game state communication
 * 
 * 4. CODE ORGANIZATION
 *    - Clear separation of concerns
 *    - Modular component design
 *    - Comprehensive documentation
 * 
 * 5. MODERN WEB STANDARDS
 *    - CSS custom properties for theming
 *    - SVG for scalable graphics
 *    - Modern JavaScript features
 *    - Accessibility considerations
 * 
 * This implementation serves as an excellent example of how to build
 * sophisticated web applications using React and modern web technologies.
 */