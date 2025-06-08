/**
 * REACT GAMES APPLICATION ENTRY POINT
 * 
 * This is the main entry point for the React Games application.
 * It demonstrates how to mount multiple React applications on a single page,
 * each targeting different DOM elements.
 * 
 * Architecture Pattern:
 * - Multi-app approach: Each game is a separate React application
 * - Independent rendering: Games don't share state or interfere with each other
 * - Modular design: Each game can be developed and maintained separately
 * - Flexible deployment: Games can be shown/hidden or deployed independently
 * 
 * React concepts demonstrated:
 * - createRoot API (React 18+)
 * - StrictMode for development best practices
 * - Multiple React app instances on one page
 * - Component importing and usage
 * - Global CSS integration
 * 
 * Learning value:
 * - Shows progression from basic to advanced React patterns
 * - Demonstrates real-world multi-component application structure
 * - Illustrates separation of concerns in React applications
 */

// ===== REACT CORE IMPORTS =====

/**
 * React and StrictMode imports
 * 
 * React: Core React library (needed for JSX and React features)
 * StrictMode: Development-only component that helps identify problems
 */
import React, { StrictMode } from "react";

/**
 * createRoot import from React DOM
 * 
 * createRoot is the new React 18+ API for rendering React applications.
 * It replaces the legacy ReactDOM.render() method and enables:
 * - Concurrent features
 * - Automatic batching
 * - Better error boundaries
 * - Improved performance
 * 
 * Legacy pattern (React 17 and below):
 * import ReactDOM from "react-dom";
 * ReactDOM.render(<App />, document.getElementById("root"));
 * 
 * Modern pattern (React 18+):
 * import { createRoot } from "react-dom/client";
 * const root = createRoot(document.getElementById("root"));
 * root.render(<App />);
 */
import { createRoot } from "react-dom/client";

// ===== GLOBAL STYLES IMPORT =====

/**
 * Global CSS import
 * 
 * This import applies styles globally across all React applications.
 * The CSS includes:
 * - CSS custom properties (variables)
 * - Base styles for typography and layout
 * - Utility classes used across components
 * - Dark theme foundation
 * 
 * Import order matters:
 * - Global styles should be imported before component styles
 * - This ensures proper CSS cascade and specificity
 */
import "./global.css";

// ===== GAME COMPONENT IMPORTS =====

/**
 * Game component imports
 * 
 * Each game is imported as a separate React component.
 * This modular approach allows for:
 * - Independent development of each game
 * - Easy addition/removal of games
 * - Clear separation of concerns
 * - Potential code splitting in the future
 */

/**
 * App1 - Basic Tic-Tac-Toe Game
 * 
 * The foundational tic-tac-toe implementation based on the React tutorial.
 * Features:
 * - Classic white board appearance
 * - Basic move history
 * - Win detection and highlighting
 * - Simple, clean interface
 * 
 * Learning focus: React fundamentals, state management, event handling
 */
import App1 from "./ttt1app/ttt1app";

/**
 * App2 - Advanced Tic-Tac-Toe Game
 * 
 * Enhanced version with additional features and modern styling.
 * Features:
 * - Dark theme with CSS variables
 * - Sound effects for moves and wins
 * - Animated winning line overlay
 * - Enhanced move history with coordinates
 * - Hover effects and smooth transitions
 * 
 * Learning focus: Advanced React patterns, CSS animations, audio integration
 */
import App2 from "./ttt2app/ttt2app";

/**
 * App3 - Connect Four Game
 * 
 * A different game genre showcasing game logic complexity.
 * Features:
 * - 6x7 game board with gravity simulation
 * - Two-player gameplay with piece dropping
 * - Win detection in four directions
 * - Visual hover effects and piece highlighting
 * - Game reset functionality
 * 
 * Learning focus: Complex game algorithms, 2D array manipulation, event handling
 */
import App3 from "./c4app/c4app";

// ===== APPLICATION RENDERING =====

/**
 * MULTI-APP RENDERING PATTERN
 * 
 * This section demonstrates how to render multiple React applications
 * on a single HTML page. Each app targets a different DOM element
 * and operates independently.
 * 
 * Benefits of this approach:
 * - Games don't interfere with each other
 * - Each game can have its own state management
 * - Easy to show/hide games individually
 * - Simpler than complex routing for this use case
 * - Each game can be tested independently
 */

/**
 * BASIC TIC-TAC-TOE APPLICATION MOUNT
 * 
 * Renders the basic tic-tac-toe game into the DOM element with id "rootttt1"
 */

// Create React root for the first tic-tac-toe game
const rootttt1 = createRoot(document.getElementById("rootttt1"));

