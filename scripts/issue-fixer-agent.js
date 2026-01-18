// Advanced Issue Detection and Auto-Fix Agent
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bright: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  fix: (msg) => console.log(`${colors.cyan}🔧${colors.reset} ${msg}`),
  issue: (msg) => console.log(`${colors.red}🐛${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.magenta}${'='.repeat(70)}\n  ${colors.bright}${msg}${colors.reset}\n${'='.repeat(70)}${colors.reset}\n`)
};

class IssueFixerAgent {
  constructor() {
    this.issuesFound = [];
    this.fixesApplied = [];
    this.warnings = [];
    this.stats = {
      filesScanned: 0,
      issuesDetected: 0,
      issuesFixed: 0,
      warnings: 0
    };
  }

  readFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      return null;
    }
  }

  writeFile(filePath, content) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Issue 1: Console statements
  checkAndFixConsoleStatements(filePath, content) {
    let fixed = false;
    let newContent = content;
    const consoleMatches = content.match(/console\.(log|error|warn|debug)\(/g);

    if (consoleMatches) {
      // Keep service worker logs in index.js
      if (filePath.includes('index.js') && content.includes('serviceWorker')) {
        // Keep these logs
        return { content, fixed: false };
      }

      // Remove or comment out console statements
      const lines = newContent.split('\n');
      const fixedLines = lines.map((line, index) => {
        if (line.trim().match(/console\.(log|error|warn|debug)\(/)) {
          // Check if it's in a comment already
          if (line.trim().startsWith('//')) {
            return line;
          }
          // Comment out the console statement
          const indent = line.match(/^(\s*)/)[1];
          this.issuesFound.push({
            type: 'console_statement',
            file: filePath,
            line: index + 1,
            severity: 'low',
            message: 'Console statement found'
          });
          fixed = true;
          return `${indent}// ${line.trim()} // Removed by Issue Fixer Agent`;
        }
        return line;
      });

      if (fixed) {
        newContent = fixedLines.join('\n');
        this.fixesApplied.push(`Removed/commented console statements in ${filePath}`);
      }
    }

    return { content: newContent, fixed };
  }

  // Issue 2: Missing error handling
  checkErrorHandling(filePath, content) {
    const issues = [];
    
    // Check for async functions without try-catch
    const asyncFunctionRegex = /const\s+\w+\s*=\s*async\s*\([^)]*\)\s*=>\s*{/g;
    const asyncFunctions = [...content.matchAll(asyncFunctionRegex)];
    
    asyncFunctions.forEach(match => {
      const functionStart = match.index;
      const functionBody = content.substring(functionStart, functionStart + 500);
      if (!functionBody.includes('try') && !functionBody.includes('catch')) {
        issues.push({
          type: 'missing_error_handling',
          file: filePath,
          line: content.substring(0, functionStart).split('\n').length,
          severity: 'medium',
          message: 'Async function without try-catch block'
        });
      }
    });

    return issues;
  }

  // Issue 3: Missing PropTypes or type checking
  checkTypeSafety(filePath, content) {
    if (!filePath.includes('components')) return [];
    
    const issues = [];
    const componentRegex = /(const|function)\s+(\w+)\s*[=:]\s*(?:\([^)]*\)\s*=>|function)/;
    const match = content.match(componentRegex);
    
    if (match && !content.includes('PropTypes') && !content.includes('interface') && !content.includes('type ')) {
      issues.push({
        type: 'missing_type_checking',
        file: filePath,
        severity: 'low',
        message: 'Component without PropTypes or TypeScript types'
      });
    }

    return issues;
  }

  // Issue 4: Unused variables
  checkUnusedVariables(filePath, content) {
    // This is handled by ESLint, but we can detect obvious cases
    const issues = [];
    const importRegex = /import\s+.*\s+from\s+['"][^'"]+['"]/g;
    const imports = [...content.matchAll(importRegex)];
    
    imports.forEach(match => {
      const importLine = match[0];
      const importedItems = importLine.match(/\{([^}]+)\}/);
      if (importedItems) {
        const items = importedItems[1].split(',').map(i => i.trim());
        items.forEach(item => {
          const itemName = item.split(' as ')[0].trim();
          // Check if item is used (simple check)
          const usageRegex = new RegExp(`\\b${itemName}\\b`, 'g');
          const matches = content.match(usageRegex);
          if (matches && matches.length <= 1) {
            // Only found in import, likely unused
            issues.push({
              type: 'unused_import',
              file: filePath,
              severity: 'low',
              message: `Potentially unused import: ${itemName}`
            });
          }
        });
      }
    });

    return issues;
  }

  // Issue 5: Missing key props in map
  checkMissingKeys(filePath, content) {
    const issues = [];
    const mapRegex = /\.map\s*\([^)]*\)\s*=>/g;
    const maps = [...content.matchAll(mapRegex)];
    
    maps.forEach(match => {
      const mapStart = match.index;
      const context = content.substring(Math.max(0, mapStart - 100), mapStart + 200);
      if (!context.includes('key=') && !context.includes('key:')) {
        issues.push({
          type: 'missing_key_prop',
          file: filePath,
          line: content.substring(0, mapStart).split('\n').length,
          severity: 'medium',
          message: 'Array.map() without key prop'
        });
      }
    });

    return issues;
  }

  // Issue 6: Security issues
  checkSecurityIssues(filePath, content) {
    const issues = [];
    
    // Check for hardcoded secrets
    const secretPatterns = [
      /password\s*[:=]\s*['"][^'"]+['"]/i,
      /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
      /secret\s*[:=]\s*['"][^'"]+['"]/i,
      /token\s*[:=]\s*['"][^'"]+['"]/i
    ];

    secretPatterns.forEach((pattern, index) => {
      if (pattern.test(content) && !content.includes('process.env')) {
        issues.push({
          type: 'hardcoded_secret',
          file: filePath,
          severity: 'high',
          message: 'Potential hardcoded secret detected'
        });
      }
    });

    // Check for dangerous eval
    if (content.includes('eval(') || content.includes('Function(')) {
      issues.push({
        type: 'dangerous_code',
        file: filePath,
        severity: 'high',
        message: 'Dangerous eval() or Function() usage detected'
      });
    }

    return issues;
  }

  // Issue 7: Performance issues
  checkPerformanceIssues(filePath, content) {
    const issues = [];
    
    // Check for missing useMemo/useCallback
    if (content.includes('useState') && content.includes('.map(')) {
      const expensiveOperations = content.match(/(\.filter|\.reduce|\.sort)\(/g);
      if (expensiveOperations && !content.includes('useMemo')) {
        issues.push({
          type: 'performance_optimization',
          file: filePath,
          severity: 'low',
          message: 'Consider using useMemo for expensive operations'
        });
      }
    }

    return issues;
  }

  // Issue 8: Accessibility issues
  checkAccessibilityIssues(filePath, content) {
    const issues = [];
    
    // Check for images without alt
    if (content.includes('<img') && !content.includes('alt=')) {
      issues.push({
        type: 'accessibility',
        file: filePath,
        severity: 'medium',
        message: 'Image without alt attribute'
      });
    }

    // Check for buttons without aria-label
    const buttonRegex = /<button[^>]*>/g;
    const buttons = [...content.matchAll(buttonRegex)];
    buttons.forEach(button => {
      if (!button[0].includes('aria-label') && !button[0].includes('aria-labelledby')) {
        const buttonText = content.substring(button.index, button.index + 200);
        if (!buttonText.match(/>[^<]+</)) {
          // Button without visible text
          issues.push({
            type: 'accessibility',
            file: filePath,
            severity: 'medium',
            message: 'Button without aria-label or visible text'
          });
        }
      }
    });

    return issues;
  }

  // Issue 9: Code duplication
  checkCodeDuplication(filePath, content) {
    // Simple check for repeated code blocks
    const issues = [];
    const lines = content.split('\n');
    
    // Check for repeated function patterns
    const functionPatterns = {};
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('const ') && trimmed.includes('=') && trimmed.includes('=>')) {
        const pattern = trimmed.substring(0, 50);
        if (functionPatterns[pattern]) {
          functionPatterns[pattern].count++;
        } else {
          functionPatterns[pattern] = { count: 1, line: index + 1 };
        }
      }
    });

    Object.entries(functionPatterns).forEach(([pattern, data]) => {
      if (data.count > 3) {
        issues.push({
          type: 'code_duplication',
          file: filePath,
          severity: 'low',
          message: 'Potential code duplication detected'
        });
      }
    });

    return issues;
  }

  // Issue 10: Missing dependencies in useEffect
  checkUseEffectDependencies(filePath, content) {
    const issues = [];
    const useEffectRegex = /useEffect\s*\([^)]*\)/g;
    const useEffects = [...content.matchAll(useEffectRegex)];
    
    useEffects.forEach(match => {
      const effectCode = match[0];
      if (effectCode.includes('[]') && effectCode.includes('useState')) {
        // Empty dependency array with state usage might be intentional
        // But we can flag it for review
        issues.push({
          type: 'useEffect_dependencies',
          file: filePath,
          severity: 'low',
          message: 'useEffect with empty dependencies - verify if intentional'
        });
      }
    });

    return issues;
  }

  // Scan and fix all files
  async scanAndFix() {
    log.section('ISSUE DETECTION & AUTO-FIX AGENT - Starting Scan');

    const srcDir = path.join(__dirname, 'src');
    const backendDir = path.join(__dirname, 'backend');

    const scanDirectory = (dir, fileList = []) => {
      if (!fs.existsSync(dir)) return fileList;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('build')) {
          scanDirectory(filePath, fileList);
        } else if (file.endsWith('.js') && !file.includes('node_modules') && !file.includes('coverage')) {
          fileList.push(filePath);
        }
      });
      
      return fileList;
    };

    const filesToScan = [
      ...scanDirectory(srcDir),
      ...scanDirectory(backendDir)
    ].filter(f => f && !f.includes('node_modules') && !f.includes('coverage'));

    this.stats.filesScanned = filesToScan.length;
    log.info(`Scanning ${filesToScan.length} files for issues...`);

    // Scan each file
    for (const filePath of filesToScan) {
      const content = this.readFile(filePath);
      if (!content) continue;

      let newContent = content;
      let fileFixed = false;

      // Check and fix console statements
      const consoleResult = this.checkAndFixConsoleStatements(filePath, newContent);
      if (consoleResult.fixed) {
        newContent = consoleResult.content;
        fileFixed = true;
      }

      // Check for other issues (don't auto-fix, just report)
      const errorHandlingIssues = this.checkErrorHandling(filePath, newContent);
      const typeSafetyIssues = this.checkTypeSafety(filePath, newContent);
      const unusedVarIssues = this.checkUnusedVariables(filePath, newContent);
      const missingKeyIssues = this.checkMissingKeys(filePath, newContent);
      const securityIssues = this.checkSecurityIssues(filePath, newContent);
      const performanceIssues = this.checkPerformanceIssues(filePath, newContent);
      const accessibilityIssues = this.checkAccessibilityIssues(filePath, newContent);
      const duplicationIssues = this.checkCodeDuplication(filePath, newContent);
      const useEffectIssues = this.checkUseEffectDependencies(filePath, newContent);

      // Add all issues
      this.issuesFound.push(
        ...errorHandlingIssues,
        ...typeSafetyIssues,
        ...unusedVarIssues,
        ...missingKeyIssues,
        ...securityIssues,
        ...performanceIssues,
        ...accessibilityIssues,
        ...duplicationIssues,
        ...useEffectIssues
      );

      // Write fixed content
      if (fileFixed) {
        this.writeFile(filePath, newContent);
      }
    }

    // Run ESLint
    log.info('Running ESLint auto-fix...');
    try {
      execSync('npx eslint --fix "src/**/*.js" "backend/**/*.js" --ext .js', {
        stdio: 'pipe',
        cwd: __dirname
      });
      this.fixesApplied.push('ESLint auto-fix completed');
    } catch (error) {
      // ESLint might report issues, that's okay
    }

    // Categorize issues
    const issuesBySeverity = {
      high: this.issuesFound.filter(i => i.severity === 'high'),
      medium: this.issuesFound.filter(i => i.severity === 'medium'),
      low: this.issuesFound.filter(i => i.severity === 'low')
    };

    this.stats.issuesDetected = this.issuesFound.length;
    this.stats.issuesFixed = this.fixesApplied.length;
    this.stats.warnings = this.warnings.length;

    // Generate report
    log.section('SCAN COMPLETE - DETAILED REPORT');

    log.info(`Files Scanned: ${this.stats.filesScanned}`);
    log.info(`Issues Detected: ${this.stats.issuesDetected}`);
    log.info(`Fixes Applied: ${this.stats.issuesFixed}`);
    log.info(`Warnings: ${this.stats.warnings}`);

    if (issuesBySeverity.high.length > 0) {
      log.error(`\nHIGH PRIORITY ISSUES (${issuesBySeverity.high.length}):`);
      issuesBySeverity.high.forEach(issue => {
        log.issue(`  ${issue.file}:${issue.line || ''} - ${issue.message} (${issue.type})`);
      });
    }

    if (issuesBySeverity.medium.length > 0) {
      log.warning(`\nMEDIUM PRIORITY ISSUES (${issuesBySeverity.medium.length}):`);
      issuesBySeverity.medium.forEach(issue => {
        log.warning(`  ${issue.file}:${issue.line || ''} - ${issue.message} (${issue.type})`);
      });
    }

    if (issuesBySeverity.low.length > 0) {
      log.info(`\nLOW PRIORITY ISSUES (${issuesBySeverity.low.length}):`);
      issuesBySeverity.low.forEach(issue => {
        log.info(`  ${issue.file}:${issue.line || ''} - ${issue.message} (${issue.type})`);
      });
    }

    if (this.fixesApplied.length > 0) {
      log.success(`\nFIXES APPLIED (${this.fixesApplied.length}):`);
      this.fixesApplied.forEach(fix => {
        log.fix(`  - ${fix}`);
      });
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    if (issuesBySeverity.high.length > 0) {
      log.error(`⚠️  ${issuesBySeverity.high.length} HIGH priority issues need attention!`);
      return 1;
    } else if (this.issuesFound.length === 0) {
      log.success('✅ No issues found! Code is clean.');
      return 0;
    } else {
      log.warning(`⚠️  Found ${this.issuesFound.length} issues (mostly low/medium priority)`);
      return 0;
    }
  }
}

// Run the agent
if (require.main === module) {
  const agent = new IssueFixerAgent();
  agent.scanAndFix().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('Agent error:', error);
    process.exit(1);
  });
}

module.exports = IssueFixerAgent;
