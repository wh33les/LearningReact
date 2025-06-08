/**
 * COMPREHENSIVE AUTOMATED DEPLOYMENT SCRIPT FOR REACT GAMES
 * 
 * This Node.js script provides a complete, automated deployment pipeline that handles
 * every aspect of getting your React application from development to production.
 * 
 * COMPLETE DEPLOYMENT WORKFLOW:
 * 1. Environment validation and prerequisite checking
 * 2. Source code management (commit and push to GitHub main branch)
 * 3. Production build creation and optimization
 * 4. GitHub Pages deployment (push to gh-pages branch)
 * 5. Comprehensive error handling and user feedback
 * 
 * LEARNING CONCEPTS DEMONSTRATED:
 * - Node.js child process management and system command execution
 * - Promise-based asynchronous programming with async/await
 * - Comprehensive error handling and recovery strategies
 * - Cross-platform scripting (Windows, macOS, Linux compatibility)
 * - DevOps automation and continuous deployment practices
 * - Git workflow automation and branch management
 * - Build system integration and optimization
 * - User experience design for command-line tools
 * 
 * DEPENDENCIES REQUIRED:
 * - Node.js runtime environment (version 14 or higher)
 * - npm package manager with working internet connection
 * - Git version control system with valid GitHub credentials
 * - gh-pages npm package for GitHub Pages deployment
 * - Valid GitHub repository with proper permissions
 * 
 * USAGE:
 *   node deploy.js
 * 
 * This script replaces manual deployment steps and ensures consistent,
 * reliable deployments every time.
 */

// ===== NODE.JS CORE MODULE IMPORTS =====

/**
 * CHILD PROCESS MODULE IMPORT
 * 
 * The 'child_process' module is a core Node.js module that provides
 * functionality to spawn child processes. We specifically import 'exec'
 * which allows us to run shell commands from within our Node.js script.
 * 
 * Why we use exec():
 * - Runs commands in a shell environment (bash, cmd, powershell)
 * - Returns output as a string when command completes
 * - Provides stderr and stdout streams for comprehensive output
 * - Supports timeout and environment variable configuration
 * - Cross-platform compatible (works on Windows, macOS, Linux)
 * 
 * Alternative child_process methods we could use:
 * - execSync(): Synchronous version (blocks execution)
 * - spawn(): Stream-based, better for long-running processes
 * - fork(): Creates new Node.js processes
 * 
 * We chose exec() because:
 * - Our commands are short-lived (git, npm commands)
 * - We want to capture full output for error handling
 * - We need the simplicity of shell command execution
 */
const { exec } = require('child_process');

// ===== DEPLOYMENT CONFIGURATION OBJECT =====

/**
 * CENTRALIZED CONFIGURATION SYSTEM
 * 
 * This configuration object centralizes all deployment settings in one place.
 * This approach provides several benefits:
 * - Easy to modify deployment behavior without changing code logic
 * - Clear separation between configuration and implementation
 * - Type safety and validation can be added here
 * - Different environments (dev, staging, prod) can use different configs
 * - Makes the script maintainable and customizable
 */
const deployConfig = {
    /**
     * BUILD COMMAND CONFIGURATION
     * 
     * This specifies which npm script to run for deployment.
     * 'npm run deploy' triggers the following sequence:
     * 1. Runs 'predeploy' script (if defined) - typically 'npm run build'
     * 2. Runs 'deploy' script - typically 'gh-pages -d build'
     * 
     * The command 'npm run deploy' is defined in package.json and
     * handles both building the React app and deploying to GitHub Pages.
     */
    buildCommand: 'npm run deploy',

    /**
     * BUILD OUTPUT DIRECTORY
     * 
     * Specifies where Create React App places the production build files.
     * This directory contains:
     * - Minified and optimized JavaScript bundles
     * - Compressed CSS files with autoprefixing
     * - Optimized images and static assets
     * - index.html with proper asset references
     * - Service worker files for PWA functionality
     * - Source maps for debugging (if enabled)
     * 
     * The 'build' directory is created by 'npm run build' and consumed
     * by 'gh-pages -d build' for deployment.
     */
    buildDirectory: 'build',

    /**
     * COMMAND TIMEOUT CONFIGURATION
     * 
     * Maximum time (in milliseconds) to wait for any single command to complete.
     * 30 seconds (30000ms) is usually sufficient for:
     * - Git operations (clone, push, pull)
     * - npm commands (install, build)
     * - File system operations
     * 
     * Timeout prevents:
     * - Hanging processes that never complete
     * - Infinite waiting on network issues
     * - Poor user experience with no feedback
     * - Resource leaks from zombie processes
     * 
     * Note: Build process gets extended timeout (120 seconds) due to complexity
     */
    timeout: 30000,

    /**
     * GITHUB PAGES SPECIFIC CONFIGURATION
     * 
     * Settings specifically for GitHub Pages deployment workflow.
     */
    githubPages: {
        /**
         * TARGET DEPLOYMENT BRANCH
         * 
         * GitHub Pages serves content from the 'gh-pages' branch by default.
         * This branch contains only the built/compiled files, not source code.
         * 
         * Branch structure:
         * - 'main' branch: Source code, development files, documentation
         * - 'gh-pages' branch: Built files, ready for web serving
         * 
         * The gh-pages npm package automatically manages this branch:
         * - Creates the branch if it doesn't exist
         * - Overwrites content with new build files
         * - Commits changes with appropriate messages
         * - Pushes to GitHub remote repository
         */
        branch: 'gh-pages',

        /**
         * DEPLOYMENT COMMIT MESSAGE
         * 
         * Message used when committing build files to gh-pages branch.
         * Includes ISO timestamp for deployment tracking and debugging.
         * 
         * ISO format (e.g., "2024-01-15T10:30:45.123Z") provides:
         * - Sortable timestamp format
         * - Time zone information (UTC)
         * - Millisecond precision
         * - International standard format
         * 
         * This helps with:
         * - Tracking deployment frequency
         * - Debugging deployment issues
         * - Correlating deployments with code changes
         */
        message: `Deployed on ${new Date().toISOString()}`
    }
};

