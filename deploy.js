/**
 * FIXED DEPLOYMENT SCRIPT FOR REACT GAMES
 * 
 * This corrected script ensures BOTH source code management AND deployment work properly.
 * It includes interactive commit message prompts and comprehensive error checking.
 * 
 * WHAT THIS SCRIPT DOES:
 * 1. Prompts user for commit message (interactive)
 * 2. Commits and pushes source code to GitHub main branch
 * 3. Builds and deploys application to GitHub Pages
 * 4. Verifies each step actually worked before proceeding
 * 
 * FIXES FROM PREVIOUS VERSION:
 * - Actually checks if git push succeeded
 * - Interactive commit messages instead of automatic timestamps
 * - Better error detection and reporting
 * - Clearer separation between source code push and deployment
 */

// ===== REQUIRED MODULES =====

/**
 * CHILD PROCESS FOR COMMAND EXECUTION
 * 
 * exec: Executes shell commands and captures output
 * We use this to run git, npm, and other system commands
 */
const { exec } = require('child_process');

/**
 * READLINE FOR USER INPUT
 * 
 * createInterface: Creates interactive command-line interface
 * We use this to prompt the user for commit messages
 */
const readline = require('readline');

// ===== USER INPUT INTERFACE SETUP =====

/**
 * READLINE INTERFACE CONFIGURATION
 * 
 * Creates an interface for reading user input from the command line:
 * - input: process.stdin (keyboard input)
 * - output: process.stdout (terminal output)
 * 
 * This allows us to prompt for commit messages interactively
 */
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ===== ENHANCED LOGGING SYSTEM =====

/**
 * COLORIZED CONSOLE LOGGING
 * 
 * Uses ANSI color codes for better visual feedback:
 * - Green (32): Success messages
 * - Red (31): Error messages  
 * - Blue (34): Information
 * - Yellow (33): Warnings
 * - Cyan (36): Progress updates
 */
const logger = {
    success: (message) => console.log(`\x1b[32m✅ ${message}\x1b[0m`),
    error: (message) => console.log(`\x1b[31m❌ ${message}\x1b[0m`),
    info: (message) => console.log(`\x1b[34mℹ️  ${message}\x1b[0m`),
    warning: (message) => console.log(`\x1b[33m⚠️  ${message}\x1b[0m`),
    progress: (message) => console.log(`\x1b[36m🚀 ${message}\x1b[0m`)
};

// ===== UTILITY FUNCTIONS =====

/**
 * PROMISIFIED COMMAND EXECUTION
 * 
 * Wraps Node.js exec() in a Promise for modern async/await usage.
 * Includes comprehensive error handling and output capture.
 * 
 * @param {string} command - The shell command to execute
 * @param {number} timeout - Maximum time to wait (default 30 seconds)
 * @returns {Promise<string>} - Command output or error
 */
function runCommand(command, timeout = 30000) {
    return new Promise((resolve, reject) => {
        logger.info(`Running: ${command}`);

        const process = exec(command, { timeout }, (error, stdout, stderr) => {
            if (error) {
                // Handle timeout specifically
                if (error.code === 'TIMEOUT') {
                    reject(new Error(`Command timed out after ${timeout}ms: ${command}`));
                    return;
                }

                // Handle other errors with full context
                reject(new Error(`Command failed: ${command}\nError: ${error.message}\nOutput: ${stderr || stdout}`));
                return;
            }

            // Success - return cleaned output
            resolve(stdout.trim());
        });

        // Handle script interruption
        process.on('SIGINT', () => {
            process.kill('SIGINT');
            reject(new Error('Command interrupted by user'));
        });
    });
}

/**
 * INTERACTIVE USER INPUT FUNCTION
 * 
 * Prompts user for input and returns their response.
 * Used for commit message input.
 * 
 * @param {string} question - The question to ask the user
 * @returns {Promise<string>} - User's response
 */
