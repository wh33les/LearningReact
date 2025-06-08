/**
 * CONNECT FOUR GAME COMPONENT
 * 
 * This is a fully functional Connect Four game built with React.
 * Features include:
 * - 6x7 game board (standard Connect Four dimensions)
 * - Two-player gameplay (red vs yellow)
 * - Win detection in all directions (horizontal, vertical, diagonal)
 * - Visual feedback (hover effects, winning piece highlighting)
 * - Audio feedback for moves and wins
 * - Game reset functionality
 * 
 * Learning concepts demonstrated:
 * - React functional components and hooks (useState)
 * - Complex state management with nested arrays
 * - Event handling (onClick, onMouseEnter, onMouseLeave)
 * - Conditional rendering and dynamic CSS classes
 * - Audio integration in React
 * - Game logic algorithms (win detection)
 * - Immutable state updates (important React principle)
 */

// Import React library and the useState hook for managing component state
import React, { useState } from "react";
// Import the CSS file that contains all styling for this Connect Four game
import "./c4appstyles.css";

// ===== AUDIO SETUP =====
// Preload audio files for various game events
// Using process.env.PUBLIC_URL ensures paths work correctly when deployed
const pieceSound = new Audio(process.env.PUBLIC_URL + "/sounds/piece.mp3");  // Sound when dropping a piece
const winXSound = new Audio(process.env.PUBLIC_URL + "/sounds/win-x.mp3");   // Sound when red player wins
const winOSound = new Audio(process.env.PUBLIC_URL + "/sounds/win-o.mp3");   // Sound when yellow player wins

// ===== GAME CONSTANTS =====
// Define the board dimensions as constants for easy modification and clarity
const ROWS = 6;    // Standard Connect Four has 6 rows
const COLS = 7;    // Standard Connect Four has 7 columns

/**
 * MAIN CONNECT FOUR COMPONENT
 * 
 * This is the main component that manages the entire Connect Four game.
 * It handles all game state, user interactions, and game logic.
 */