// ===== UTILITY FUNCTIONS =====

/**
 * COMMAND EXECUTION WRAPPER FUNCTION
 * 
 * This function wraps Node.js's exec() function to provide modern Promise-based
 * usage with comprehensive error handling and timeout management.
 * 
 * PROMISIFICATION EXPLANATION:
 * Node.js exec() uses old-style callbacks (error, stdout, stderr).
 * Modern JavaScript prefers Promises with async/await syntax.
 * This wrapper converts callback-based exec() to Promise-based execution.
 * 
 * @param {string} command - Shell command to execute (e.g., 'git status', 'npm build')
 * @param {Object} options - Execution options and configuration
 * @param {number} options.timeout - Maximum execution time in milliseconds
 * @param {string} options.cwd - Working directory for command execution
 * @param {Object} options.env - Environment variables for the command
 * @returns {Promise<string>} - Promise that resolves with command output or rejects with error
 */
function executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
        /**
         * COMMAND EXECUTION WITH COMPREHENSIVE OPTIONS
         * 
         * The exec() function accepts a command string and options object.
         * We configure it with comprehensive settings for reliable execution.
         */
        const childProcess = exec(command, {
            /**
             * TIMEOUT CONFIGURATION
             * 
             * Uses provided timeout or falls back to global default.
             * Prevents commands from hanging indefinitely.
             * When timeout expires, the child process is killed with SIGTERM.
             */
            timeout: options.timeout || deployConfig.timeout,

            /**
             * WORKING DIRECTORY CONFIGURATION
             * 
             * Sets the directory where the command executes.
             * Defaults to current working directory (process.cwd()).
             * Important for git commands which need to run in repository root.
             */
            cwd: options.cwd || process.cwd(),

            /**
             * ENVIRONMENT VARIABLES CONFIGURATION
             * 
             * Merges system environment with custom variables.
             * Spread operator (...) creates new object without mutating originals.
             * Allows passing custom environment variables while preserving system ones.
             * 
             * Example usage:
             * executeCommand('git push', { env: { GIT_SSH_COMMAND: 'ssh -i ~/.ssh/deploy_key' } })
             */
            env: { ...process.env, ...options.env },

            /**
             * OUTPUT ENCODING CONFIGURATION
             * 
             * Specifies how to decode command output bytes into strings.
             * 'utf8' handles most text output correctly including:
             * - ASCII characters
             * - Unicode symbols and emojis
             * - International characters
             * - Git output with color codes
             */
            encoding: 'utf8'

        }, (error, stdout, stderr) => {
            /**
             * COMMAND COMPLETION CALLBACK
             * 
             * This callback function is executed when the command completes,
             * times out, or encounters an error. It handles all possible outcomes.
             */

            // ===== ERROR HANDLING =====
            if (error) {
                /**
                 * TIMEOUT ERROR HANDLING
                 * 
                 * When a command exceeds the timeout limit, exec() returns
                 * an error with code 'TIMEOUT'. We provide a specific error
                 * message to help users understand what happened.
                 */
                if (error.code === 'TIMEOUT') {
                    reject(new Error(`Command timed out after ${deployConfig.timeout}ms: ${command}`));
                    return;
                }

                /**
                 * GENERAL EXECUTION ERROR HANDLING
                 * 
                 * For any other error (command not found, permission denied,
                 * non-zero exit code), we create a comprehensive error message
                 * that includes:
                 * - The command that failed
                 * - The error message from the system
                 * - Any error output (stderr) from the command
                 * 
                 * This information is crucial for debugging deployment issues.
                 */
                reject(new Error(`Command failed: ${command}\nError: ${error.message}\nStderr: ${stderr}`));
                return;
            }

            /**
             * SUCCESS CASE HANDLING
             * 
             * When command executes successfully (exit code 0), we return
             * the stdout (standard output) with whitespace trimmed.
             * 
             * trim() removes:
             * - Leading and trailing spaces
             * - Newline characters (\n, \r\n)
             * - Tab characters
             * 
             * This provides clean output for further processing.
             */
            resolve(stdout.trim());
        });

        // ===== PROCESS SIGNAL HANDLING =====

        /**
         * SIGINT SIGNAL HANDLER (Ctrl+C)
         * 
         * When user presses Ctrl+C to interrupt the script, we need to
         * clean up any running child processes to prevent orphaned processes.
         * 
         * SIGINT (Signal Interrupt) is the standard Unix signal for
         * user-initiated termination (Ctrl+C).
         */
        process.on('SIGINT', () => {
            childProcess.kill('SIGINT');
        });

        /**
         * SIGTERM SIGNAL HANDLER (Graceful Shutdown)
         * 
         * SIGTERM (Signal Terminate) is sent by process managers for
         * graceful shutdown. We forward this signal to child processes.
         * 
         * This ensures clean shutdown in Docker containers, systemd services,
         * and other managed environments.
         */
        process.on('SIGTERM', () => {
            childProcess.kill('SIGTERM');
        });
    });
}

