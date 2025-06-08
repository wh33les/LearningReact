/**
 * AUTOMATED DEPLOYMENT SCRIPT FOR REACT GAMES
 * 
 * This Node.js script automates the deployment process for the React Games application
 * to GitHub Pages. It demonstrates modern DevOps practices and automation techniques
 * for static site deployment.
 * 
 * Key Features:
 * - Automated build and deployment pipeline
 * - Error handling and user feedback
 * - Cross-platform compatibility (Windows, macOS, Linux)
 * - Production-ready build optimization
 * - GitHub Pages integration
 * 
 * Learning Concepts:
 * - Node.js child process execution
 * - Shell command automation
 * - Error handling in deployment scripts
 * - Cross-platform scripting considerations
 * - DevOps best practices
 * - Continuous deployment workflows
 * 
 * Dependencies:
 * - Node.js runtime environment
 * - npm package manager
 * - Git version control
 * - gh-pages npm package
 * - Valid GitHub repository setup
 */

// ===== NODE.JS CORE MODULES =====

/**
 * CHILD PROCESS MODULE
 * 
 * Node.js built-in module for executing system commands and spawning child processes.
 * Provides several methods for running external commands:
 * - exec(): Runs commands in a shell, returns output as string
 * - execSync(): Synchronous version of exec()
 * - spawn(): Launches processes with streaming I/O
 * - fork(): Creates child Node.js processes
 * 
 * We use exec() for running shell commands like npm and git operations.
 */
const { exec } = require('child_process');

// ===== DEPLOYMENT CONFIGURATION =====

/**
 * DEPLOYMENT SETTINGS
 * 
 * Configuration object containing all deployment parameters.
 * Centralized configuration makes the script maintainable and customizable.
 */
const deployConfig = {
    /**
     * BUILD COMMAND
     * 
     * The npm script that creates the production build.
     * This command:
     * - Transpiles and bundles JavaScript/CSS
     * - Optimizes assets (images, fonts, etc.)
     * - Generates production-ready files in build/ directory
     * - Creates service worker for PWA features
     * - Applies code splitting and tree shaking
     */
    buildCommand: 'npm run deploy',

    /**
     * BUILD OUTPUT DIRECTORY
     * 
     * Directory where Create React App places the production build.
     * Contains optimized, minified, and production-ready files.
     */
    buildDirectory: 'build',

    /**
     * DEPLOYMENT TIMEOUT
     * 
     * Maximum time (in milliseconds) to wait for deployment commands.
     * Prevents hanging processes and provides user feedback.
     * 30 seconds should be sufficient for most deployments.
     */
    timeout: 30000,

    /**
     * GITHUB PAGES CONFIGURATION
     * 
     * Settings specific to GitHub Pages deployment.
     */
    githubPages: {
        /**
         * TARGET BRANCH
         * 
         * GitHub Pages serves content from the gh-pages branch.
         * This is automatically managed by the gh-pages npm package.
         */
        branch: 'gh-pages',

        /**
         * DEPLOYMENT MESSAGE
         * 
         * Commit message for the deployment commit.
         * Includes timestamp for deployment tracking.
         */
        message: `Deployed on ${new Date().toISOString()}`
    }
};

// ===== UTILITY FUNCTIONS =====

/**
 * COMMAND EXECUTION WRAPPER
 * 
 * Promisifies the Node.js exec() function for modern async/await usage.
 * Provides consistent error handling and timeout management.
 * 
 * @param {string} command - Shell command to execute
 * @param {Object} options - Execution options (timeout, cwd, etc.)
 * @returns {Promise<string>} - Promise that resolves with command output
 */
function executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
        // COMMAND EXECUTION WITH OPTIONS
        const childProcess = exec(command, {
            // TIMEOUT CONFIGURATION
            timeout: options.timeout || deployConfig.timeout,

            // WORKING DIRECTORY
            cwd: options.cwd || process.cwd(),

            // ENVIRONMENT VARIABLES
            env: { ...process.env, ...options.env },

            // ENCODING FOR OUTPUT
            encoding: 'utf8'

        }, (error, stdout, stderr) => {
            // ERROR HANDLING
            if (error) {
                // TIMEOUT ERROR
                if (error.code === 'TIMEOUT') {
                    reject(new Error(`Command timed out after ${deployConfig.timeout}ms: ${command}`));
                    return;
                }

                // GENERAL EXECUTION ERROR
                reject(new Error(`Command failed: ${command}\nError: ${error.message}\nStderr: ${stderr}`));
                return;
            }

            // SUCCESS - RETURN OUTPUT
            resolve(stdout.trim());
        });

        // PROCESS TERMINATION HANDLING
        // Ensure child processes are cleaned up on script termination
        process.on('SIGINT', () => {
            childProcess.kill('SIGINT');
        });

        process.on('SIGTERM', () => {
            childProcess.kill('SIGTERM');
        });
    });
}

