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
});

// Fetch and display fan history
function loadFanHistory() {
    fetch('http://localhost:3000/api/fan-history') // Replace with your backend URL
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                const historyData = document.getElementById('history-data');
                historyData.innerHTML = ''; // Clear existing data

                data.data.forEach((row) => {
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td>${row.id}</td>
                        <td>${row.temperature}</td>
                        <td>${row.distance}</td>
                        <td>${row.status ? 'ON' : 'OFF'}</td>
                        <td>${new Date(row.timestamp).toLocaleString()}</td>
                    `;
                    historyData.appendChild(newRow);
                });
            } else {
                console.error('Failed to fetch history:', data.error);
            }
        })
        .catch((err) => {
            console.error('Error fetching history:', err);
        });
}

// Update thresholds
document.getElementById('update-thresholds').addEventListener('click', () => {
    const tempThreshold = document.getElementById('temp-threshold').value;
    const proximityThreshold = document.getElementById('proximity-threshold').value;

    fetch('http://localhost:3000/update-thresholds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature: parseFloat(tempThreshold), distance: parseFloat(proximityThreshold) }),
    })
    .then((response) => response.json())
    .then((data) => {
        alert(data.message);
    });
});


// Add event listener for manual refresh button
document.getElementById('refresh-history').addEventListener('click', () => {
    loadFanHistory();
});

// Load history when the page loads
window.onload = () => {
    loadFanHistory();
    setInterval(loadFanHistory, 30000); // Refresh history every 30 seconds
};