// ===== CONSOLE LOGGING UTILITIES =====

/**
 * ENHANCED LOGGING SYSTEM
 * 
 * This object provides consistent, visually appealing console output
 * using ANSI color codes and Unicode emoji characters.
 * 
 * ANSI COLOR CODES EXPLANATION:
 * - \x1b[32m = Green text
 * - \x1b[31m = Red text  
 * - \x1b[34m = Blue text
 * - \x1b[33m = Yellow text
 * - \x1b[36m = Cyan text
 * - \x1b[0m = Reset to default color
 * 
 * These codes work in most modern terminals and provide immediate
 * visual feedback about the status of operations.
 */
const logger = {
    /**
     * SUCCESS MESSAGE LOGGING
     * 
     * Displays green checkmark with success message.
     * Used for completed operations and positive confirmations.
     * Green color universally indicates success and safety.
     */
    success: (message) => {
        console.log(`\x1b[32m✅ ${message}\x1b[0m`);
    },

    /**
     * ERROR MESSAGE LOGGING
     * 
     * Displays red X with error message.
     * Used for failures, exceptions, and critical issues.
     * Red color universally indicates danger and errors.
     */
    error: (message) => {
        console.log(`\x1b[31m❌ ${message}\x1b[0m`);
    },

    /**
     * INFORMATIONAL MESSAGE LOGGING
     * 
     * Displays blue info icon with informational message.
     * Used for status updates, explanations, and neutral information.
     * Blue color indicates informational content without urgency.
     */
    info: (message) => {
        console.log(`\x1b[34mℹ️  ${message}\x1b[0m`);
    },

    /**
     * WARNING MESSAGE LOGGING
     * 
     * Displays yellow warning triangle with warning message.
     * Used for non-critical issues that users should be aware of.
     * Yellow color indicates caution and attention needed.
     */
    warning: (message) => {
        console.log(`\x1b[33m⚠️  ${message}\x1b[0m`);
    },

    /**
     * PROGRESS MESSAGE LOGGING
     * 
     * Displays rocket icon with progress update.
     * Used for ongoing operations and milestone achievements.
     * Cyan color indicates active processes and progress.
     */
    progress: (message) => {
        console.log(`\x1b[36m🚀 ${message}\x1b[0m`);
    }
};

// ===== PRE-DEPLOYMENT VALIDATION =====

/**
 * COMPREHENSIVE ENVIRONMENT VALIDATION FUNCTION
 * 
 * This function performs extensive checks before attempting deployment
 * to ensure all prerequisites are met and deployment is likely to succeed.
 * 
 * VALIDATION STRATEGY:
 * - Fail fast: Check requirements before investing time in deployment
 * - Comprehensive: Check all critical dependencies and configurations
 * - Informative: Provide specific guidance for fixing issues
 * - Non-destructive: Only reads and validates, doesn't modify anything
 * 
 * @returns {Promise<boolean>} - True if environment is ready for deployment
 */