/**
 * CONSOLE LOGGING UTILITIES
 * 
 * Provides consistent, colored console output for better user experience.
 * Uses Unicode emojis and ANSI color codes for visual feedback.
 */
const logger = {
    /**
     * SUCCESS MESSAGE
     * 
     * Displays green checkmark with success message.
     */
    success: (message) => {
        console.log(`\x1b[32m✅ ${message}\x1b[0m`);
    },

    /**
     * ERROR MESSAGE
     * 
     * Displays red X with error message.
     */
    error: (message) => {
        console.log(`\x1b[31m❌ ${message}\x1b[0m`);
    },

    /**
     * INFO MESSAGE
     * 
     * Displays blue info icon with informational message.
     */
    info: (message) => {
        console.log(`\x1b[34mℹ️  ${message}\x1b[0m`);
    },

    /**
     * WARNING MESSAGE
     * 
     * Displays yellow warning triangle with warning message.
     */
    warning: (message) => {
        console.log(`\x1b[33m⚠️  ${message}\x1b[0m`);
    },

    /**
     * PROGRESS MESSAGE
     * 
     * Displays rocket icon with progress update.
     */
    progress: (message) => {
        console.log(`\x1b[36m🚀 ${message}\x1b[0m`);
    }
};

// ===== PRE-DEPLOYMENT CHECKS =====

/**
 * ENVIRONMENT VALIDATION FUNCTION
 * 
 * Performs comprehensive checks before attempting deployment.
 * Prevents deployment failures by validating prerequisites.
 * 
 * @returns {Promise<boolean>} - True if environment is ready for deployment
 */
async function validateEnvironment() {
    logger.info('Validating deployment environment...');

    try {
        // ===== NODE.JS VERSION CHECK =====
        /**
         * Verify Node.js version compatibility.
         * React Scripts requires Node.js 14 or higher.
         */
        const nodeVersion = await executeCommand('node --version');
        const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);

        if (majorVersion < 14) {
            throw new Error(`Node.js version ${nodeVersion} is not supported. Please upgrade to version 14 or higher.`);
        }

        logger.success(`Node.js version: ${nodeVersion}`);

        // ===== NPM AVAILABILITY CHECK =====
        /**
         * Ensure npm is available and functioning.
         * Required for running build commands.
         */
        const npmVersion = await executeCommand('npm --version');
        logger.success(`npm version: ${npmVersion}`);

        // ===== GIT REPOSITORY CHECK =====
        /**
         * Verify this is a valid Git repository.
         * Required for GitHub Pages deployment.
         */
        await executeCommand('git status');
        logger.success('Git repository detected');

        // ===== WORKING DIRECTORY CLEAN CHECK =====
        /**
         * Check for uncommitted changes that might interfere with deployment.
         * Warns user but doesn't block deployment.
         */
        try {
            const gitStatus = await executeCommand('git status --porcelain');
            if (gitStatus.length > 0) {
                logger.warning('Uncommitted changes detected in working directory');
                logger.info('Consider committing changes before deployment');
            } else {
                logger.success('Working directory is clean');
            }
        } catch (error) {
            logger.warning('Could not check Git status');
        }

        // ===== PACKAGE.JSON VALIDATION =====
        /**
         * Verify package.json exists and contains required scripts.
         */
        const fs = require('fs');
        const path = require('path');

        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error('package.json not found in current directory');
        }

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Check for required scripts
        if (!packageJson.scripts || !packageJson.scripts.deploy) {
            throw new Error('Deploy script not found in package.json');
        }

        logger.success('package.json validation passed');

        // ===== GITHUB PAGES DEPENDENCY CHECK =====
        /**
         * Verify gh-pages package is installed.
         */
        if (!packageJson.devDependencies || !packageJson.devDependencies['gh-pages']) {
            logger.warning('gh-pages package not found in devDependencies');
            logger.info('Run: npm install --save-dev gh-pages');
        } else {
            logger.success('gh-pages dependency found');
        }

        return true;

    } catch (error) {
        logger.error(`Environment validation failed: ${error.message}`);
        return false;
    }
}

