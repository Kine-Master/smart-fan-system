Responsive Smart Fan System
Overview
This project involves a Responsive Smart Fan System that automatically turns a fan on or off based on real-time data from a temperature sensor (LM35) and a distance sensor (HC-SR04). The system also monitors current consumption and energy usage through an ACS712 current sensor. It includes a web-based interface for real-time data monitoring and threshold configuration.

Key Features:
Automatic Fan Control: The fan is automatically activated based on temperature and proximity (distance from the sensor).
Real-Time Data Monitoring: Displays temperature, distance, fan status, current consumption, and energy usage in real-time.
Threshold Configuration: Allows users to set custom temperature and distance thresholds to control the fan's behavior.
Database Logging: Fan status and sensor data are logged in a MySQL database when the fan is active.
Components Used
Microcontroller: Arduino (with USB-to-serial communication via NodeMCU or direct USB)
Sensors:
LM35 Temperature Sensor
HC-SR04 Ultrasonic Distance Sensor
ACS712 Current Sensor
Relay Module to control the fan
Software: Node.js, Express, Socket.IO, MySQL, Arduino IDE
Installation & Setup
Hardware Setup
LM35 (Temperature Sensor):

Connect the VCC pin to 5V.
Connect the GND pin to GND.
Connect the OUT pin to A0.
HC-SR04 (Ultrasonic Distance Sensor):

Connect VCC to 5V.
Connect GND to GND.
Connect Trig to Pin 9.
Connect Echo to Pin 10.
ACS712 (Current Sensor):

Connect VCC to 5V.
Connect GND to GND.
Connect OUT to A1.
Relay Module:

Connect the VCC to 5V.
Connect the GND to GND.
Connect the IN pin to Pin 8 of the Arduino to control the fan.
Software Setup
Arduino Code: Upload the Arduino code (provided) to your Arduino board using the Arduino IDE.

Node.js Backend:

Install dependencies:

bash
Copy code
npm install express socket.io mysql2 body-parser serialport
Create a .env file with the following content:

env
Copy code
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
SERIAL_PORT=/dev/ttyUSB0  # or COMx for Windows
MySQL Database Setup:

Create a database named smart_fan_system in MySQL.
Run the following query to create the necessary table for logging data:
sql
Copy code
CREATE TABLE fan_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temperature FLOAT,
    distance FLOAT,
    status BOOLEAN,
    current FLOAT,
    energy FLOAT,
    timestamp DATETIME
);
Frontend Interface:

Make sure to run the Node.js server by entering the command "node server.js" in git bash after navigating through the project folder and inside the backend directory and open index.html in a browser.

How It Works:
Temperature and Distance Sensors: The LM35 and HC-SR04 sensors continuously monitor the temperature and the proximity of objects. The data is sent to the Arduino, which processes it and decides whether to activate the fan based on the predefined thresholds.

Fan Control: The fan turns on if the temperature exceeds the threshold and if an object is detected within the proximity threshold. The relay module is used to control the fan.

Real-Time Updates:

The Arduino sends data (temperature, distance, fan status, current, and energy) via serial communication to a Node.js backend.
The backend (using Socket.IO) broadcasts the data to a web interface in real-time.
Web Interface:

Displays real-time data from the sensors.
Allows users to set new temperature and distance thresholds to control the fan.
Web Interface Features
Real-Time Data Display:

Temperature (°C)
Distance (cm)
Fan Status (ON/OFF)
Current Consumption (A)
Energy Consumption (kWh)
Threshold Configuration:

Allows users to input new temperature and distance thresholds that will control when the fan turns on or off.
Fan Status History:

Displays a table of historical data when the fan was on, including temperature, distance, and timestamp.
Troubleshooting
Erratic Temperature Readings: Ensure that the LM35 is connected properly and stable. You may also need to wait a few seconds after powering on to allow the sensor to stabilize.

CORS Issues: If you're facing CORS errors when interacting with the backend, ensure that the CORS headers are configured properly and match the frontend URL in the Node.js server code.