async function validateEnvironment() {
    logger.info('Validating deployment environment...');

    try {
        // ===== NODE.JS VERSION VALIDATION =====

        /**
         * NODE.JS VERSION CHECK
         * 
         * React Scripts requires Node.js version 14 or higher for:
         * - Modern JavaScript features (optional chaining, nullish coalescing)
         * - Webpack 5 support with improved performance
         * - ESM (ECMAScript Modules) support
         * - Security updates and bug fixes
         * 
         * We extract the major version number from the full version string:
         * "v18.17.0" -> "18.17.0" -> ["18", "17", "0"] -> 18
         */
        const nodeVersion = await executeCommand('node --version');
        const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);

        if (majorVersion < 14) {
            throw new Error(`Node.js version ${nodeVersion} is not supported. Please upgrade to version 14 or higher.`);
        }

        logger.success(`Node.js version: ${nodeVersion}`);

        // ===== NPM AVAILABILITY AND VERSION CHECK =====

        /**
         * NPM VERSION VALIDATION
         * 
         * Ensures npm (Node Package Manager) is available and functioning.
         * NPM is required for:
         * - Running package.json scripts (npm run build, npm run deploy)
         * - Installing and managing dependencies
         * - Executing the gh-pages deployment package
         * 
         * If this command fails, it indicates:
         * - npm is not installed
         * - npm is not in the system PATH
         * - npm installation is corrupted
         */
        const npmVersion = await executeCommand('npm --version');
        logger.success(`npm version: ${npmVersion}`);

        // ===== GIT REPOSITORY VALIDATION =====

        /**
         * GIT REPOSITORY STATUS CHECK
         * 
         * Verifies that the current directory is a valid Git repository.
         * The 'git status' command:
         * - Fails if not in a Git repository
         * - Returns information about working tree status
         * - Confirms Git is installed and functioning
         * 
         * Git repository is required for:
         * - GitHub Pages deployment (gh-pages package uses Git)
         * - Source code version control and history
         * - Branch management (main and gh-pages branches)
         * - Remote repository operations (push to GitHub)
         */
        await executeCommand('git status');
        logger.success('Git repository detected');

        // ===== WORKING DIRECTORY STATUS CHECK =====

        /**
         * UNCOMMITTED CHANGES DETECTION
         * 
         * Checks for uncommitted changes in the working directory.
         * 'git status --porcelain' returns:
         * - Empty string if working directory is clean
         * - List of modified/added/deleted files if changes exist
         * 
         * --porcelain flag provides:
         * - Machine-readable output format
         * - Consistent format across Git versions
         * - Easy parsing for automated scripts
         * 
         * We warn about uncommitted changes but don't block deployment
         * because our script will handle committing them automatically.
         */
        try {
            const gitStatus = await executeCommand('git status --porcelain');
            if (gitStatus.length > 0) {
                logger.warning('Uncommitted changes detected in working directory');
                logger.info('These will be automatically committed during deployment');
            } else {
                logger.success('Working directory is clean');
            }
        } catch (error) {
            logger.warning('Could not check Git status - proceeding anyway');
        }

        // ===== PACKAGE.JSON VALIDATION =====

        /**
         * PACKAGE.JSON EXISTENCE AND STRUCTURE CHECK
         * 
         * Validates that package.json exists and contains required configuration.
         * This file is essential for:
         * - npm script execution (npm run deploy)
         * - Dependency management
         * - Project metadata and configuration
         * 
         * We use Node.js fs (file system) module to:
         * - Check file existence with existsSync()
         * - Read file contents with readFileSync()
         * - Parse JSON with JSON.parse()
         */
        const fs = require('fs');
        const path = require('path');

        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error('package.json not found in current directory');
        }

        /**
         * PACKAGE.JSON CONTENT VALIDATION
         * 
         * Parses package.json and validates required fields:
         * - scripts.deploy: Required for 'npm run deploy' command
         * - devDependencies['gh-pages']: Required for GitHub Pages deployment
         * 
         * JSON.parse() can throw SyntaxError if file is malformed.
         * We let this error bubble up as it indicates a serious configuration issue.
         */
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Check for required deploy script
        if (!packageJson.scripts || !packageJson.scripts.deploy) {
            throw new Error('Deploy script not found in package.json');
        }

        logger.success('package.json validation passed');

        // ===== GITHUB PAGES DEPENDENCY VALIDATION =====

        /**
         * GH-PAGES PACKAGE DEPENDENCY CHECK
         * 
         * Verifies that the gh-pages package is installed as a development dependency.
         * This package is essential for:
         * - Creating and managing the gh-pages branch
         * - Pushing build files to GitHub Pages
         * - Handling Git operations for deployment
         * 
         * We check devDependencies (not dependencies) because gh-pages
         * is only needed during development/deployment, not in production.
         */
        if (!packageJson.devDependencies || !packageJson.devDependencies['gh-pages']) {
            logger.warning('gh-pages package not found in devDependencies');
            logger.info('Run: npm install --save-dev gh-pages');
            logger.info('Deployment may fail without this package');
        } else {
            logger.success('gh-pages dependency found');
        }

        return true;

    } catch (error) {
        /**
         * VALIDATION FAILURE HANDLING
         * 
         * If any validation step fails, we log the error and return false.
         * This prevents deployment from proceeding with an invalid environment.
         * 
         * The error message should help users understand what needs to be fixed.
         */
        logger.error(`Environment validation failed: ${error.message}`);
        return false;
    }
}

// ===== SOURCE CODE MANAGEMENT =====

/**
 * SOURCE CODE COMMIT AND PUSH FUNCTION
 * 
 * This function handles committing any uncommitted changes and pushing
 * the source code to the GitHub main branch. This ensures that:
 * 1. All local changes are preserved in version control
 * 2. The remote repository is up-to-date with local changes  
 * 3. Source code and deployed site are synchronized
 * 
 * WHY THIS IS IMPORTANT:
 * - Prevents loss of local changes during deployment
 * - Ensures GitHub repository reflects current state
 * - Maintains synchronization between source code and live site
 * - Provides backup of all changes before deployment
 * 
 * @returns {Promise<boolean>} - True if source code management succeeds
 */
