const fs = require('fs');
const path = require('path');

const helperName = process.argv[2];

if (!helperName) {
  console.error('❌  Please provide a helper name, e.g., node generate-helper.js Str');
  process.exit(1);
}

const helpersDir = path.join(__dirname, 'app', 'utils');
const filePath = path.join(helpersDir, `${helperName}.js`);
const indexPath = path.join(helpersDir, 'index.js');

if (!fs.existsSync(helpersDir)) {
  fs.mkdirSync(helpersDir, { recursive: true });
}

// 1. Generate helper file
if (fs.existsSync(filePath)) {
  console.warn(`⚠️  Helper "${helperName}" already exists.`);
} else {
  const template = `// app/utils/${helperName}.js

/**
 * Helper functions for ${helperName.toLowerCase()} utilities
 */

function exampleHelper() {
  // TODO: Implement this
}

module.exports = {
  exampleHelper,
};
`;

  fs.writeFileSync(filePath, template);
  console.log(`✅ Created helper: ${filePath}`);
}

// 2. Update index.js
let indexContent = '';

if (fs.existsSync(indexPath)) {
  indexContent = fs.readFileSync(indexPath, 'utf8');
} else {
  fs.writeFileSync(indexPath, '');
}

const importLine = `const ${helperName} = require('./${helperName}');`;
const exportLine = `  ${helperName},`;

if (!indexContent.includes(importLine)) {
  const lines = indexContent.split('\n').filter(Boolean);
  const importLines = lines.filter((line) => line.startsWith('const '));
  const exportStart = lines.findIndex((line) => line.includes('module.exports = {'));

  if (exportStart === -1) {
    indexContent = `${importLine}\n\nmodule.exports = {\n  ${helperName},\n};`;
  } else {
    importLines.push(importLine);
    const exportLines = lines.slice(exportStart + 1, -1).map((line) => line.trim());
    exportLines.push(`${helperName},`);

    indexContent = [...importLines, '', 'module.exports = {', ...[...new Set(exportLines)].map((line) => '  ' + line), '};'].join('\n');
  }

  fs.writeFileSync(indexPath, indexContent);
  console.log('🔁 Updated helpers/index.js');
}