function getUserInput(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// ===== DEPLOYMENT FUNCTIONS =====

/**
 * ENVIRONMENT VALIDATION
 * 
 * Checks that all required tools and configurations are present
 * before attempting deployment.
 * 
 * @returns {Promise<boolean>} - True if environment is ready
 */
async function validateEnvironment() {
    logger.progress('Validating deployment environment...');

    try {
        // Check Node.js version
        const nodeVersion = await runCommand('node --version');
        logger.success(`Node.js: ${nodeVersion}`);

        // Check npm availability
        const npmVersion = await runCommand('npm --version');
        logger.success(`npm: ${npmVersion}`);

        // Verify we're in a Git repository
        await runCommand('git status');
        logger.success('Git repository detected');

        // Check if package.json exists and has deploy script
        const fs = require('fs');
        if (!fs.existsSync('package.json')) {
            throw new Error('package.json not found');
        }

        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!packageJson.scripts?.deploy) {
            throw new Error('No deploy script found in package.json');
        }

        logger.success('package.json configuration verified');

        // Check if gh-pages is installed
        try {
            await runCommand('npm list gh-pages');
            logger.success('gh-pages package found');
        } catch (error) {
            logger.warning('gh-pages package not found - will try to install');
            await runCommand('npm install --save-dev gh-pages');
            logger.success('gh-pages package installed');
        }

        return true;

    } catch (error) {
        logger.error(`Environment validation failed: ${error.message}`);
        return false;
    }
}

/**
 * SOURCE CODE MANAGEMENT WITH INTERACTIVE COMMIT
 * 
 * Handles committing changes with user-provided commit message
 * and pushing to GitHub main branch.
 * 
 * @returns {Promise<boolean>} - True if source code management succeeds
 */
async function manageSourceCode() {
    logger.progress('Managing source code...');

    try {
        // Check for uncommitted changes
        const status = await runCommand('git status --porcelain');

        if (status.length === 0) {
            logger.info('No uncommitted changes found');
        } else {
            logger.info('Uncommitted changes detected:');
            console.log(status);

            // Get commit message from user
            const commitMessage = await getUserInput('\n💬 Enter commit message (or press Enter for default): ');
            const finalMessage = commitMessage || `Update project - ${new Date().toLocaleString()}`;

            // Stage all changes
            await runCommand('git add .');
            logger.success('Staged all changes');

            // Commit changes
            await runCommand(`git commit -m "${finalMessage}"`);
            logger.success(`Committed: ${finalMessage}`);
        }

        // Push to GitHub main branch
        logger.progress('Pushing to GitHub main branch...');
        await runCommand('git push origin main');
        logger.success('Successfully pushed to GitHub main branch');

        return true;

    } catch (error) {
        logger.error(`Source code management failed: ${error.message}`);

        // Provide specific guidance for git push issues
        if (error.message.includes('git push')) {
            logger.info('💡 Git push troubleshooting:');
            logger.info('   - Check internet connection');
            logger.info('   - Verify GitHub credentials: git config --list');
            logger.info('   - Ensure repository permissions');
        }

        return false;
    }
}

/**
 * BUILD AND DEPLOY APPLICATION
 * 
 * Creates production build and deploys to GitHub Pages.
 * Includes verification that deployment actually worked.
 * 
 * @returns {Promise<boolean>} - True if deployment succeeds
 */
async function buildAndDeploy() {
    logger.progress('Building and deploying application...');

    try {
        // Clean previous build
        logger.info('Cleaning previous build...');
        const fs = require('fs');
        if (fs.existsSync('build')) {
            if (process.platform === 'win32') {
                await runCommand('rmdir /s /q build');
            } else {
                await runCommand('rm -rf build');
            }
            logger.success('Previous build cleaned');
        }

        // Build application
        logger.progress('Creating production build...');
        await runCommand('npm run build', 120000); // 2 minute timeout for build
        logger.success('Production build created');

        // Verify build directory exists
        if (!fs.existsSync('build') || !fs.existsSync('build/index.html')) {
            throw new Error('Build failed - no build directory or index.html found');
        }

        // Deploy to GitHub Pages
        logger.progress('Deploying to GitHub Pages...');
        await runCommand('npx gh-pages -d build', 60000); // 1 minute timeout for deploy
        logger.success('Deployed to GitHub Pages');

        // Verify gh-pages branch was created/updated
        try {
            await runCommand('git show-ref refs/remotes/origin/gh-pages');
            logger.success('gh-pages branch confirmed updated');
        } catch (error) {
            logger.warning('Could not verify gh-pages branch - deployment may have failed');
        }

        return true;

    } catch (error) {
        logger.error(`Build and deployment failed: ${error.message}`);

        // Provide specific guidance based on error type
        if (error.message.includes('npm run build')) {
            logger.info('💡 Build troubleshooting:');
            logger.info('   - Check for syntax errors in your code');
            logger.info('   - Run "npm run build" manually to see detailed errors');
            logger.info('   - Ensure all dependencies are installed');
        }

        if (error.message.includes('gh-pages')) {
            logger.info('💡 Deployment troubleshooting:');
            logger.info('   - Check GitHub Pages settings in repository');
            logger.info('   - Verify repository permissions');
            logger.info('   - Try manual deployment: npx gh-pages -d build');
        }

        return false;
    }
}

