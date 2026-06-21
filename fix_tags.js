const fs = require('fs');
const path = require('path');

function scanProjectFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git')) {
                results = results.concat(scanProjectFiles(file));
            }
        } else {
            if (file.endsWith('.html') || file.endsWith('.ejs')) {
                results.push(file);
            }
        }
    });
    return results;
}

console.log("Scanning your template engines...");
const files = scanProjectFiles('.');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // 1. Fix broken relative paths (script.js -> /script.js) for sub-routes
    if (content.match(/src=["']script\.js["']/g)) {
        content = content.replace(/src=["']script\.js["']/g, 'src="/script.js"');
        modified = true;
        console.log(`[FIXED] Converted relative script tag path in: ${file}`);
    } 
    
    // 2. Inject the absolute script tag if completely missing from the template
    if (content.includes('</body>') && !content.includes('src="/script.js"')) {
        content = content.replace('</body>', '<script src="/script.js"></script>\n</body>');
        modified = true;
        console.log(`[INJECTED] Added missing global script link into: ${file}`);
    }

    if (modified) {
        fs.writeFileSync(file, content, 'utf8');
    }
});

console.log("All templates synced with Lavegious core server architecture configuration successfully!");
