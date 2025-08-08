const fs = require('fs');
const http = require("http");
const net = require('net');
const os = require('os');
const path = require('path');

class Heartbeat {
    constructor() {
        this.cachedResponse = this.generateResponse();
        this.socketPath = this.setSocketPath();
    }

    setSocketPath() {
        return os.platform() === 'darwin'
            ? '/tmp/rssbot-socket.sock'
            : '/run/rssbot-socket.sock';
    }

    startPushing() {
        function callURL() {
            const url = process.env.MONITOR_URL;

            http.get(url, (response) => {
            }).on('error', (error) => {
                console.error(`Error calling URL: ${error.message}`);
            });

            console.log("RSSBot Standing By!");
        }

        callURL();

        // Call the URL every 300 seconds (3 minutes) using the interval timer
        const interval = 298000; // 298 seconds * 1000 milliseconds
        setInterval(callURL, interval);
    }

    async handleShutdown() {
        console.log('Shutting down server...');

        try {
            await fs.promises.access(this.socketPath);
            await fs.promises.unlink(this.socketPath);
            console.log('Socket file removed');
        } catch (err) {
            console.error('Error removing socket file:', err);
        }

        console.log('Server closed');
        process.exit(0);
    }

    startSocket() {
        // Remove the socket file if it exists
        if (fs.existsSync(this.socketPath)) {
            fs.unlinkSync(this.socketPath);
        }

        const unixServer = net.createServer((client) => {
            // Use an arrow function to maintain the class instance as 'this'
            client.write(this.cachedResponse);
            client.end();
        });

        // Start listening on the Unix socket
        unixServer.listen(this.socketPath, () => {
            fs.chmodSync(this.socketPath, '775');
            console.log('RSSBot socket started on:', this.socketPath);
            console.log("RSSBot Standing By!");
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            this.handleShutdown();
        });
    }

    generateResponse() {
        // HTTP response components (because nginx)
        const responseComponents = [];
        responseComponents.push('HTTP/1.1 200 OK');
        responseComponents.push('Content-Type: text/plain\r\n');
        responseComponents.push('RSS!\n');

        return responseComponents.join('\r\n');
    }
}


module.exports = {
    Heartbeat,
};
