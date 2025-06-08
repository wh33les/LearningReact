/**
 * AUTOMATED TIMESTAMP INJECTION SCRIPT FOR REACT DEPLOYMENT
 * 
 * This script solves a fundamental limitation of React applications deployed to GitHub Pages:
 * Unlike plain HTML sites where document.lastModified reflects when files were actually edited,
 * React apps go through a build process that creates fresh HTML files, making document.lastModified
 * show the build time rather than the deployment time.
 * 
 * PROBLEM SOLVED:
 * - React build process breaks file modification timestamp tracking
 * - GitHub Pages serves pre-built files, losing deployment context
 * - Need to show actual deployment time, not build time
 * 
 * SOLUTION:
 * - Inject current timestamp into lastmodified.html after build
 * - Replicate the exact behavior of plain HTML project sites
 * - Maintain consistency across portfolio projects
 * 
 * USAGE:
 * - Automatically executed by npm predeploy script
 * - Runs after build but before deployment to GitHub Pages
 * - No manual intervention required
 * 
 * INTEGRATION:
 * - Called by package.json predeploy script: "npm run build && node update-timestamp.js"
 * - Works with existing jQuery-based timestamp loading system
 * 
 * @author Ashley K. W. Warren
 * @created June 2025
 * @purpose Portfolio project deployment automation
 */

// ===== REQUIRED NODE.JS MODULES =====

/**
 * FILE SYSTEM MODULE
 * 
 * Provides file read/write operations for modifying the built HTML file
 * Used to inject deployment timestamp into the lastmodified.html file
 */
const fs = require('fs');

/**
 * PATH MODULE
 * 
 * Handles file path operations across different operating systems
 * Ensures compatibility between Windows/macOS/Linux development environments
 */
const path = require('path');

// ===== TIMESTAMP INJECTION PROCESS =====

/**
 * TARGET FILE PATH CONSTRUCTION
 * 
 * Points to the lastmodified.html file in the React build output directory
 * This file gets deployed to GitHub Pages and loaded dynamically by the main page
 * 
 * Path structure: /build/lastmodified.html (created during React build process)
 */
const timestampFile = path.join(__dirname, 'build', 'lastmodified.html');

/**
 * DEPLOYMENT TIMESTAMP GENERATION
 * 
 * Creates a JavaScript Date object representing the exact moment of deployment
 * This timestamp will be injected into the HTML file and displayed on the live site
 * 
 * Format: Uses JavaScript's default Date.toString() to match other portfolio sites
 * Example output: "Mon Jun 09 2025 14:30:15 GMT-0600 (Mountain Daylight Time)"
 */
const now = new Date();

/**
 * DYNAMIC HTML CONTENT GENERATION
 * 
 * Creates JavaScript code that replicates the exact behavior of plain HTML sites
 * This approach maintains consistency with other portfolio projects that use
 * document.lastModified for timestamp display
 * 
 * TECHNICAL APPROACH:
 * - Creates a Date object from the deployment timestamp string
 * - Uses the same variable names and structure as plain HTML sites
 * - Applies .italics() formatting to match existing site styling
 * - Directly manipulates DOM element with id="lastmodified"
 * 
 * WHY THIS WORKS:
 * - Bypasses React build process limitations
 * - Provides actual deployment time instead of build time
 * - Maintains visual and functional consistency across portfolio
 */
const content = `<script>
   var date = "${now}";
   var lastModifiedDate = new Date(date);
   var lastmodified = "<hr>Last modified: ";
   document.getElementById("lastmodified").innerHTML = lastmodified.italics() + lastModifiedDate;
</script>`;

/**
 * FILE WRITE OPERATION
 * 
 * Overwrites the built lastmodified.html file with deployment-time timestamp
 * This happens after React build but before GitHub Pages deployment
 * 
 * PROCESS FLOW:
 * 1. React build creates static files in /build directory
 * 2. This script executes and updates timestamp file
 * 3. gh-pages deploys the updated files to GitHub Pages
 * 4. Live site shows actual deployment time
 * 
 * ERROR HANDLING:
 * - writeFileSync throws an error if write fails (intentional fail-fast behavior)
 * - Console output provides deployment verification
 */
fs.writeFileSync(timestampFile, content);

/**
 * DEPLOYMENT CONFIRMATION
 * 
 * Provides console feedback for deployment verification
 * Helps with debugging and confirms the script executed successfully
 * 
 * Output appears during npm run deploy process
 */
console.log(`✅ Updated timestamp file with: ${now}`);

/**
 * SCRIPT EXECUTION CONTEXT
 * 
 * This script is executed automatically by npm's predeploy hook:
 * 
 * package.json configuration:
 * {
 *   "scripts": {
 *     "predeploy": "npm run build && node update-timestamp.js",
 *     "deploy": "gh-pages -d build"
 *   }
 * }
 * 
 * When running "npm run deploy":
 * 1. npm automatically runs predeploy script first
 * 2. predeploy builds React app and updates timestamp
 * 3. deploy script pushes to GitHub Pages
 * 4. Live site reflects actual deployment time
 * 
 * INTEGRATION WITH EXISTING SYSTEM:
 * - Works with jQuery-based timestamp loading in main HTML
 * - Maintains compatibility with existing styling and layout
 * - Provides seamless user experience across portfolio projects
 */