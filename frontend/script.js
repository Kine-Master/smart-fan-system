// Initialize Socket.IO connection to backend server
const socket = io('http://localhost:3000'); // Ensure this connects to the correct backend URL

// Listen for real-time sensor data
socket.on('sensorData', (data) => {
    console.log('Received sensor data:', data);

    // Update the status display
    document.getElementById('temperature').innerText = `Temperature: ${data.temperature} °C`;
    document.getElementById('distance').innerText = `Distance: ${data.distance} cm`;
    document.getElementById('fan-status').innerText = `Fan Status: ${data.fanStatus ? 'ON' : 'OFF'}`;
    document.getElementById('current-reading').innerText = `Current Consumption: ${data.current} A`;
    document.getElementById('electric-usage').innerText = `Electric Usage: ${data.energy} kWh`;

    // Update fan status in history section
    const historyData = document.getElementById('history-data');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>--</td>
        <td>${data.temperature}</td>
        <td>${data.distance}</td>
        <td>${data.fanStatus ? 'ON' : 'OFF'}</td>
        <td>${new Date().toLocaleString()}</td>
    `;
    historyData.appendChild(newRow);
});

// Update thresholds
document.getElementById('update-thresholds').addEventListener('click', () => {
    const tempThreshold = document.getElementById('temp-threshold').value;
    const proximityThreshold = document.getElementById('proximity-threshold').value;

    fetch('http://localhost:3000/update-thresholds', { // Adjust the fetch URL to backend URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature: parseFloat(tempThreshold), distance: parseFloat(proximityThreshold) }),
    })
    .then((response) => response.json())
    .then((data) => {
        alert(data.message);
    });
});
