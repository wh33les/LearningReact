// =============================================================================
// REACT APP DEPLOYMENT SCRIPT
// =============================================================================
// This script automates the complete deployment workflow:
// 1. Deploys the React app to GitHub Pages (live website)
// 2. Prompts user for a commit message 
// 3. Commits and pushes source code changes to GitHub
// 
// Usage: npm run full-deploy
// Works identically in: Windows PowerShell, Codespaces, Git Bash, etc.
// =============================================================================

// Import Node.js built-in modules (no installation required)
const { execSync } = require('child_process');  // Allows running terminal commands from Node.js
const readline = require('readline');            // Allows reading user input from terminal

// =============================================================================
// SETUP USER INPUT INTERFACE
// =============================================================================
// Create an interface to read from terminal (stdin) and write to terminal (stdout)
const rl = readline.createInterface({
    input: process.stdin,   // Read from keyboard
    output: process.stdout  // Write to terminal screen
});

// =============================================================================
// MAIN DEPLOYMENT FUNCTION
// =============================================================================
async function deploy() {
    try {
        // =========================================================================
        // STEP 1: DEPLOY THE REACT APP TO GITHUB PAGES
        // =========================================================================
        console.log('🚀 Deploying app...');

        // This runs: npm run deploy
        // Which automatically triggers:
        //   1. npm run build (via predeploy script)
        //   2. gh-pages -d build (deploys built files)
        // 
        // stdio: 'inherit' means show all terminal output in real-time
        execSync('npm run deploy', { stdio: 'inherit' });

        console.log('✅ Deployment complete!');
        console.log('   Your app is now live at: https://wh33les.github.io/LearningReact');

        // =========================================================================
        // STEP 2: GET COMMIT MESSAGE FROM USER
        // =========================================================================
        // Ask user to type a commit message and wait for their response
        rl.question('\n💬 Enter commit message: ', (message) => {

            // If user just pressed Enter (empty message), use default
            if (!message.trim()) {
                message = 'Update application';
                console.log('   Using default message: "Update application"');
            }

            // =====================================================================
            // STEP 3: COMMIT AND PUSH SOURCE CODE TO GITHUB
            // =====================================================================
            console.log('\n📝 Committing and pushing source code...');

            // Add all changed files to git staging area
            // This includes any new files, modified files, deleted files
            execSync('git add .', { stdio: 'inherit' });

            // Commit the staged changes with the user's message
            // Backticks allow us to insert the variable into the command
            execSync(`git commit -m "${message}"`, { stdio: 'inherit' });

            // Push the committed changes to GitHub main branch
            // This updates your source code repository (not the deployed site)
            execSync('git push', { stdio: 'inherit' });

            // =====================================================================
            // SUCCESS MESSAGE
            // =====================================================================
            console.log('✅ All done! Code pushed and site deployed.');
            console.log('');
            console.log('📋 What just happened:');
            console.log('   1. Built your React app for production');
            console.log('   2. Deployed build to GitHub Pages (live site)');
            console.log('   3. Committed your source code changes');
            console.log('   4. Pushed source code to GitHub main branch');
            console.log('');
            console.log('🌐 Live site: https://wh33les.github.io/LearningReact');
            console.log('📁 Source code: https://github.com/wh33les/LearningReact');

            // Close the input interface (important for script to exit)
            rl.close();
        });

    } catch (error) {
        // =========================================================================
        // ERROR HANDLING
        // =========================================================================
        // If any command fails, show the error and exit gracefully
        console.error('❌ Error occurred during deployment:');
        console.error('   ' + error.message);
        console.error('');
        console.error('💡 Common solutions:');
        console.error('   - Make sure you have internet connection');
        console.error('   - Check if GitHub Pages is enabled in repo settings');
        console.error('   - Ensure gh-pages package is installed: npm install gh-pages');
        console.error('   - Verify git is configured with your GitHub credentials');

        // Close the input interface even if there's an error
        rl.close();
    }
}

// =============================================================================
// START THE DEPLOYMENT PROCESS
// =============================================================================
// Call the deploy function to begin the entire process
// This is the entry point when you run: npm run full-deploy
deploy();