// Render the basic tic-tac-toe app with StrictMode
rootttt1.render(
  <StrictMode>
    <App1 />
  </StrictMode>
);

/**
 * ADVANCED TIC-TAC-TOE APPLICATION MOUNT
 * 
 * Renders the advanced tic-tac-toe game into the DOM element with id "rootttt2"
 */

// Create React root for the second tic-tac-toe game
const rootttt2 = createRoot(document.getElementById("rootttt2"));

// Render the advanced tic-tac-toe app with StrictMode
rootttt2.render(
  <StrictMode>
    <App2 />
  </StrictMode>
);

/**
 * CONNECT FOUR APPLICATION MOUNT
 * 
 * Renders the Connect Four game into the DOM element with id "rootc4"
 */

// Create React root for the Connect Four game
const rootc4 = createRoot(document.getElementById("rootc4"));

// Render the Connect Four app with StrictMode
rootc4.render(
  <StrictMode>
    <App3 />
  </StrictMode>
);

/**
 * STRICT MODE EXPLANATION
 * 
 * StrictMode is a React development tool that:
 * 
 * 1. IDENTIFIES UNSAFE LIFECYCLES
 *    - Warns about deprecated lifecycle methods
 *    - Helps prepare for future React versions
 * 
 * 2. WARNING ABOUT LEGACY STRING REF API
 *    - Encourages modern ref patterns
 *    - Improves code maintainability
 * 
 * 3. WARNING ABOUT DEPRECATED FINDDOMNODE USAGE
 *    - Promotes better component design
 *    - Encourages ref usage instead
 * 
 * 4. DETECTING UNEXPECTED SIDE EFFECTS
 *    - Intentionally double-invokes functions to detect side effects
 *    - Helps identify non-pure functions
 * 
 * 5. DETECTING LEGACY CONTEXT API
 *    - Warns about old context usage
 *    - Encourages modern Context API
 * 
 * Important notes:
 * - StrictMode only runs in development
 * - It doesn't render any visible UI
 * - It helps catch problems early in development
 * - It's completely safe to use and recommended
 */

/**
 * DOM ELEMENT REQUIREMENTS
 * 
 * For this JavaScript to work, the HTML file must contain:
 * 
 * ```html
 * <div id="rootttt1"></div>   <!-- Basic Tic-Tac-Toe mount point -->
 * <div id="rootttt2"></div>   <!-- Advanced Tic-Tac-Toe mount point -->
 * <div id="rootc4"></div>     <!-- Connect Four mount point -->
 * ```
 * 
 * Each div serves as a mount point for its respective React application.
 */

/**
 * ERROR HANDLING CONSIDERATIONS
 * 
 * In a production application, you might want to add error handling:
 * 
 * ```javascript
 * const rootElement = document.getElementById("rootttt1");
 * if (rootElement) {
 *     const rootttt1 = createRoot(rootElement);
 *     rootttt1.render(<StrictMode><App1 /></StrictMode>);
 * } else {
 *     console.error("Could not find element with id 'rootttt1'");
 * }
 * ```
 */

/**
 * ALTERNATIVE ARCHITECTURES
 * 
 * Other approaches for organizing multiple games:
 * 
 * 1. SINGLE APP WITH ROUTING
 *    - Use React Router to navigate between games
 *    - Single root element with route-based rendering
 *    - Better for complex applications with shared state
 * 
 * 2. MICRO-FRONTEND APPROACH
 *    - Each game as a separate deployed application
 *    - Iframe or module federation integration
 *    - Better for large teams with independent deployment needs
 * 
 * 3. COMPONENT SWITCHING
 *    - Single React app with conditional rendering
 *    - State-based game selection
 *    - Simpler than routing for small applications
 * 
 * The current approach is optimal for:
 * - Learning projects
 * - Portfolio demonstrations
 * - Independent game development
 * - Simple deployment scenarios
 */

/**
 * PERFORMANCE CONSIDERATIONS
 * 
 * Current implications:
 * - Each game loads immediately (no lazy loading)
 * - All game JavaScript bundles together
 * - Suitable for small to medium applications
 * 
 * Potential optimizations:
 * - Code splitting with React.lazy()
 * - Conditional rendering based on visibility
 * - Service worker caching for repeat visits
 * - Bundle optimization and tree shaking
 */

/**
 * DEVELOPMENT WORKFLOW
 * 
 * This structure supports:
 * - Independent game development
 * - Easy testing of individual games
 * - Clear separation of concerns
 * - Simple build and deployment process
 * - Educational progression (basic → advanced concepts)
 */