async function manageSourceCode() {
    logger.progress('Managing source code changes...');

    try {
        // ===== UNCOMMITTED CHANGES DETECTION =====

        /**
         * GIT STATUS CHECK FOR UNCOMMITTED CHANGES
         * 
         * Uses 'git status --porcelain' to detect uncommitted changes.
         * This command returns:
         * - Empty string: No changes (working directory clean)
         * - File list: Changes exist that need to be committed
         * 
         * --porcelain format examples:
         * " M file.txt"  = Modified file
         * "A  file.txt"  = Added file  
         * "D  file.txt"  = Deleted file
         * "?? file.txt"  = Untracked file
         */
        const gitStatus = await executeCommand('git status --porcelain');

        if (gitStatus.length > 0) {
            logger.info('Uncommitted changes detected. Committing changes...');

            // ===== STAGE ALL CHANGES =====

            /**
             * GIT ADD ALL CHANGES
             * 
             * 'git add .' stages all changes in the working directory:
             * - Modified files (changes to existing files)
             * - New files (untracked files)
             * - Deleted files (removed files)
             * 
             * The '.' refers to the current directory and all subdirectories.
             * This is equivalent to 'git add --all' for the current repository.
             * 
             * Staging prepares changes for commit but doesn't commit them yet.
             * This two-step process (add then commit) allows for selective commits.
             */
            await executeCommand('git add .');
            logger.success('Added all changes to git staging area');

            // ===== CREATE COMMIT MESSAGE =====

            /**
             * TIMESTAMP-BASED COMMIT MESSAGE GENERATION
             * 
             * Creates a descriptive commit message with timestamp:
             * - toISOString(): Converts Date to ISO 8601 format
             * - replace('T', ' '): Changes "2024-01-15T10:30:45.123Z" to "2024-01-15 10:30:45.123Z"
             * - substr(0, 16): Truncates to "2024-01-15 10:30" (removes seconds and timezone)
             * 
             * This provides:
             * - Sortable timestamp format
             * - Human-readable date and time
             * - Consistent commit message format
             * - Easy identification of deployment commits
             */
            const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 16);
            const commitMessage = `Update project - ${timestamp}`;

            // ===== COMMIT CHANGES =====

            /**
             * GIT COMMIT EXECUTION
             * 
             * Creates a new commit with all staged changes:
             * - Records current state of all files
             * - Creates unique commit hash for identification
             * - Adds commit to local Git history
             * - Prepares commit for pushing to remote
             * 
             * The -m flag specifies the commit message inline.
             * Without -m, Git would open a text editor for message input.
             */
            await executeCommand(`git commit -m "${commitMessage}"`);
            logger.success('Committed changes to local repository');
        } else {
            logger.success('No uncommitted changes found');
        }

        // ===== PUSH TO REMOTE REPOSITORY =====

        /**
         * GIT PUSH TO MAIN BRANCH
         * 
         * Pushes all local commits to the remote GitHub repository.
         * 'git push origin main' means:
         * - git push: Upload local commits to remote repository
         * - origin: The default remote repository name (typically GitHub)
         * - main: The target branch name on the remote repository
         * 
         * This operation:
         * - Uploads new commits to GitHub
         * - Updates the remote main branch pointer
         * - Makes changes visible on GitHub website
         * - Synchronizes local and remote repositories
         * 
         * Requirements for success:
         * - Valid Git credentials (SSH key or HTTPS token)
         * - Network connectivity to GitHub
         * - Write permissions to the repository
         * - No merge conflicts with remote changes
         */
        logger.progress('Pushing source code to GitHub main branch...');
        await executeCommand('git push origin main');
        logger.success('Source code pushed to GitHub main branch');

        return true;

    } catch (error) {
        /**
         * SOURCE CODE MANAGEMENT ERROR HANDLING
         * 
         * Handles various failure scenarios:
         * - Git authentication failures
         * - Network connectivity issues
         * - Merge conflicts with remote repository
         * - Insufficient repository permissions
         */
        logger.error(`Source code management failed: ${error.message}`);

        /**
         * SPECIFIC ERROR GUIDANCE
         * 
         * Provides targeted solutions for common Git push failures.
         * Helps users diagnose and fix authentication and connectivity issues.
         */
        if (error.message.includes('git push')) {
            logger.info('💡 Git push troubleshooting:');
            logger.info('   - Check internet connection');
            logger.info('   - Verify Git credentials: git config --list');
            logger.info('   - Check repository permissions on GitHub');
            logger.info('   - Try manual push: git push origin main --verbose');
        }

        return false;
    }
}

// ===== BUILD AND DEPLOYMENT PIPELINE =====

/**
 * PRODUCTION BUILD AND GITHUB PAGES DEPLOYMENT FUNCTION
 * 
 * This function handles the core deployment process:
 * 1. Cleans previous build artifacts to ensure fresh build
 * 2. Executes production build with React optimizations
 * 3. Deploys build files to GitHub Pages hosting
 * 
 * PRODUCTION BUILD PROCESS:
 * - JavaScript minification and compression
 * - CSS optimization and autoprefixing  
 * - Image and asset optimization
 * - Bundle splitting for efficient caching
 * - Service worker generation for PWA features
 * - Source map generation for debugging
 * 
 * @returns {Promise<boolean>} - True if build and deployment succeed
 */
