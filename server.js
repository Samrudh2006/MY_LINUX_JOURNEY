const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8086;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/submit-review') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const reviewData = JSON.parse(body);
        console.log("📥 NEW REVIEW RECEIVED FOR SAMRUDH:", reviewData);
        
        // Append to submitted_reviews.json
        const reviewsPath = path.join(PUBLIC_DIR, 'submitted_reviews.json');
        let reviews = [];
        if (fs.existsSync(reviewsPath)) {
          try { reviews = JSON.parse(fs.readFileSync(reviewsPath, 'utf8')); } catch(e) {}
        }
        reviews.unshift({ ...reviewData, timestamp: new Date().toISOString() });
        fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: "Review recorded successfully" }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: "Invalid JSON" }));
      }
    });
    return;
  }

  let cleanUrl = req.url.split('?')[0];
  let filePath = path.join(PUBLIC_DIR, cleanUrl === '/' ? 'index.html' : cleanUrl);
  let extname = String(path.extname(filePath)).toLowerCase();
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Node HTTP Server running at http://localhost:${PORT}/`);
});
