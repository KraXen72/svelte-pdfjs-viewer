#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Locales to preserve
const PRESERVE_LOCALES = new Set(['en', 'cs', 'sk', 'uk']);

// Target output directory
const OUTPUT_DIR = path.join(__dirname, 'static', 'pdfjs-dist');

/**
 * Check if a locale should be preserved
 */
function shouldPreserveLocale(localeName) {
  // Exact match or en-* variants
  if (PRESERVE_LOCALES.has(localeName)) {
    return true;
  }
  // Check for en-* variants
  if (localeName.startsWith('en-')) {
    return true;
  }
  return false;
}

/**
 * Recursively copy directory
 */
function copyDirectory(src, dest, options = {}) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Special handling for locale directory
      if (options.isLocaleDir) {
        if (shouldPreserveLocale(entry.name)) {
          copyDirectory(srcPath, destPath);
        }
        continue;
      }

      // Check if this is the locale directory
      const isLocaleDir = entry.name === 'locale';
      copyDirectory(srcPath, destPath, { isLocaleDir });
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      
      // Skip sourcemaps
      if (ext === '.map') {
        continue;
      }
      
      // Skip PDF files
      if (ext === '.pdf') {
        continue;
      }

      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Clean output directory
 */
function cleanOutputDir() {
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Error: No source directory provided');
    console.error('Usage: node optimize-pdfjs-build.js <source-directory>');
    process.exit(1);
  }

  const sourceDir = path.resolve(args[0]);

  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Source directory does not exist: ${sourceDir}`);
    process.exit(1);
  }

  if (!fs.statSync(sourceDir).isDirectory()) {
    console.error(`Error: Source path is not a directory: ${sourceDir}`);
    process.exit(1);
  }

  console.log('Starting PDF.js build optimization...');
  console.log(`Source: ${sourceDir}`);
  console.log(`Target: ${OUTPUT_DIR}`);
  console.log('');

  // Clean output directory
  console.log('Cleaning output directory...');
  cleanOutputDir();

  // Copy build directory
  const buildSrc = path.join(sourceDir, 'build');
  const buildDest = path.join(OUTPUT_DIR, 'build');
  if (fs.existsSync(buildSrc)) {
    console.log('Copying build directory...');
    copyDirectory(buildSrc, buildDest);
  } else {
    console.warn('Warning: build directory not found in source');
  }

  // Copy web directory
  const webSrc = path.join(sourceDir, 'web');
  const webDest = path.join(OUTPUT_DIR, 'web');
  if (fs.existsSync(webSrc)) {
    console.log('Copying web directory (filtering locales)...');
    copyDirectory(webSrc, webDest);
  } else {
    console.warn('Warning: web directory not found in source');
  }

  console.log('');
  console.log('Optimization complete!');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('');
  console.log('Preserved locales:');
  const localeDir = path.join(OUTPUT_DIR, 'web', 'locale');
  if (fs.existsSync(localeDir)) {
    const locales = fs.readdirSync(localeDir);
    locales.forEach(locale => console.log(`  - ${locale}`));
  }
}

// Run the script
main();