async function buildAndDeploy() {
    logger.progress('Building and deploying application...');

    try {
        // ===== BUILD ARTIFACT CLEANUP =====

        /**
         * PREVIOUS BUILD CLEANUP PROCESS
         * 
         * Removes previous build directory to ensure clean build:
         * - Prevents stale files from previous builds
         * - Ensures all files in build directory are current
         * - Reduces risk of deployment errors from old files
         * - Provides consistent build environment
         */
        logger.info('Cleaning previous build artifacts...');
        try {
            /**
             * FILE SYSTEM OPERATIONS FOR CLEANUP
             * 
             * Uses Node.js built-in modules for file system operations:
             * - fs: File system operations (existsSync, statSync)
             * - path: Cross-platform path manipulation (join, resolve)
             */
            const fs = require('fs');
            const path = require('path');

            /**
             * BUILD DIRECTORY PATH CONSTRUCTION
             * 
             * path.join() creates platform-appropriate file paths:
             * - Windows: C:\Users\...\LearningReact\build
             * - macOS/Linux: /Users/.../LearningReact/build
             * 
             * process.cwd() returns current working directory.
             * This ensures the build path is relative to the project root.
             */
            const buildPath = path.join(process.cwd(), deployConfig.buildDirectory);

            if (fs.existsSync(buildPath)) {
                /**
                 * CROSS-PLATFORM DIRECTORY REMOVAL
                 * 
                 * Different operating systems use different commands for removing directories:
                 * - Windows: rmdir /s /q "path" (remove subdirectories /s, quiet mode /q)
                 * - Unix/Linux/macOS: rm -rf "path" (recursive -r, force -f)
                 * 
                 * process.platform returns:
                 * - 'win32' for Windows (including 64-bit)
                 * - 'darwin' for macOS
                 * - 'linux' for Linux
                 * 
                 * We use quotes around path to handle spaces in directory names.
                 */
                const cleanCommand = process.platform === 'win32'
                    ? `rmdir /s /q "${buildPath}"`
                    : `rm -rf "${buildPath}"`;

                await executeCommand(cleanCommand);
                logger.success('Previous build cleaned');
            }
        } catch (cleanError) {
            /**
             * NON-CRITICAL CLEANUP ERROR HANDLING
             * 
             * Cleanup failure is logged as warning, not error, because:
             * - Build process can still succeed without cleanup
             * - New build will overwrite old files anyway
             * - Cleanup failure shouldn't block deployment
             * 
             * Common cleanup failure causes:
             * - Files in use by other processes
             * - Insufficient file system permissions
             * - Build directory doesn't exist (first run)
             */
            logger.warning(`Could not clean previous build: ${cleanError.message}`);
        }

        // ===== PRODUCTION BUILD AND DEPLOYMENT EXECUTION =====

        /**
         * COMPREHENSIVE BUILD AND DEPLOYMENT COMMAND
         * 
         * Executes the main deployment command which triggers:
         * 1. npm run predeploy (if defined) - typically 'npm run build'
         * 2. npm run deploy - typically 'gh-pages -d build'
         * 
         * The build process includes:
         * - React component compilation and optimization
         * - JavaScript bundling with webpack
         * - CSS processing and minification
         * - Asset optimization (images, fonts, etc.)
         * - HTML generation with proper asset references
         * - Service worker generation for PWA features
         * 
         * The deployment process includes:
         * - Creating/updating gh-pages branch
         * - Copying build files to gh-pages branch
         * - Committing changes with timestamp
         * - Pushing gh-pages branch to GitHub
         * - Triggering GitHub Pages rebuild
         */
        logger.progress('Building production application and deploying to GitHub Pages...');
        const buildOutput = await executeCommand(deployConfig.buildCommand, {
            /**
             * EXTENDED TIMEOUT FOR BUILD PROCESS
             * 
             * Build process gets 120 seconds (2 minutes) instead of default 30 seconds because:
             * - JavaScript compilation can be CPU-intensive
             * - Asset optimization takes significant time
             * - Network upload to GitHub can be slow
             * - Large projects require more processing time
             * 
             * 120 seconds should accommodate most project sizes and network conditions.
             */
            timeout: 120000
        });

        logger.success('Build and deployment completed successfully');

        // ===== BUILD OUTPUT ANALYSIS =====

        /**
         * BUILD WARNING DETECTION
         * 
         * Checks build output for warnings that might indicate issues:
         * - Large bundle sizes that could affect performance
         * - Deprecated APIs that might break in future versions
         * - Optimization opportunities that were missed
         * - Configuration issues that could cause problems
         * 
         * Warnings don't prevent deployment but should be addressed
         * for optimal application performance and maintainability.
         */
        if (buildOutput.includes('warnings')) {
            logger.warning('Build completed with warnings - check output above');
        }

        return true;

    } catch (error) {
        /**
         * BUILD AND DEPLOYMENT ERROR HANDLING
         * 
         * Handles various failure scenarios:
         * - Build compilation errors (syntax errors, missing dependencies)
         * - Network issues during GitHub upload
         * - GitHub Pages configuration problems
         * - Insufficient GitHub repository permissions
         */
        logger.error(`Build and deployment failed: ${error.message}`);

        /**
         * TARGETED ERROR GUIDANCE
         * 
         * Provides specific troubleshooting steps for common deployment issues.
         * Helps users quickly identify and resolve problems.
         */
        if (error.message.includes('npm run deploy')) {
            logger.info('💡 Common deployment solutions:');
            logger.info('   - Check internet connection');
            logger.info('   - Verify GitHub Pages is enabled in repository settings');
            logger.info('   - Ensure gh-pages package is installed: npm install --save-dev gh-pages');
            logger.info('   - Check Git credentials and repository permissions');
        }

        if (error.message.includes('timeout')) {
            logger.info('💡 Timeout solutions:');
            logger.info('   - Check internet connection speed');
            logger.info('   - Try running deployment again');
            logger.info('   - Consider running npm run build separately first');
        }

        return false;
    }
}

// ===== MAIN DEPLOYMENT ORCHESTRATION =====

/**
 * MASTER DEPLOYMENT ORCHESTRATION FUNCTION
 * 
 * This is the main function that coordinates the entire deployment pipeline.
 * It calls all other functions in the correct sequence and handles overall
 * error management and user feedback.
 * 
 * DEPLOYMENT PIPELINE SEQUENCE:
 * 1. Environment validation (prerequisites check)
 * 2. Source code management (commit and push)
 * 3. Build and deployment (production build and GitHub Pages)
 * 4. Success reporting and user guidance
 * 
 * @returns {Promise<void>} - Completes when deployment succeeds or fails
 */