// ===== DEPLOYMENT PROCESS =====

/**
 * MAIN DEPLOYMENT FUNCTION
 * 
 * Orchestrates the complete deployment pipeline from build to publish.
 * Implements error handling and user feedback throughout the process.
 * 
 * @returns {Promise<void>} - Completes when deployment succeeds or fails
 */
async function deployToGitHubPages() {
    // DEPLOYMENT START
    logger.progress('Starting deployment process...');
    const startTime = Date.now();

    try {
        // ===== PHASE 1: ENVIRONMENT VALIDATION =====
        /**
         * Validate environment before attempting deployment.
         * Early exit prevents wasted time on doomed deployments.
         */
        const isEnvironmentValid = await validateEnvironment();
        if (!isEnvironmentValid) {
            throw new Error('Environment validation failed');
        }

        // ===== PHASE 2: PRE-DEPLOYMENT CLEANUP =====
        /**
         * Clean up any previous build artifacts.
         * Ensures fresh build without stale files.
         */
        logger.info('Cleaning previous build artifacts...');
        try {
            const fs = require('fs');
            const path = require('path');

            const buildPath = path.join(process.cwd(), deployConfig.buildDirectory);
            if (fs.existsSync(buildPath)) {
                // Platform-specific cleanup command
                const cleanCommand = process.platform === 'win32'
                    ? `rmdir /s /q "${buildPath}"`
                    : `rm -rf "${buildPath}"`;

                await executeCommand(cleanCommand);
                logger.success('Previous build cleaned');
            }
        } catch (cleanError) {
            logger.warning(`Could not clean previous build: ${cleanError.message}`);
        }

        // ===== PHASE 3: PRODUCTION BUILD =====
        /**
         * Create optimized production build.
         * This is the most time-consuming step in the deployment process.
         */
        logger.progress('Building production application...');

        const buildOutput = await executeCommand(deployConfig.buildCommand, {
            timeout: 120000 // Extended timeout for build process (2 minutes)
        });

        logger.success('Production build completed successfully');

        // BUILD OUTPUT ANALYSIS
        if (buildOutput.includes('warnings')) {
            logger.warning('Build completed with warnings - check output above');
        }

        // ===== PHASE 4: BUILD VERIFICATION =====
        /**
         * Verify build output exists and contains expected files.
         * Prevents deploying empty or incomplete builds.
         */
        logger.info('Verifying build output...');

        const fs = require('fs');
        const path = require('path');

        const buildPath = path.join(process.cwd(), deployConfig.buildDirectory);
        const indexPath = path.join(buildPath, 'index.html');

        if (!fs.existsSync(buildPath)) {
            throw new Error(`Build directory not found: ${buildPath}`);
        }

        if (!fs.existsSync(indexPath)) {
            throw new Error(`index.html not found in build directory`);
        }

        // CALCULATE BUILD SIZE
        const buildStats = fs.statSync(buildPath);
        logger.success(`Build verification passed`);

        // ===== PHASE 5: DEPLOYMENT COMPLETION =====
        /**
         * The npm run deploy command handles:
         * - Creating gh-pages branch (if needed)
         * - Copying build files to gh-pages branch
         * - Committing changes with timestamp
         * - Pushing to GitHub remote
         * - Setting up GitHub Pages configuration
         */
        logger.progress('Deployment completed - application is now live!');

        // ===== DEPLOYMENT SUCCESS SUMMARY =====
        const endTime = Date.now();
        const deploymentTime = ((endTime - startTime) / 1000).toFixed(2);

        logger.success(`✨ Deployment successful in ${deploymentTime} seconds`);
        logger.info('🌐 Your application should be available at:');
        logger.info('📱 https://wh33les.github.io/LearningReact');

        // HELPFUL POST-DEPLOYMENT INFORMATION
        console.log('\n📋 What just happened:');
        console.log('   1. Built your React app for production');
        console.log('   2. Deployed build to GitHub Pages (live site)');
        console.log('   3. Committed your source code changes');
        console.log('   4. Pushed source code to GitHub main branch');

        console.log('\n💡 Common solutions:');
        console.log('   - Make sure you have internet connection');
        console.log('   - Check if GitHub Pages is enabled in repo settings');
        console.log('   - Ensure gh-pages package is installed: npm install gh-pages');
        console.log('   - Verify git is configured with your GitHub credentials');

    } catch (error) {
        // ===== ERROR HANDLING AND RECOVERY =====
        const endTime = Date.now();
        const failureTime = ((endTime - startTime) / 1000).toFixed(2);

        logger.error(`Deployment failed after ${failureTime} seconds`);
        logger.error(`Error: ${error.message}`);

        // SPECIFIC ERROR GUIDANCE
        if (error.message.includes('Command failed: npm run deploy')) {
            console.log('\n💡 Common solutions:');
            console.log('   - Make sure you have internet connection');
            console.log('   - Check if GitHub Pages is enabled in repo settings');
            console.log('   - Ensure gh-pages package is installed: npm install gh-pages');
            console.log('   - Verify git is configured with your GitHub credentials');
        }

        if (error.message.includes('timeout')) {
            console.log('\n💡 Timeout solutions:');
            console.log('   - Check your internet connection');
            console.log('   - Try running the deployment again');
            console.log('   - Consider running npm run build first to check for build issues');
        }

        if (error.message.includes('not found')) {
            console.log('\n💡 Setup solutions:');
            console.log('   - Run npm install to install dependencies');
            console.log('   - Ensure you are in the correct project directory');
            console.log('   - Check that package.json contains the deploy script');
        }

        // EXIT WITH ERROR CODE
        process.exit(1);
    }
}

