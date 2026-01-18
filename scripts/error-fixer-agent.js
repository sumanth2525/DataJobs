// Automated Error Fixing Agent for Data Job Portal
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  fix: (msg) => console.log(`${colors.cyan}🔧${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.magenta}${'='.repeat(60)}\n  ${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

class ErrorFixerAgent {
  constructor() {
    this.fixesApplied = [];
    this.errorsFound = [];
    this.warnings = [];
  }

  // Read file content
  readFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      return null;
    }
  }

  // Write file content
  writeFile(filePath, content) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Fix 1: Missing imports
  fixMissingImports(filePath, content) {
    let fixed = false;
    let newContent = content;

    // Check for React usage without import
    if (content.includes('React.') || content.includes('useState') || content.includes('useEffect') || content.includes('useMemo')) {
      if (!content.includes("import React") && !content.includes("import {") && filePath.endsWith('.js') && !filePath.includes('node_modules')) {
        const hasReactImport = content.match(/import\s+.*\s+from\s+['"]react['"]/);
        if (!hasReactImport && (content.includes('useState') || content.includes('useEffect') || content.includes('useMemo') || content.includes('useRef'))) {
          const reactImports = [];
          if (content.includes('useState')) reactImports.push('useState');
          if (content.includes('useEffect')) reactImports.push('useEffect');
          if (content.includes('useMemo')) reactImports.push('useMemo');
          if (content.includes('useRef')) reactImports.push('useRef');
          
          const importLine = `import React, { ${reactImports.join(', ')} } from 'react';\n`;
          newContent = importLine + newContent;
          fixed = true;
          this.fixesApplied.push(`Added React imports to ${filePath}`);
        }
      }
    }

    return { content: newContent, fixed };
  }

  // Fix 2: Missing file extensions in imports
  fixImportExtensions(filePath, content) {
    let fixed = false;
    let newContent = content;

    // Fix relative imports missing .js extension (if needed)
    const importRegex = /import\s+.*\s+from\s+['"](\.\/[^'"]+)['"]/g;
    const matches = [...content.matchAll(importRegex)];
    
    matches.forEach(match => {
      const importPath = match[1];
      if (!importPath.endsWith('.js') && !importPath.endsWith('.css') && !importPath.includes('.')) {
        const newPath = importPath + '.js';
        newContent = newContent.replace(match[0], match[0].replace(importPath, newPath));
        fixed = true;
      }
    });

    if (fixed) {
      this.fixesApplied.push(`Fixed import extensions in ${filePath}`);
    }

    return { content: newContent, fixed };
  }

  // Fix 3: Console.log statements (optional cleanup)
  removeConsoleLogs(filePath, content) {
    // Only remove in production builds, keep for now
    return { content, fixed: false };
  }

  // Fix 4: Missing semicolons (optional)
  fixMissingSemicolons(filePath, content) {
    // Too risky, skip for now
    return { content, fixed: false };
  }

  // Fix 5: Environment variable issues
  checkEnvironmentVariables() {
    const issues = [];
    
    // Check backend .env
    const backendEnvPath = path.join(__dirname, 'backend', '.env');
    if (!fs.existsSync(backendEnvPath)) {
      const examplePath = path.join(__dirname, 'backend', '.env.example');
      if (fs.existsSync(examplePath)) {
        const exampleContent = this.readFile(examplePath);
        this.writeFile(backendEnvPath, exampleContent);
        this.fixesApplied.push('Created backend/.env from .env.example');
        issues.push('Created backend/.env file');
      } else {
        issues.push('Missing backend/.env file');
      }
    }

    // Check frontend .env
    const frontendEnvPath = path.join(__dirname, '.env');
    if (!fs.existsSync(frontendEnvPath)) {
      const examplePath = path.join(__dirname, '.env.example');
      if (fs.existsSync(examplePath)) {
        const exampleContent = this.readFile(examplePath);
        this.writeFile(frontendEnvPath, exampleContent);
        this.fixesApplied.push('Created .env from .env.example');
        issues.push('Created .env file');
      } else {
        issues.push('Missing .env file');
      }
    }

    return issues;
  }

  // Fix 6: Package.json issues
  checkPackageJson() {
    const issues = [];
    
    // Check frontend package.json
    const frontendPkg = path.join(__dirname, 'package.json');
    if (fs.existsSync(frontendPkg)) {
      try {
        const pkg = JSON.parse(this.readFile(frontendPkg));
        if (!pkg.dependencies.axios && !pkg.devDependencies.axios) {
          issues.push('axios missing from package.json');
        }
      } catch (error) {
        issues.push('Invalid package.json format');
      }
    }

    // Check backend package.json
    const backendPkg = path.join(__dirname, 'backend', 'package.json');
    if (fs.existsSync(backendPkg)) {
      try {
        const pkg = JSON.parse(this.readFile(backendPkg));
        if (!pkg.dependencies.express) {
          issues.push('express missing from backend package.json');
        }
        if (!pkg.dependencies['@supabase/supabase-js']) {
          issues.push('@supabase/supabase-js missing from backend package.json');
        }
      } catch (error) {
        issues.push('Invalid backend package.json format');
      }
    }

    return issues;
  }

  // Fix 7: Common syntax errors
  fixSyntaxErrors(filePath, content) {
    let fixed = false;
    let newContent = content;

    // Fix common issues
    // 1. Missing closing braces (basic check)
    const openBraces = (newContent.match(/{/g) || []).length;
    const closeBraces = (newContent.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      this.warnings.push(`Brace mismatch in ${filePath}`);
    }

    // 2. Fix double semicolons
    newContent = newContent.replace(/;;+/g, ';');
    if (newContent !== content) {
      fixed = true;
      this.fixesApplied.push(`Fixed double semicolons in ${filePath}`);
    }

    // 3. Fix trailing commas in objects/arrays (optional)
    // Too risky, skip for now

    return { content: newContent, fixed };
  }

  // Fix 8: Missing exports
  fixMissingExports(filePath, content) {
    let fixed = false;
    let newContent = content;

    // Check if file has default export but no export statement
    if (content.includes('export default') || content.includes('module.exports')) {
      // Already has exports
      return { content, fixed: false };
    }

    // Check for component definitions that should be exported
    const componentMatch = content.match(/(?:const|function)\s+(\w+)\s*[=:]\s*(?:\([^)]*\)\s*=>|function)/);
    if (componentMatch && filePath.includes('components')) {
      const componentName = componentMatch[1];
      if (componentName[0] === componentName[0].toUpperCase()) {
        // Likely a React component, add export
        if (!content.includes(`export default ${componentName}`) && !content.includes(`export { ${componentName}`)) {
          newContent = newContent.replace(
            new RegExp(`(const|function)\\s+${componentName}`),
            `export $1 ${componentName}`
          );
          fixed = true;
          this.fixesApplied.push(`Added export to ${componentName} in ${filePath}`);
        }
      }
    }

    return { content: newContent, fixed };
  }

  // Fix 9: Run ESLint auto-fix
  async runESLintFix() {
    try {
      log.info('Running ESLint auto-fix...');
      execSync('npx eslint --fix "src/**/*.js" "backend/**/*.js" --ext .js', {
        stdio: 'inherit',
        cwd: __dirname
      });
      this.fixesApplied.push('ESLint auto-fix completed');
      return true;
    } catch (error) {
      // ESLint might not be configured, that's okay
      log.warning('ESLint not available or no fixes needed');
      return false;
    }
  }

  // Fix 10: Install missing dependencies
  async installMissingDependencies() {
    try {
      log.info('Checking for missing dependencies...');
      
      // Check frontend
      if (fs.existsSync(path.join(__dirname, 'package.json'))) {
        try {
          execSync('npm install', { stdio: 'pipe', cwd: __dirname });
          this.fixesApplied.push('Frontend dependencies installed/updated');
        } catch (error) {
          // Dependencies might already be installed
        }
      }

      // Check backend
      if (fs.existsSync(path.join(__dirname, 'backend', 'package.json'))) {
        try {
          execSync('npm install', { stdio: 'pipe', cwd: path.join(__dirname, 'backend') });
          this.fixesApplied.push('Backend dependencies installed/updated');
        } catch (error) {
          // Dependencies might already be installed
        }
      }

      return true;
    } catch (error) {
      log.warning('Could not install dependencies automatically');
      return false;
    }
  }

  // Fix 11: Fix common React errors
  fixReactErrors(filePath, content) {
    let fixed = false;
    let newContent = content;

    // Fix missing key props in map
    if (content.includes('.map(') && !content.includes('key=') && content.includes('return')) {
      this.warnings.push(`Potential missing key prop in map() in ${filePath}`);
    }

    // Fix useEffect missing dependencies (warning only)
    if (content.includes('useEffect') && content.includes('[]')) {
      // Could be intentional, just warn
    }

    return { content: newContent, fixed };
  }

  // Fix 12: Fix backend server export
  fixServerExport(filePath, content) {
    if (filePath.includes('server.js')) {
      if (!content.includes('module.exports') && !content.includes('export default')) {
        // Add export if missing
        const newContent = content + '\n\nmodule.exports = app;';
        this.fixesApplied.push('Added module.exports to server.js');
        return { content: newContent, fixed: true };
      }
    }
    return { content, fixed: false };
  }

  // Scan and fix all files
  async scanAndFix() {
    log.section('ERROR FIXER AGENT - Starting Scan');

    // Step 1: Check environment variables
    log.info('Step 1: Checking environment variables...');
    const envIssues = this.checkEnvironmentVariables();
    if (envIssues.length > 0) {
      envIssues.forEach(issue => log.fix(issue));
    }

    // Step 2: Check package.json
    log.info('Step 2: Checking package.json files...');
    const pkgIssues = this.checkPackageJson();
    if (pkgIssues.length > 0) {
      pkgIssues.forEach(issue => log.warning(issue));
    }

    // Step 3: Install dependencies
    log.info('Step 3: Installing/updating dependencies...');
    await this.installMissingDependencies();

    // Step 4: Scan source files
    log.info('Step 4: Scanning source files for errors...');
    const srcDir = path.join(__dirname, 'src');
    const backendDir = path.join(__dirname, 'backend');

    const scanDirectory = (dir, fileList = []) => {
      if (!fs.existsSync(dir)) return fileList;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
          scanDirectory(filePath, fileList);
        } else if (file.endsWith('.js') && !file.includes('node_modules')) {
          fileList.push(filePath);
        }
      });
      
      return fileList;
    };

    const filesToScan = [
      ...scanDirectory(srcDir),
      ...scanDirectory(backendDir)
    ].filter(f => f && !f.includes('node_modules') && !f.includes('coverage'));

    log.info(`Found ${filesToScan.length} files to scan`);

    // Fix each file
    for (const filePath of filesToScan) {
      const content = this.readFile(filePath);
      if (!content) continue;

      let newContent = content;
      let fileFixed = false;

      // Apply all fixes
      const fixes = [
        () => this.fixMissingImports(filePath, newContent),
        () => this.fixImportExtensions(filePath, newContent),
        () => this.fixSyntaxErrors(filePath, newContent),
        () => this.fixMissingExports(filePath, newContent),
        () => this.fixReactErrors(filePath, newContent),
        () => this.fixServerExport(filePath, newContent)
      ];

      for (const fix of fixes) {
        const result = fix();
        if (result.fixed) {
          newContent = result.content;
          fileFixed = true;
        }
      }

      // Write fixed content
      if (fileFixed) {
        this.writeFile(filePath, newContent);
      }
    }

    // Step 5: Run ESLint auto-fix
    log.info('Step 5: Running ESLint auto-fix...');
    await this.runESLintFix();

    // Step 6: Check for build errors
    log.info('Step 6: Checking for build errors...');
    try {
      execSync('npm run build', { stdio: 'pipe', cwd: __dirname });
      log.success('Build check passed');
    } catch (error) {
      this.errorsFound.push('Build errors detected - check output above');
      log.error('Build check failed');
    }

    // Summary
    log.section('SCAN COMPLETE - SUMMARY');

    if (this.fixesApplied.length > 0) {
      log.success(`Applied ${this.fixesApplied.length} fixes:`);
      this.fixesApplied.forEach(fix => log.fix(`  - ${fix}`));
    } else {
      log.info('No automatic fixes were needed');
    }

    if (this.warnings.length > 0) {
      log.warning(`Found ${this.warnings.length} warnings:`);
      this.warnings.forEach(warning => log.warning(`  - ${warning}`));
    }

    if (this.errorsFound.length > 0) {
      log.error(`Found ${this.errorsFound.length} errors:`);
      this.errorsFound.forEach(error => log.error(`  - ${error}`));
    }

    console.log('\n' + '='.repeat(60));
    if (this.errorsFound.length === 0 && this.fixesApplied.length > 0) {
      log.success('All errors fixed successfully!');
      return 0;
    } else if (this.errorsFound.length === 0) {
      log.success('No errors found!');
      return 0;
    } else {
      log.error('Some errors require manual attention');
      return 1;
    }
  }
}

// Run the agent
if (require.main === module) {
  const agent = new ErrorFixerAgent();
  agent.scanAndFix().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('Agent error:', error);
    process.exit(1);
  });
}

module.exports = ErrorFixerAgent;
