const express = require('express');
const http = require('http');
const fs = require('fs');

const WebSocket = require('ws');
const { spawn, exec } = require('child_process');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the public directory
app.use(express.static('public'));

// Set the static file directory
app.use('/styles.css', express.static(__dirname + '/public'));

app.get('/styles.css', (req, res) => {
  res.set('Content-Type', 'text/css');
  res.sendFile(__dirname + '/public/styles.css');
});

// Define route for the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Define route for the HTTPX Runner page
app.get('/httpx', (req, res) => {
  res.sendFile(__dirname + '/public/httpx-runner.html');
});

// Define route for the WebArchive page
app.get('/webarchive', (req, res) => {
  res.sendFile(__dirname + '/public/webarchive.html');
});

// --------- Github Dorks -------- //
app.get('/github-dorks', (req, res) => {
  res.sendFile(__dirname + '/public/github-dork-helper.html');
});

app.get('/github-dorks-api', (req, res) => {
    const domain = req.query.domain;

    // Read dorks from dorks.txt file
    fs.readFile('dorks.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading dorks file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Split the file content into an array of dorks
        const dorks = data.split('\n').filter(dork => dork.trim() !== '');

        // GitHub search URL
        const githubSearchURL = 'https://github.com/search?q=';

        // Generate search links
        const searchLinks = dorks.map(dork => ({
            link: `${githubSearchURL}${encodeURIComponent(domain)}+${encodeURIComponent(dork)}&type=code`,
            dork
        }));

        res.json(searchLinks);
    });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});

wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  ws.on('message', (message) => {
    const urls = message;
    const command = `/bin/bash -c "echo -e '${urls}' | /root/go/bin/httpx -sc -cl -title -silent -fr"`;
    const childProcess = spawn(command, { shell: true });
    let output = '';

    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    childProcess.on('close', () => {
      ws.send(output);
    });
  });
});