const ConnectFour = () => {
    // ===== STATE MANAGEMENT =====
    // React useState hooks to manage all game state

    /**
     * BOARD STATE
     * Creates a 2D array representing the game board:
     * - Array(ROWS) creates an array with 6 elements
     * - .fill(null) fills each element with null
     * - .map(() => Array(COLS).fill(null)) replaces each null with a new array of 7 nulls
     * Result: [[null,null,null,null,null,null,null], [null,null,null,null,null,null,null], ...]
     * This represents a 6x7 grid where null = empty space, "red"/"yellow" = player pieces
     */
    const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));

    /**
     * CURRENT PLAYER STATE
     * Tracks whose turn it is. In Connect Four, red traditionally goes first.
     * Will alternate between "red" and "yellow" after each move.
     */
    const [currentPlayer, setCurrentPlayer] = useState("red");

    /**
     * WINNER STATE
     * Tracks if there's a winner. Starts as null (no winner).
     * When someone wins, this will be set to "red" or "yellow".
     * Used to prevent further moves and display winner message.
     */
    const [winner, setWinner] = useState(null);

    /**
     * HOVERED COLUMN STATE
     * Tracks which column the user is hovering over for visual feedback.
     * Used to show preview of where piece would drop.
     */
    const [hoveredCol, setHoveredCol] = useState(null);

    /**
     * WINNING CELLS STATE
     * Stores the coordinates of the four pieces that won the game.
     * Used to highlight the winning pieces with special styling.
     * Format: [[row, col], [row, col], [row, col], [row, col]]
     */
    const [winningCells, setWinningCells] = useState([]);

    /**
     * DROP PIECE FUNCTION
     * 
     * This function handles when a player clicks on a column to drop a piece.
     * It implements the core Connect Four gameplay mechanics.
     * 
     * @param {number} col - The column index (0-6) where the player wants to drop their piece
     */
    const dropPiece = (col) => {
        // GUARD CLAUSE: Prevent moves if game is already won
        if (winner) return;

        // FIND AVAILABLE ROW
        // Loop through rows from bottom to top (ROWS-1 down to 0)
        // This simulates gravity - pieces fall to the lowest available space
        for (let row = ROWS - 1; row >= 0; row--) {
            // Check if this position is empty (null means empty)
            if (!board[row][col]) {
                // IMMUTABLE STATE UPDATE
                // Create a deep copy of the board to avoid mutating state directly
                // This is crucial in React for proper re-rendering and debugging
                const newBoard = board.map((r) => [...r]);  // Map creates new array, spread operator copies each row

                // Place the current player's piece in the found position
                newBoard[row][col] = currentPlayer;

                // Update the board state with the new configuration
                setBoard(newBoard);

                // AUDIO FEEDBACK
                // Create a new Audio instance to allow overlapping sounds
                // Using .src ensures we get a fresh audio instance each time
                const pieceSoundInstance = new Audio(pieceSound.src);
                pieceSoundInstance.play().catch(console.error); // Handle potential audio play failures

                // WIN DETECTION
                // Check if this move resulted in a win
                const winPositions = checkWinner(newBoard, row, col, currentPlayer);
                if (winPositions) {
                    // GAME WON
                    setWinner(currentPlayer);           // Mark the current player as winner
                    setWinningCells(winPositions);      // Store winning positions for highlighting

                    // Play appropriate victory sound based on winner
                    if (currentPlayer === "red") {
                        const winXSoundInstance = new Audio(winXSound.src);
                        winXSoundInstance.play().catch(console.error);
                    } else {
                        const winOSoundInstance = new Audio(winOSound.src);
                        winOSoundInstance.play().catch(console.error);
                    }
                }

                // SWITCH PLAYERS
                // Use ternary operator to alternate between "red" and "yellow"
                setCurrentPlayer(currentPlayer === "red" ? "yellow" : "red");

                // EXIT FUNCTION
                // Return here to stop checking higher rows once piece is placed
                return;
            }
        }
        // If we reach here, the column is full (no empty spaces found)
        // The function does nothing in this case (could add feedback in future)
    };

    /**
     * WIN DETECTION ALGORITHM
     * 
     * This function checks if the last move resulted in a win.
     * It only checks from the position of the last placed piece,
     * making it efficient (O(1) instead of checking entire board).
     * 
     * @param {Array} board - The current game board state
     * @param {number} row - Row of the last placed piece
     * @param {number} col - Column of the last placed piece  
     * @param {string} player - The player who just moved ("red" or "yellow")
     * @returns {Array|null} - Array of winning cell coordinates, or null if no win
     */
    const checkWinner = (board, row, col, player) => {
        // DIRECTION VECTORS
        // Define the four possible winning directions in Connect Four:
        // Each direction is represented by two vectors (positive and negative)
        const directions = [
            [[0, 1], [0, -1]],   // Horizontal: right and left
            [[1, 0], [-1, 0]],   // Vertical: down and up  
            [[1, 1], [-1, -1]],  // Diagonal \: down-right and up-left
            [[1, -1], [-1, 1]],  // Diagonal /: down-left and up-right
        ];

        // CHECK EACH DIRECTION
        for (let [[dr1, dc1], [dr2, dc2]] of directions) {
            let count = 1;                    // Start with 1 (the piece just placed)
            let winningCells = [[row, col]];  // Track all cells in this potential winning line

            // CHECK BOTH DIRECTIONS FROM THE PLACED PIECE
            // We check both positive and negative directions for each axis
            for (let [dr, dc] of [[dr1, dc1], [dr2, dc2]]) {
                let r = row + dr;  // Start from adjacent cell
                let c = col + dc;

                // TRAVERSE IN THIS DIRECTION
                // Keep going while:
                // 1. We're within board boundaries
                // 2. The cell contains the same player's piece
                while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                    winningCells.push([r, c]);  // Add this cell to potential winning line
                    count++;                     // Increment consecutive piece count

                    // Move to next cell in this direction
                    r += dr;
                    c += dc;
                }
            }

            // CHECK FOR WIN CONDITION
            // Connect Four requires 4 consecutive pieces
            if (count >= 4) {
                return winningCells;  // Return the coordinates of winning pieces
            }
        }

        // NO WIN FOUND
        return null;
    };

    // ===== COMPONENT RENDER =====
    /**
     * JSX RETURN
     * 
     * This renders the entire Connect Four game interface.
     * Includes game status, board, and restart button.
     */
    return (
        <div>
            {/* GAME STATUS DISPLAY */}
            <div className="c4-status">
                <h3>
                    {/* CONDITIONAL RENDERING: Show different content based on game state */}
                    {winner ? (
                        // WINNER ANNOUNCEMENT
                        <span className="player-indicator">
                            Winner:
                            {/* Visual piece indicator showing winner's color */}
                            <span className={`piece ${winner}`}></span>
                        </span>
                    ) : (
                        // CURRENT TURN INDICATOR  
                        <span className="player-indicator">
                            Next player:
                            {/* Visual piece indicator showing current player's color */}
                            <span className={`piece ${currentPlayer}`}></span>
                        </span>
                    )}
                </h3>
            </div>

            {/* GAME BOARD RENDERING */}
            <div className="c4board">
                {/* 
                MAP OVER ROWS
                board.map creates a React element for each row
                rowIndex is automatically provided by map function
                */}
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="row">
                        {/* 
                        MAP OVER COLUMNS IN EACH ROW
                        Creates individual cells for the game board
                        */}
                        {row.map((cell, colIndex) => {
                            // HOVER DETECTION
                            // Check if this column is currently being hovered
                            const isHovered = hoveredCol === colIndex;

                            return (
                                <div
                                    key={colIndex}
                                    // DYNAMIC CSS CLASSES
                                    // Combines base class with conditional classes based on cell state
                                    className={`cell ${cell || (isHovered ? "hovered" : "empty")}`}

                                    // MOUSE EVENT HANDLERS
                                    // Provide visual feedback when hovering over columns
                                    onMouseEnter={() => setHoveredCol(colIndex)}  // Set hover state
                                    onMouseLeave={() => setHoveredCol(null)}      // Clear hover state

                                    // CLICK HANDLER
                                    // Attempt to drop piece in this column when clicked
                                    onClick={() => dropPiece(colIndex)}
                                >
                                    {/* 
                                    PIECE RENDERING
                                    Only render a piece if the cell contains one
                                    Also check if this piece is part of the winning line
                                    */}
                                    {cell && (
                                        <div
                                            className={`piece ${cell} ${
                                                // WINNING PIECE HIGHLIGHTING
                                                // Check if this cell's coordinates match any winning cell
                                                winningCells.some(c => c[0] === rowIndex && c[1] === colIndex)
                                                    ? 'winning'
                                                    : ''
                                                }`}
                                        ></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* RESTART BUTTON */}
            <button
                className="c4-button"
                onClick={() => {
                    // RESET ALL GAME STATE
                    // Return everything to initial values for a new game
                    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));  // Clear board
                    setWinner(null);                   // Clear winner
                    setCurrentPlayer("red");           // Reset to first player
                    setWinningCells([]);              // Clear winning highlights
                    setHoveredCol(null);              // Clear hover state
                }}
            >
                Restart Game
            </button>
        </div>
    );
};

// EXPORT COMPONENT
// Export the ConnectFour component as default for use in other files
export default ConnectFour;