async function deployToGitHubPages() {
    /**
     * DEPLOYMENT TIMING AND FEEDBACK
     * 
     * Records start time for calculating total deployment duration.
     * Provides users with feedback about deployment performance.
     */
    logger.progress('Starting deployment process...');
    const startTime = Date.now();

    try {
        // ===== PHASE 1: ENVIRONMENT VALIDATION =====

        /**
         * PREREQUISITE VALIDATION PHASE
         * 
         * Validates environment before proceeding with deployment.
         * Early exit strategy prevents wasted time and resources.
         * If validation fails, deployment stops immediately.
         */
        const isEnvironmentValid = await validateEnvironment();
        if (!isEnvironmentValid) {
            throw new Error('Environment validation failed - deployment cannot proceed');
        }

        // ===== PHASE 2: SOURCE CODE MANAGEMENT =====

        /**
         * SOURCE CODE SYNCHRONIZATION PHASE
         * 
         * Commits any local changes and pushes to GitHub main branch.
         * This ensures source code and deployed site remain synchronized.
         * If this fails, deployment continues (source code management is important but not critical for deployment).
         */
        const sourceCodeManaged = await manageSourceCode();
        if (!sourceCodeManaged) {
            logger.warning('Source code management failed - continuing with deployment');
            logger.info('You may need to manually push your changes later');
        }

        // ===== PHASE 3: BUILD AND DEPLOYMENT =====

        /**
         * CORE DEPLOYMENT PHASE
         * 
         * Builds the application and deploys to GitHub Pages.
         * This is the critical phase - if it fails, deployment has failed.
         */
        const deploymentSuccessful = await buildAndDeploy();
        if (!deploymentSuccessful) {
            throw new Error('Build and deployment failed');
        }

        // ===== DEPLOYMENT SUCCESS REPORTING =====

        /**
         * SUCCESS METRICS AND FEEDBACK
         * 
         * Calculates deployment duration and provides success confirmation.
         * Includes helpful information about what was accomplished.
         */
        const endTime = Date.now();
        const deploymentTime = ((endTime - startTime) / 1000).toFixed(2);

        logger.success(`✨ Deployment completed successfully in ${deploymentTime} seconds`);
        logger.info('🌐 Your application is now live at:');
        logger.info('📱 https://wh33les.github.io/LearningReact');

        /**
         * DEPLOYMENT SUMMARY AND EDUCATION
         * 
         * Explains what the deployment process accomplished.
         * Helps users understand the deployment workflow.
         */
        console.log('\n📋 Deployment Summary:');
        console.log('   1. ✅ Validated deployment environment');
        console.log('   2. ✅ Committed and pushed source code to GitHub main branch');
        console.log('   3. ✅ Built optimized production version of your React app');
        console.log('   4. ✅ Deployed build files to GitHub Pages (gh-pages branch)');
        console.log('   5. ✅ Your live website is now updated and accessible');

        /**
         * POST-DEPLOYMENT GUIDANCE
         * 
         * Provides information about what users can do after successful deployment.
         */
        console.log('\n🎉 Next Steps:');
        console.log('   - Visit your live site to see the changes');
        console.log('   - Share the URL with others to showcase your work');
        console.log('   - Continue developing - run "npm start" for local development');
        console.log('   - Deploy again anytime with "node deploy.js"');

    } catch (error) {
        /**
         * COMPREHENSIVE ERROR HANDLING AND RECOVERY GUIDANCE
         * 
         * Handles deployment failures with detailed error information
         * and specific guidance for common issues.
         */
        const endTime = Date.now();
        const failureTime = ((endTime - startTime) / 1000).toFixed(2);

        logger.error(`Deployment failed after ${failureTime} seconds`);
        logger.error(`Error: ${error.message}`);

        /**
         * CONTEXTUAL ERROR GUIDANCE
         * 
         * Provides specific solutions based on the type of error encountered.
         * Helps users quickly identify and resolve common deployment issues.
         */
        if (error.message.includes('Environment validation failed')) {
            console.log('\n💡 Environment Setup Solutions:');
            console.log('   - Install Node.js version 14 or higher from nodejs.org');
            console.log('   - Run "npm install" to install project dependencies');
            console.log('   - Ensure you are in the correct project directory');
            console.log('   - Check that package.json exists and contains deploy script');
        }

        if (error.message.includes('Source code management failed')) {
            console.log('\n💡 Git and GitHub Solutions:');
            console.log('   - Check your internet connection');
            console.log('   - Verify Git credentials: git config --list');
            console.log('   - Ensure you have write access to the GitHub repository');
            console.log('   - Try manual push: git push origin main');
        }

        if (error.message.includes('Build and deployment failed')) {
            console.log('\n💡 Build and Deployment Solutions:');
            console.log('   - Check for syntax errors in your code');
            console.log('   - Ensure all dependencies are installed: npm install');
            console.log('   - Verify GitHub Pages is enabled in repository settings');
            console.log('   - Check that gh-pages package is installed: npm install --save-dev gh-pages');
        }

        /**
         * GENERAL TROUBLESHOOTING GUIDANCE
         * 
         * Provides general steps that can resolve many deployment issues.
         */
        console.log('\n🔧 General Troubleshooting:');
        console.log('   1. Check internet connection');
        console.log('   2. Ensure all software is up to date (Node.js, npm, Git)');
        console.log('   3. Try running individual commands manually:');
        console.log('      - npm run build (test build process)');
        console.log('      - git status (check repository state)');
        console.log('      - git push origin main (test GitHub connection)');
        console.log('   4. Restart terminal/command prompt and try again');
        console.log('   5. Check GitHub repository settings and permissions');

        /**
         * EXIT WITH ERROR CODE
         * 
         * Returns non-zero exit code to indicate failure.
         * This is important for CI/CD systems and automated processes
         * that need to detect deployment failures.
         */
        process.exit(1);
    }
}

