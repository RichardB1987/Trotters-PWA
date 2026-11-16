const express = require('express');
const http = require('http');
const https = require('https');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve all static assets from the 'public' folder
app.use(express.static('public'));

// Root route handler - automatically serves your main dashboard
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Robust Stream Proxy Endpoint (Clean audio stream without tick-tocking metadata)
app.get('/proxy-stream', (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send('Missing "url" query parameter.');
    }

    try {
        const parsedUrl = new URL(targetUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;

        const proxyReq = client.request(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*'
            },
            agent: new client.Agent({ keepAlive: true })
        }, (proxyRes) => {
            if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
                let redirectUrl = proxyRes.headers.location;
                if (redirectUrl.startsWith('/')) {
                    redirectUrl = `${parsedUrl.protocol}//${parsedUrl.host}${redirectUrl}`;
                }
                return res.redirect(`/proxy-stream?url=${encodeURIComponent(redirectUrl)}&_t=${Date.now()}`);
            }

            res.writeHead(proxyRes.statusCode, {
                'Content-Type': proxyRes.headers['content-type'] || 'audio/mpeg',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            });

            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            console.error('Proxy stream error:', err.message);
            if (!res.headersSent) {
                res.status(500).send('Proxy error streaming audio.');
            }
        });

        req.on('close', () => {
            proxyReq.destroy();
        });

        proxyReq.end();
    } catch (err) {
        console.error('Invalid proxy URL:', err.message);
        res.status(400).send('Invalid URL format.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running successfully at: http://localhost:${PORT}`);
});