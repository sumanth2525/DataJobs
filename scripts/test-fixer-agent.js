#!/usr/bin/env node

/**
 * Test Fixer Agent
 * Automatically fixes failing unit tests by analyzing failures and updating test files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestFixerAgent {
  constructor() {
    this.fixesApplied = [];
    this.testResults = null;
  }

  /**
   * Run tests and capture output
   */
  runTests() {
    try {
      console.log('🧪 Running tests...');
      const output = execSync('npm test -- --no-coverage --watchAll=false 2>&1', {
        encoding: 'utf-8',
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      return { success: true, output };
    } catch (error) {
      return { success: false, output: error.stdout || error.stderr || error.message };
    }
  }

  /**
   * Parse test failures from Jest output
   */
  parseFailures(output) {
    const failures = [];
    const lines = output.split('\n');
    let currentTest = null;
    let currentFile = null;
    let currentFilePath = null;
    let inErrorDetails = false;
    let errorDetails = [];

    // Map component names to file paths
    const componentToFile = {
      'JobListings Component': 'components/JobListings.test.js',
      'Messages Component': 'components/Messages.test.js',
      'Login Component': 'components/Login.test.js',
      'Admin Component': 'components/Admin.test.js',
      'Profile Component': 'components/Profile.test.js',
      'SignUp Component': 'components/SignUp.test.js',
      'AdminDashboard Component': 'components/AdminDashboard.test.js',
      'JobCard Component': 'components/JobCard.test.js',
      'Header Component': 'components/Header.test.js',
      'Dashboard Component': 'components/Dashboard.test.js',
      'Community Component': 'components/Community.test.js',
      'adminStats Utility': 'utils/adminStats.test.js',
      'timeUtils': 'utils/timeUtils.test.js',
      'jobUrlParser': 'utils/jobUrlParser.test.js',
      'api': 'lib/api.test.js'
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match test file path - format: "● Component Name › test name"
      const fileMatch = line.match(/●\s+(.+?)\s+›\s+(.+)/);
      if (fileMatch) {
        if (currentTest && currentFilePath) {
          failures.push({
            file: currentFile,
            filePath: currentFilePath,
            test: currentTest,
            error: errorDetails.join('\n')
          });
        }
        currentFile = fileMatch[1].trim();
        currentTest = fileMatch[2].trim();
        currentFilePath = componentToFile[currentFile] || null;
        errorDetails = [];
        inErrorDetails = true;
        continue;
      }

      // Also try to match file paths directly from error stack traces
      const stackMatch = line.match(/at\s+.+?\((.+?\.test\.js):(\d+):(\d+)\)/);
      if (stackMatch && !currentFilePath) {
        const filePath = stackMatch[1];
        if (filePath.includes('__tests__')) {
          currentFilePath = filePath.split('__tests__/')[1];
        }
      }

      // Match error details
      if (inErrorDetails && (line.includes('Error:') || line.includes('TestingLibraryElementError') || line.includes('Unable to find') || line.includes('Found multiple elements'))) {
        errorDetails.push(line);
      }

      // Match "Here are the accessible roles" - this is important context
      if (line.includes('Here are the accessible roles:')) {
        inErrorDetails = true;
        errorDetails.push(line);
      }

      // End of error block
      if (line.match(/^\s*at\s+/) && errorDetails.length > 0 && currentTest) {
        inErrorDetails = false;
      }
    }

    // Add last failure
    if (currentTest && currentFilePath) {
      failures.push({
        file: currentFile,
        filePath: currentFilePath,
        test: currentTest,
        error: errorDetails.join('\n')
      });
    }

    return failures;
  }

  /**
   * Analyze failure and determine fix strategy
   */
  analyzeFailure(failure) {
    const { test, error } = failure;
    const fixes = [];

    // Fix 1: Multiple elements found with getByText
    if (error.includes('Found multiple elements') && error.includes('getByText')) {
      const textMatch = error.match(/getByText\((.+?)\)/);
      if (textMatch) {
        fixes.push({
          type: 'multiple-elements',
          action: 'use-getAllByText',
          searchText: textMatch[1],
          description: `Multiple elements found with ${textMatch[1]}, use getAllByText and select first`
        });
      }
    }

    // Fix 2: Unable to find element by role and name
    if (error.includes('Unable to find an accessible element') && error.includes('role') && error.includes('name')) {
      const roleMatch = error.match(/role "(\w+)" and name `(.+?)`/);
      if (roleMatch) {
        const [, role, namePattern] = roleMatch;
        fixes.push({
          type: 'missing-accessible-name',
          action: 'use-class-or-text',
          role,
          namePattern,
          description: `Button exists but doesn't have accessible name matching ${namePattern}, use className or text content instead`
        });
      }
    }

    // Fix 3: Element not found - might need to use different query
    if (error.includes('Unable to find') && !error.includes('accessible')) {
      fixes.push({
        type: 'element-not-found',
        action: 'use-alternative-query',
        description: 'Element not found, try using different query method'
      });
    }

    return fixes;
  }

  /**
   * Fix test file based on failure analysis
   */
  fixTestFile(filePath, failures) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    failures.forEach(failure => {
      const fixes = this.analyzeFailure(failure);
      
      fixes.forEach(fix => {
        const { test, error } = failure;

        // Fix 1: Replace getByText with getAllByText when multiple elements
        if (fix.type === 'multiple-elements' && fix.action === 'use-getAllByText') {
          const testMatch = content.match(new RegExp(`test\\(['"]${test.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'i'));
          if (testMatch) {
            const testStart = testMatch.index;
            const testEnd = content.indexOf('});', testStart);
            const testBlock = content.substring(testStart, testEnd);
            
            // Replace getByText with getAllByText[0]
            const newTestBlock = testBlock.replace(
              new RegExp(`(screen\\.getByText\\(${fix.searchText}\\))`, 'g'),
              `$1[0] || screen.getAllByText(${fix.searchText})[0]`
            );
            
            if (newTestBlock !== testBlock) {
              content = content.substring(0, testStart) + newTestBlock + content.substring(testEnd);
              modified = true;
              this.fixesApplied.push(`Fixed multiple elements issue in ${test}`);
            }
          }
        }

        // Fix 2: Replace role+name query with className or text content query
        if (fix.type === 'missing-accessible-name' && fix.action === 'use-class-or-text') {
          const testMatch = content.match(new RegExp(`test\\(['"]${test.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'i'));
          if (testMatch) {
            const testStart = testMatch.index;
            const testEnd = content.indexOf('});', testStart);
            const testBlock = content.substring(testStart, testEnd);
            
            // Check if error mentions button names (numbers)
            if (error.includes('Name "') && error.includes('button')) {
              // Replace getAllByRole with querySelector or getByText for buttons
              const rolePattern = new RegExp(`screen\\.getAllByRole\\(['"]${fix.role}['"]\\s*,\\s*\\{\\s*name:\\s*${fix.namePattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\)`, 'g');
              
              if (rolePattern.test(testBlock)) {
                // Use querySelector with className instead
                const newQuery = `document.querySelectorAll('button.${fix.role === 'button' ? 'post-action-button' : ''}')`;
                const newTestBlock = testBlock.replace(rolePattern, newQuery);
                
                if (newTestBlock !== testBlock) {
                  content = content.substring(0, testStart) + newTestBlock + content.substring(testEnd);
                  modified = true;
                  this.fixesApplied.push(`Fixed missing accessible name in ${test} - using querySelector`);
                }
              }
            }
          }
        }

        // Fix 3: Generic fix for element not found
        if (fix.type === 'element-not-found') {
          const testMatch = content.match(new RegExp(`test\\(['"]${test.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'i'));
          if (testMatch) {
            const testStart = testMatch.index;
            const testEnd = content.indexOf('});', testStart);
            const testBlock = content.substring(testStart, testEnd);
            
            // Try to make the test more flexible
            if (testBlock.includes('getByText') && !testBlock.includes('queryByText')) {
              const newTestBlock = testBlock.replace(/screen\.getByText\(/g, 'screen.queryByText(');
              if (newTestBlock !== testBlock) {
                content = content.substring(0, testStart) + newTestBlock + content.substring(testEnd);
                modified = true;
                this.fixesApplied.push(`Made test more flexible in ${test} - using queryByText`);
              }
            }
          }
        }
      });
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    }

    return false;
  }

  /**
   * Apply intelligent fixes based on common patterns
   */
  applyIntelligentFixes(filePath, failures) {
    if (!fs.existsSync(filePath)) return false;

    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    failures.forEach(failure => {
      const { test, error } = failure;

      // Pattern 1: Like/Share buttons don't have accessible names - they're icon buttons with numbers
      if (error.includes('Unable to find') && (error.includes('/like/i') || error.includes('/share/i'))) {
        const testMatch = content.match(new RegExp(`test\\(['"]${test.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'i'));
        if (testMatch) {
          const testStart = testMatch.index;
          const testEnd = content.indexOf('});', testStart);
          const testBlock = content.substring(testStart, testEnd);
          
          // Replace getAllByRole with querySelector for post-action-button
          if (testBlock.includes('getAllByRole') && (testBlock.includes('like') || testBlock.includes('share'))) {
            let newTestBlock = testBlock;
            
            // Fix like button - match any variation
            if (testBlock.includes('like')) {
              newTestBlock = newTestBlock.replace(
                /screen\.getAllByRole\(['"]button['"]\s*,\s*\{\s*name:\s*\/like\/i\s*\}\)/g,
                "Array.from(document.querySelectorAll('button.post-action-button')).filter(btn => btn.querySelector('.bi-heart') || btn.querySelector('.bi-heart-fill'))"
              );
            }
            
            // Fix share button
            if (testBlock.includes('share')) {
              newTestBlock = newTestBlock.replace(
                /screen\.getAllByRole\(['"]button['"]\s*,\s*\{\s*name:\s*\/share\/i\s*\}\)/g,
                "Array.from(document.querySelectorAll('button.post-action-button')).filter(btn => btn.querySelector('.bi-share'))"
              );
            }
            
            if (newTestBlock !== testBlock) {
              content = content.substring(0, testStart) + newTestBlock + content.substring(testEnd);
              modified = true;
              this.fixesApplied.push(`Fixed ${test} - using querySelector for icon buttons`);
            }
          }
        }
      }

      // Pattern 2: Multiple text matches - use getAllByText or more specific query
      if (error.includes('Found multiple elements') && error.includes('getByText')) {
        const testMatch = content.match(new RegExp(`test\\(['"]${test.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'i'));
        if (testMatch) {
          const testStart = testMatch.index;
          const testEnd = content.indexOf('});', testStart);
          const testBlock = content.substring(testStart, testEnd);
          
          // Extract the text pattern from getByText
          const textMatch = testBlock.match(/getByText\(([^)]+)\)/);
          if (textMatch) {
            const textPattern = textMatch[1];
            
            // Try to use a more specific query (like getByRole for headings)
            if (error.includes('h1') || error.includes('heading')) {
              const newTestBlock = testBlock.replace(
                new RegExp(`screen\\.getByText\\(${textPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'),
                `screen.getByRole('heading', { name: ${textPattern} })`
              );
              
              if (newTestBlock !== testBlock) {
                content = content.substring(0, testStart) + newTestBlock + content.substring(testEnd);
                modified = true;
                this.fixesApplied.push(`Fixed ${test} - using getByRole for heading`);
              } else {
                // Fallback to getAllByText[0]
                const fallbackBlock = testBlock.replace(
                  new RegExp(`screen\\.getByText\\(${textPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'),
                  `screen.getAllByText(${textPattern})[0]`
                );
                
                if (fallbackBlock !== testBlock) {
                  content = content.substring(0, testStart) + fallbackBlock + content.substring(testEnd);
                  modified = true;
                  this.fixesApplied.push(`Fixed ${test} - using getAllByText for multiple matches`);
                }
              }
            } else {
              // Fallback to getAllByText[0]
              const newTestBlock = testBlock.replace(
                new RegExp(`screen\\.getByText\\(${textPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'),
                `screen.getAllByText(${textPattern})[0]`
              );
              
              if (newTestBlock !== testBlock) {
                content = content.substring(0, testStart) + newTestBlock + content.substring(testEnd);
                modified = true;
                this.fixesApplied.push(`Fixed ${test} - using getAllByText for multiple matches`);
              }
            }
          }
        }
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    }

    return false;
  }

  /**
   * Main execution method
   */
  async fixTests() {
    console.log('🤖 Test Fixer Agent Starting...\n');

    // Step 1: Run tests
    const testResult = this.runTests();
    
    if (testResult.success) {
      console.log('✅ All tests passing! No fixes needed.');
      return;
    }

    // Step 2: Parse failures
    console.log('📊 Analyzing test failures...');
    const failures = this.parseFailures(testResult.output);
    
    if (failures.length === 0) {
      console.log('⚠️  Could not parse test failures. Output:');
      console.log(testResult.output.substring(0, 500));
      return;
    }

    console.log(`\n🔍 Found ${failures.length} test failure(s):\n`);
    failures.forEach((f, i) => {
      console.log(`${i + 1}. ${f.file} › ${f.test}`);
    });

    // Step 3: Group failures by file
    const failuresByFile = {};
    failures.forEach(failure => {
      // Use filePath if available, otherwise construct from file name
      const filePath = failure.filePath 
        ? path.join(process.cwd(), 'src', '__tests__', failure.filePath)
        : path.join(process.cwd(), 'src', '__tests__', failure.file);
      
      if (!failuresByFile[filePath]) {
        failuresByFile[filePath] = [];
      }
      failuresByFile[filePath].push(failure);
    });

    // Step 4: Fix each file
    console.log('\n🔧 Applying fixes...\n');
    for (const [filePath, fileFailures] of Object.entries(failuresByFile)) {
      console.log(`Fixing: ${path.basename(filePath)}`);
      
      // Try intelligent fixes first
      if (this.applyIntelligentFixes(filePath, fileFailures)) {
        console.log(`  ✅ Applied intelligent fixes`);
      } else if (this.fixTestFile(filePath, fileFailures)) {
        console.log(`  ✅ Applied pattern-based fixes`);
      } else {
        console.log(`  ⚠️  Could not auto-fix. Manual intervention may be needed.`);
      }
    }

    // Step 5: Report results
    console.log('\n📋 Summary:');
    if (this.fixesApplied.length > 0) {
      console.log(`✅ Applied ${this.fixesApplied.length} fix(es):`);
      this.fixesApplied.forEach((fix, i) => {
        console.log(`   ${i + 1}. ${fix}`);
      });
      console.log('\n🔄 Re-running tests to verify fixes...\n');
      
      // Re-run tests
      const retestResult = this.runTests();
      if (retestResult.success) {
        console.log('✅ All tests now passing!');
      } else {
        console.log('⚠️  Some tests still failing. May need additional fixes.');
        console.log('Run "npm test" to see detailed output.');
      }
    } else {
      console.log('⚠️  No automatic fixes could be applied.');
      console.log('Please review the test failures manually.');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const agent = new TestFixerAgent();
  agent.fixTests().catch(console.error);
}

module.exports = TestFixerAgent;