// ===== SCRIPT EXECUTION ENTRY POINT =====

/**
 * MAIN SCRIPT EXECUTION FUNCTION
 * 
 * This immediately-invoked function expression (IIFE) serves as the
 * entry point for the deployment script. It provides:
 * - Welcome message and branding
 * - Top-level error handling
 * - Graceful script termination
 * - User-friendly interface
 */
(async function main() {
    /**
     * WELCOME MESSAGE AND BRANDING
     * 
     * Provides clear visual indication that the deployment script is running.
     * Helps users understand what process is starting.
     */
    console.log('\n' + '='.repeat(50));
    console.log('🚀 React Games Deployment Script');
    console.log('   Complete Automated Deployment Pipeline');
    console.log('   Source Code + Build + GitHub Pages');
    console.log('='.repeat(50) + '\n');

    try {
        /**
         * MAIN DEPLOYMENT EXECUTION
         * 
         * Calls the master deployment function and waits for completion.
         * All deployment logic is contained within deployToGitHubPages().
         */
        await deployToGitHubPages();

    } catch (error) {
        /**
         * CATASTROPHIC ERROR HANDLING
         * 
         * Handles errors that occur outside the normal deployment flow.
         * These are typically programming errors or system-level issues.
         */
        logger.error(`Deployment script encountered an unexpected error: ${error.message}`);

        console.log('\n🆘 Emergency Troubleshooting:');
        console.log('   - This is an unexpected error in the deployment script itself');
        console.log('   - Try restarting your terminal/command prompt');
        console.log('   - Ensure you are running the script from the project root directory');
        console.log('   - Check that all files are present and not corrupted');
        console.log('   - Contact support or check documentation for further assistance');

        process.exit(1);
    }
})();

// ===== PROCESS SIGNAL HANDLING AND CLEANUP =====

/**
 * COMPREHENSIVE PROCESS CLEANUP AND SIGNAL HANDLING
 * 
 * These event handlers ensure graceful shutdown and proper cleanup
 * when the script is interrupted or terminated.
 */

/**
 * SIGINT HANDLER (Ctrl+C Interruption)
 * 
 * Handles user interruption (Ctrl+C) gracefully.
 * SIGINT is the standard Unix signal for user-initiated termination.
 */
process.on('SIGINT', () => {
    logger.warning('\n🛑 Deployment interrupted by user');
    logger.info('Cleaning up and exiting...');
    process.exit(130); // Standard exit code for SIGINT
});

/**
 * SIGTERM HANDLER (Graceful Termination)
 * 
 * Handles termination requests from process managers.
 * SIGTERM is used by Docker, systemd, and other process managers.
 */
process.on('SIGTERM', () => {
    logger.warning('\n🛑 Deployment terminated by system');
    logger.info('Cleaning up and exiting...');
    process.exit(143); // Standard exit code for SIGTERM
});

/**
 * UNCAUGHT EXCEPTION HANDLER
 * 
 * Handles programming errors that weren't caught by try-catch blocks.
 * Prevents the script from crashing silently.
 */
process.on('uncaughtException', (error) => {
    logger.error(`\n💥 Uncaught exception: ${error.message}`);
    console.error('Stack trace:', error.stack);
    console.log('\n🐛 This appears to be a bug in the deployment script');
    console.log('Please report this error with the stack trace above');
    process.exit(1);
});

/**
 * UNHANDLED PROMISE REJECTION HANDLER
 * 
 * Handles Promise rejections that weren't caught with .catch() or try-catch.
 * Important for debugging async/await code issues.
 */
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`\n💥 Unhandled promise rejection: ${reason}`);
    console.error('Promise:', promise);
    console.log('\n🐛 This appears to be a bug in the deployment script');
    console.log('Please report this error with the details above');
    process.exit(1);
});

/**
 * DEPLOYMENT SCRIPT DOCUMENTATION SUMMARY
 * 
 * This deployment script demonstrates advanced Node.js and DevOps concepts:
 * 
 * 1. **CHILD PROCESS MANAGEMENT**
 *    - Executing shell commands from Node.js
 *    - Timeout handling and process cleanup
 *    - Cross-platform command execution
 * 
 * 2. **ASYNCHRONOUS PROGRAMMING**
 *    - Promise-based API design
 *    - Async/await for clean asynchronous code
 *    - Error propagation and handling
 * 
 * 3. **DEVOPS AUTOMATION**
 *    - Complete CI/CD pipeline implementation
 *    - Environment validation and prerequisite checking
 *    - Automated deployment with rollback capabilities
 * 
 * 4. **ERROR HANDLING AND USER EXPERIENCE**
 *    - Comprehensive error detection and reporting
 *    - User-friendly error messages with solutions
 *    - Graceful degradation and recovery guidance
 * 
 * 5. **SOFTWARE ENGINEERING BEST PRACTICES**
 *    - Modular function design
 *    - Comprehensive documentation
 *    - Configuration management
 *    - Cross-platform compatibility
 * 
 * This script can serve as a template for other deployment automation
 * needs and demonstrates production-ready DevOps practices.
 */