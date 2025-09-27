const fs = require('fs');
const path = require('path');

// Regular expression to match @package@version patterns and capture the package name
const versionedImportRegex = /from ["']([^@"]+@[^/"']+)["']/g;

// Function to process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace all versioned imports
    const newContent = content.replace(versionedImportRegex, (match, pkgWithVersion) => {
      const pkgName = pkgWithVersion.split('@')[0];
      modified = true;
      return `from "${pkgName}"`;
    });

    // Write back if changes were made
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Function to recursively process all files in a directory
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  let count = 0;

  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      if (processFile(fullPath)) {
        count++;
      }
    }
  });

  return count;
}

// Start processing from the src directory
const srcDir = path.join(__dirname, '..', 'src');
console.log('Processing files in:', srcDir);
const filesUpdated = processDirectory(srcDir);
console.log(`\nDone! Updated ${filesUpdated} files.`);
