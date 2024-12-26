// Load environment variables from .env file
require('dotenv').config();

// Required Libraries
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Initialize Express and Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500",  // Update this with your frontend URL
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
    }
});

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');  // Allow your frontend URL
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Database Configuration
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Serial Port Configuration
const port = new SerialPort({ path: process.env.SERIAL_PORT, baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Threshold Variables
let tempThreshold = 30.0;
let distanceThreshold = 100.0;

// Handle Serial Data from Arduino
parser.on('data', (data) => {
    try {
        const [temperature, distance, fanStatus, current, energy] = data.trim().split(' ');

        const fanData = {
            temperature: parseFloat(temperature),
            distance: parseFloat(distance),
            fanStatus: fanStatus === 'true',
            current: parseFloat(current),
            energy: parseFloat(energy),
            timestamp: new Date()
        };

        // Send data to the frontend in real-time
        io.emit('sensorData', fanData);

        // Save to the database only if the fan is ON
        if (fanData.fanStatus) {
            db.query('INSERT INTO fan_history (temperature, distance, status, current, energy, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
                [fanData.temperature, fanData.distance, fanData.fanStatus, fanData.current, fanData.energy, fanData.timestamp],
                (err) => {
                    if (err) console.error('Database insert error:', err);

                    // Maintain a limit of 200 rows in the database
                    db.query('DELETE FROM fan_history WHERE id NOT IN (SELECT id FROM (SELECT id FROM fan_history ORDER BY id DESC LIMIT 200) sub)', 
                        (err) => {
                            if (err) console.error('Database delete error:', err);
                        }
                    );
                }
            );
        }
    } catch (err) {
        console.error('Error parsing serial data:', err);
    }
});

// API to Get Fan History
app.get('/api/fan-history', (req, res) => {
    const query = 'SELECT id, temperature, distance, status, timestamp FROM fan_history ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching fan history:', err);
            return res.status(500).json({ success: false, error: 'Failed to fetch history' });
        }
        res.json({ success: true, data: results });
    });
});

// API to Update Thresholds
app.post('/update-thresholds', (req, res) => {
    const { temperature, distance } = req.body;

    if (temperature !== undefined) tempThreshold = temperature;
    if (distance !== undefined) distanceThreshold = distance;

    // Send updated thresholds to Arduino
    port.write(`SET_TEMP:${tempThreshold}\n`);
    port.write(`SET_DIST:${distanceThreshold}\n`);

    res.json({ success: true, message: 'Thresholds updated successfully' });
});

// Serve Frontend
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Start the Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Socket.IO Connection
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