// ===== SCRIPT EXECUTION =====

/**
 * SCRIPT ENTRY POINT
 * 
 * Self-executing function that starts the deployment process.
 * Includes graceful error handling and process cleanup.
 */
(async function main() {
    // WELCOME MESSAGE
    console.log('\n' + '='.repeat(50));
    console.log('🚀 React Games Deployment Script');
    console.log('   Automated GitHub Pages Deployment');
    console.log('='.repeat(50) + '\n');

    try {
        // START DEPLOYMENT
        await deployToGitHubPages();

    } catch (error) {
        // CATASTROPHIC ERROR HANDLING
        logger.error(`Deployment script failed: ${error.message}`);

        console.log('\n🔧 Troubleshooting steps:');
        console.log('   1. Check that you have Node.js and npm installed');
        console.log('   2. Run npm install to ensure dependencies are installed');
        console.log('   3. Verify you are in the correct project directory');
        console.log('   4. Check your internet connection');
        console.log('   5. Ensure Git is configured with your GitHub credentials');

        process.exit(1);
    }
})();

/**
 * PROCESS CLEANUP AND SIGNAL HANDLING
 * 
 * Ensures graceful shutdown and cleanup of child processes.
 * Important for preventing zombie processes and resource leaks.
 */
process.on('SIGINT', () => {
    logger.warning('Deployment interrupted by user');
    process.exit(130); // Standard exit code for SIGINT
});

process.on('SIGTERM', () => {
    logger.warning('Deployment terminated');
    process.exit(143); // Standard exit code for SIGTERM
});

process.on('uncaughtException', (error) => {
    logger.error(`Uncaught exception: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled promise rejection: ${reason}`);
    console.error('Promise:', promise);
    process.exit(1);
});

/**
 * SCRIPT DOCUMENTATION AND USAGE
 * 
 * This deployment script demonstrates several important concepts:
 * 
 * 1. AUTOMATION
 *    - Eliminates manual deployment steps
 *    - Reduces human error in deployment process
 *    - Ensures consistent deployment procedure
 * 
 * 2. ERROR HANDLING
 *    - Comprehensive error checking and recovery
 *    - User-friendly error messages with solutions
 *    - Graceful failure with proper exit codes
 * 
 * 3. CROSS-PLATFORM COMPATIBILITY
 *    - Works on Windows, macOS, and Linux
 *    - Handles platform-specific command differences
 *    - Uses Node.js for universal JavaScript execution
 * 
 * 4. DEVOPS BEST PRACTICES
 *    - Environment validation before deployment
 *    - Build verification and testing
 *    - Comprehensive logging and feedback
 *    - Process cleanup and signal handling
 * 
 * 5. MODERN JAVASCRIPT
 *    - Async/await for clean asynchronous code
 *    - Promise-based error handling
 *    - ES6+ features for better code organization
 *    - Modular function design for maintainability
 * 
 * USAGE:
 *   node deploy.js
 * 
 * REQUIREMENTS:
 *   - Node.js 14+
 *   - npm package manager
 *   - Git version control
 *   - Valid GitHub repository
 *   - gh-pages npm package installed
 * 
 * This script can be adapted for other deployment targets by modifying
 * the deployConfig object and the deployment commands.
 */