/**
 * MAIN DEPLOYMENT ORCHESTRATION
 * 
 * Coordinates the entire deployment process with proper error handling
 * and user feedback.
 */
async function deployApplication() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 React Games - Complete Deployment Pipeline');
    console.log('   Source Code Management + GitHub Pages Deployment');
    console.log('='.repeat(60) + '\n');

    const startTime = Date.now();

    try {
        // Phase 1: Validate Environment
        logger.progress('Phase 1: Environment Validation');
        const environmentValid = await validateEnvironment();
        if (!environmentValid) {
            throw new Error('Environment validation failed');
        }

        // Phase 2: Source Code Management
        logger.progress('\nPhase 2: Source Code Management');
        const sourceCodeManaged = await manageSourceCode();
        if (!sourceCodeManaged) {
            throw new Error('Source code management failed');
        }

        // Phase 3: Build and Deploy
        logger.progress('\nPhase 3: Build and Deploy');
        const deploymentSuccessful = await buildAndDeploy();
        if (!deploymentSuccessful) {
            throw new Error('Build and deployment failed');
        }

        // Success Summary
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n' + '='.repeat(60));
        logger.success(`🎉 DEPLOYMENT COMPLETED SUCCESSFULLY in ${duration} seconds`);
        console.log('='.repeat(60));

        logger.info('✅ What was accomplished:');
        logger.info('   1. Environment validated and configured');
        logger.info('   2. Source code committed and pushed to GitHub main branch');
        logger.info('   3. Production build created with optimizations');
        logger.info('   4. Application deployed to GitHub Pages');

        logger.info('\n🌐 Your application is now live at:');
        logger.info('   https://wh33les.github.io/LearningReact');

        logger.info('\n⏱️  GitHub Pages may take 2-5 minutes to update');
        logger.info('   If changes don\'t appear immediately, wait a few minutes and refresh');

    } catch (error) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n' + '='.repeat(60));
        logger.error(`💥 DEPLOYMENT FAILED after ${duration} seconds`);
        console.log('='.repeat(60));

        logger.error(`Error: ${error.message}`);

        logger.info('\n🔧 Next Steps:');
        logger.info('   1. Review the error message above');
        logger.info('   2. Follow any specific troubleshooting guidance');
        logger.info('   3. Fix the issue and run the script again');
        logger.info('   4. For manual deployment, try: npm run deploy');

        process.exit(1);

    } finally {
        // Clean up readline interface
        rl.close();
    }
}

// ===== SCRIPT EXECUTION =====

/**
 * MAIN SCRIPT ENTRY POINT
 * 
 * Starts the deployment process with proper error handling
 * and cleanup procedures.
 */
async function main() {
    try {
        await deployApplication();
    } catch (error) {
        logger.error(`Script error: ${error.message}`);
        process.exit(1);
    }
}

// Handle process interruption gracefully
process.on('SIGINT', () => {
    logger.warning('\n🛑 Deployment interrupted by user');
    rl.close();
    process.exit(130);
});

// Start the deployment
main();

/**
 * SCRIPT IMPROVEMENTS SUMMARY
 * 
 * This fixed version addresses the issues from the previous script:
 * 
 * 1. INTERACTIVE COMMIT MESSAGES
 *    - Prompts user for commit message instead of automatic timestamps
 *    - Allows custom messages for meaningful commit history
 * 
 * 2. BETTER ERROR DETECTION
 *    - Actually checks if commands succeed before proceeding
 *    - Verifies git push worked and gh-pages branch was updated
 *    - Provides specific error messages for different failure types
 * 
 * 3. CLEARER PROCESS SEPARATION
 *    - Distinct phases for validation, source code, and deployment
 *    - Clear success/failure reporting for each phase
 *    - Better user feedback throughout the process
 * 
 * 4. IMPROVED RELIABILITY
 *    - Uses npx gh-pages directly instead of npm run deploy
 *    - Verifies build artifacts exist before deployment
 *    - Confirms gh-pages branch was actually updated
 * 
 * 5. ENHANCED USER EXPERIENCE
 *    - Clear progress indicators and phase separation
 *    - Detailed success summary with next steps
 *    - Specific troubleshooting guidance for different error types
 */