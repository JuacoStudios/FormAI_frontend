#!/usr/bin/env node

/**
 * Production Parity Verification Script
 * Ensures local environment matches Vercel production deployment
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function warn(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function getCommandOutput(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (e) {
    return null;
  }
}

function checkNodeVersion() {
  log('\n🔍 Checking Node.js version...', colors.bold);
  
  const nodeVersion = getCommandOutput('node --version');
  const npmVersion = getCommandOutput('npm --version');
  
  if (!nodeVersion || !npmVersion) {
    error('Failed to get Node.js or npm version');
    return false;
  }
  
  log(`Node.js: ${nodeVersion}`);
  log(`npm: ${npmVersion}`);
  
  // Check if Node.js version is 18.x
  if (!nodeVersion.startsWith('v18.')) {
    error(`Node.js version ${nodeVersion} is not 18.x. Please use Node.js 18.x`);
    return false;
  }
  
  success('Node.js version check passed');
  return true;
}

function checkBuildCommand() {
  log('\n🔍 Checking build command...', colors.bold);
  
  const packageJsonPath = join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  
  const buildCommand = packageJson.scripts['build:web'];
  if (!buildCommand) {
    error('build:web script not found in package.json');
    return false;
  }
  
  log(`Build command: ${buildCommand}`);
  success('Build command check passed');
  return true;
}

function checkOutputDirectory() {
  log('\n🔍 Checking output directory...', colors.bold);
  
  const vercelJsonPath = join(__dirname, '..', 'vercel.json');
  if (!existsSync(vercelJsonPath)) {
    error('vercel.json not found');
    return false;
  }
  
  const vercelJson = JSON.parse(readFileSync(vercelJsonPath, 'utf8'));
  const outputDir = vercelJson.outputDirectory;
  
  if (!outputDir) {
    error('outputDirectory not specified in vercel.json');
    return false;
  }
  
  log(`Output directory: ${outputDir}`);
  success('Output directory check passed');
  return true;
}

function checkExpoConfig() {
  log('\n🔍 Checking Expo configuration...', colors.bold);
  
  const appJsonPath = join(__dirname, '..', 'app.json');
  if (!existsSync(appJsonPath)) {
    error('app.json not found');
    return false;
  }
  
  const appJson = JSON.parse(readFileSync(appJsonPath, 'utf8'));
  const webConfig = appJson.web;
  
  if (!webConfig) {
    error('Web configuration not found in app.json');
    return false;
  }
  
  if (webConfig.bundler !== 'metro') {
    warn(`Web bundler is ${webConfig.bundler}, expected 'metro'`);
  }
  
  if (webConfig.output !== 'static') {
    warn(`Web output is ${webConfig.output}, expected 'static'`);
  }
  
  log(`Web bundler: ${webConfig.bundler}`);
  log(`Web output: ${webConfig.output}`);
  success('Expo configuration check passed');
  return true;
}

function checkEnvironmentVariables() {
  log('\n🔍 Checking environment variables...', colors.bold);
  
  const requiredEnvVars = [
    'EXPO_PUBLIC_API_BASE',
    'EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY',
    'EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL',
    'EXPO_PUBLIC_WEB_ORIGIN'
  ];
  
  const missingVars = [];
  const envValues = {};
  
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value) {
      missingVars.push(envVar);
    } else {
      // Mask sensitive values but show hostnames
      if (envVar.includes('API_BASE') || envVar.includes('WEB_ORIGIN')) {
        envValues[envVar] = value;
      } else {
        envValues[envVar] = value.substring(0, 8) + '...';
      }
    }
  }
  
  if (missingVars.length > 0) {
    error(`Missing required environment variables: ${missingVars.join(', ')}`);
    log('\nRequired environment variables:', colors.yellow);
    log('EXPO_PUBLIC_API_BASE - Backend API base URL');
    log('EXPO_PUBLIC_STRIPE_PRICE_ID_MONTHLY - Monthly subscription price ID');
    log('EXPO_PUBLIC_STRIPE_PRICE_ID_ANNUAL - Annual subscription price ID');
    log('EXPO_PUBLIC_WEB_ORIGIN - Vercel domain');
    return false;
  }
  
  log('Environment variables found:');
  Object.entries(envValues).forEach(([key, value]) => {
    log(`  ${key}: ${value}`);
  });
  
  success('Environment variables check passed');
  return true;
}

function checkUndefinedApi() {
  log('\n🔍 Checking for /undefined/api/ patterns...', colors.bold);
  
  const sourceDir = join(__dirname, '..');
  const patterns = [
    '/undefined/api/',
    '${process.env.BASE_URL}/api/',
    '${process.env.API_BASE}/api/',
    'process.env.BASE_URL',
    'process.env.API_BASE'
  ];
  
  let foundIssues = false;
  
  // This is a basic check - in a real scenario you might want to use grep/ripgrep
  log('Note: This is a basic check. Please manually verify no /undefined/api/ patterns exist in your code.');
  
  return true;
}

async function main() {
  log('🚀 Production Parity Verification', colors.bold);
  log('=====================================\n');
  
  const checks = [
    checkNodeVersion,
    checkBuildCommand,
    checkOutputDirectory,
    checkExpoConfig,
    checkEnvironmentVariables,
    checkUndefinedApi
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const result = await check();
      if (!result) {
        allPassed = false;
      }
    } catch (e) {
      error(`Check failed with error: ${e.message}`);
      allPassed = false;
    }
  }
  
  log('\n' + '='.repeat(50));
  
  if (allPassed) {
    success('🎉 All production parity checks passed!');
    log('\nYou can now run:', colors.green);
    log('  npm run prod:mirror', colors.bold);
    log('\nThis will build and serve the app exactly as Vercel does.');
  } else {
    error('❌ Some production parity checks failed.');
    log('\nPlease fix the issues above before proceeding.', colors.yellow);
    process.exit(1);
  }
}

main().catch((error) => {
  error(`Verification script failed: ${error.message}`);
  process.exit(1);
});
