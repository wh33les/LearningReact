import React, { useState } from "react"; // Import React and the useState hook
import "./c4appstyles.css"; // Import custom CSS styles for the Connect Four game

// Preload audio files for sounds used during the game
const pieceSound = new Audio(process.env.PUBLIC_URL + "/sounds/piece.mp3");
const winXSound = new Audio(process.env.PUBLIC_URL + "/sounds/win-x.mp3");
const winOSound = new Audio(process.env.PUBLIC_URL + "/sounds/win-o.mp3");

// Constants for the number of rows and columns on the board
const ROWS = 6;
const COLS = 7;

const ConnectFour = () => {
    // State variables for the game board, current player, winner, etc.
    const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    const [currentPlayer, setCurrentPlayer] = useState("red"); // Start with red as the first player
    const [winner, setWinner] = useState(null); // No winner initially
    const [hoveredCol, setHoveredCol] = useState(null); // Track the hovered column for visual feedback
    const [winningCells, setWinningCells] = useState([]); // Stores the winning cells, if any

    // Function to handle dropping a piece into a column
    const dropPiece = (col) => {
        if (winner) return; // Prevent further moves if there is already a winner

        // Loop through rows from bottom to top to find the first empty space in the selected column
        for (let row = ROWS - 1; row >= 0; row--) {
            if (!board[row][col]) {
                // Clone the board to update the state immutably
                const newBoard = board.map((r) => [...r]);
                newBoard[row][col] = currentPlayer; // Place the piece for the current player
                setBoard(newBoard); // Update the board state

                // Play the piece drop sound
                const pieceSoundInstance = new Audio(pieceSound.src);
                pieceSoundInstance.play();

                // Check if this move results in a win
                const winPositions = checkWinner(newBoard, row, col, currentPlayer);
                if (winPositions) {
                    setWinner(currentPlayer); // Set the winner if the player won
                    setWinningCells(winPositions); // Store the winning cells for highlighting
                    // Play the corresponding win sound based on the player
                    if (currentPlayer === "red") {
                        const winXSoundInstance = new Audio(winXSound.src);
                        winXSoundInstance.play();
                    } else {
                        const winOSoundInstance = new Audio(winOSound.src);
                        winOSoundInstance.play();
                    }
                }

                // Switch to the next player
                setCurrentPlayer(currentPlayer === "red" ? "yellow" : "red");
                return; // Stop once the piece is placed
            }
        }
    };

    // Function to check if there is a winner
    const checkWinner = (board, row, col, player) => {
        // Directions to check: horizontal, vertical, and two diagonals
        const directions = [
            [[0, 1], [0, -1]],   // Horizontal
            [[1, 0], [-1, 0]],   // Vertical
            [[1, 1], [-1, -1]],  // Diagonal \
            [[1, -1], [-1, 1]],  // Diagonal /
        ];

        // Loop through all directions
        for (let [[dr1, dc1], [dr2, dc2]] of directions) {
            let count = 1; // The current piece counts as 1
            let winningCells = [[row, col]]; // Start with the current piece as part of the winning line

            // Check both directions (positive and negative)
            for (let [dr, dc] of [[dr1, dc1], [dr2, dc2]]) {
                let r = row + dr, c = col + dc;
                // Keep moving in the direction as long as the same player's piece is found
                while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                    winningCells.push([r, c]);
                    count++; // Increment the count for each consecutive piece
                    r += dr;
                    c += dc;
                }
            }

            // If there are 4 consecutive pieces, return the winning cells' coordinates
            if (count >= 4) {
                return winningCells;
            }
        }
        return null; // No winner
    };

    // Render the game board and UI
    return (
        <div>
            {/* Display the current status of the game */}
            <div className="c4-status"><h3>
                {winner ? (
                    <span className="player-indicator">
                        Winner: <span className={`piece ${winner}`}></span> {/* Show winner's piece */}
                    </span>
                ) : (
                    <span className="player-indicator">
                        Next player: <span className={`piece ${currentPlayer}`}></span> {/* Show current player's piece */}
                    </span>
                )}
            </h3></div>

            {/* Render the Connect Four board */}
            <div className="c4board">
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="row">
                        {row.map((cell, colIndex) => {
                            // Check if this column is being hovered for visual feedback
                            const isHovered = hoveredCol === colIndex;

                            return (
                                <div
                                    key={colIndex}
                                    className={`cell ${cell || (isHovered ? "hovered" : "empty")}`} // Apply styles based on cell state
                                    onMouseEnter={() => setHoveredCol(colIndex)} // Show hover effect on mouse enter
                                    onMouseLeave={() => setHoveredCol(null)} // Remove hover effect on mouse leave
                                    onClick={() => dropPiece(colIndex)} // Drop piece when clicked
                                >
                                    {/* Render the piece if there is one in the cell, highlight winning pieces */}
                                    {cell && <div className={`piece ${cell} ${winningCells.some(c => c[0] === rowIndex && c[1] === colIndex) ? 'winning' : ''}`}></div>}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Button to restart the game */}
            <button className="c4-button" onClick={() => {
                // Reset the board and game state
                setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
                setWinner(null);
                setCurrentPlayer("red");
            }}>
                Restart Game
            </button>
        </div>
    );
};

export default ConnectFour; // Export the ConnectFour component for use in other parts of the app
