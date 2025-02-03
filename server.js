const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const server = http.createServer(async (req, res) => {
    if (req.method === 'PUT' && req.url.startsWith('/tasks/')) {
        const id = parseInt(req.url.split('/')[2], 10);
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { completed } = JSON.parse(body);
            const filePath = path.join(__dirname, 'tasks.json');
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                } else {
                    let tasks = JSON.parse(content);
                    const taskIndex = tasks.findIndex(task => task.id === id);
                    if (taskIndex !== -1) {
                        tasks[taskIndex].completed = completed;
                        fs.writeFile(filePath, JSON.stringify(tasks, null, 2), err => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: 'Internal Server Error' }));
                            } else {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify(tasks));
                            }
                        });
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Task not found' }));
                    }
                }
            });
        });
    }

    else if (req.method === 'GET') {
        if (req.url === '/' || req.url === '/index.html') {
            const filePath = path.join(__dirname, 'index.html');
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('Internal Server Error', 'utf-8');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                }
            });
        } else if (req.url === '/tasks') {
            const filePath = path.join(__dirname,  'tasks.json');
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(content, 'utf-8');
                }
            });
        } else if (req.url === '/weather') {
            try {
                const apiKey = 'bc8b6f28a61f5849510799d5038e6d15'; 
                const city = 'Gdynia'; 

                const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

                https.get(apiUrl, (response) => {
                    let data = '';

                    response.on('data', (chunk) => {
                        data += chunk;
                    });

                    response.on('end', () => {
                        const weatherData = JSON.parse(data);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(weatherData));
                    });
                }).on('error', (error) => {
                    console.error('Błąd pobierania danych pogodowych:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                });
            } catch (error) {
                console.error(error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
        } else {
            const filePath = path.join(__dirname, req.url);
            const extname = path.extname(filePath);
            let contentType = 'text/html';

            switch (extname) {
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                    contentType = 'image/jpg';
                    break;
                case '.ico':
                    contentType = 'image/x-icon';
                    break;
            }

            fs.readFile(filePath, (err, content) => {
                if (err) {
                    if (err.code == 'ENOENT') {
                        fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
                            res.writeHead(404, { 'Content-Type': 'text/html' });
                            res.end(content, 'utf-8');
                        });
                    } else {
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end('Internal Server Error', 'utf-8');
                    }
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });
        }
    } else if (req.method === 'POST' && req.url === '/tasks') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const newTask = JSON.parse(body);
            const filePath = path.join(__dirname,  'tasks.json');
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                } else {
                    const tasks = JSON.parse(content);
                    tasks.push(newTask);
                    fs.writeFile(filePath, JSON.stringify(tasks, null, 2), err => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Internal Server Error' }));
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(tasks));
                        }
                    });
                }
            });
        });
    } else if (req.method === 'DELETE' && req.url.startsWith('/tasks/')) {
        const id = parseInt(req.url.split('/')[2], 10);
        const filePath = path.join(__dirname,  'tasks.json');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            } else {
                let tasks = JSON.parse(content);
                tasks = tasks.filter(task => task.id !== id);
                fs.writeFile(filePath, JSON.stringify(tasks, null, 2), err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Internal Server Error' }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(tasks));
                    }
                });
            }
        });
    } else {
        res.writeHead(405, { 'Content-Type': 'text/html' });
        res.end('Method Not Allowed', 'utf-8');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
