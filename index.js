// A simple TCP Print Server for AsHospitality POS
// This script listens for print jobs from the web app and forwards them to a network printer.
//
// How to run:
// 1. Install Node.js on a computer on the same network as your printers.
// 2. Open a terminal or command prompt.
// 3. Run: npm install net cors express
// 4. Run: node print-server/index.js
// 5. Keep this terminal window open on the server computer.

const net = require('net');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000; // The port your web app will send requests to.

app.use(cors()); // Allow requests from your web app
app.use(express.json()); // To parse JSON bodies

app.post('/print', (req, res) => {
  const { ip, text } = req.body;

  if (!ip || !text) {
    return res.status(400).send({ error: 'Missing printer IP address or text content.' });
  }

  console.log(`[${new Date().toLocaleTimeString()}] Received print job for IP: ${ip}`);

  const printerPort = 9100; // Standard port for most network thermal printers

  const client = new net.Socket();

  client.connect(printerPort, ip, () => {
    console.log(`Connected to printer at ${ip}:${printerPort}`);
    client.write(text);
    client.end(); // Close the connection after sending data
    console.log('Print job sent successfully.');
    // In 'no-cors' mode, the client won't see this, but it's good for testing.
    res.status(200).send({ success: true, message: 'Print job sent.' });
  });

  client.on('error', (err) => {
    console.error(`Printer connection error for ${ip}:`, err.message);
    res.status(500).send({ error: `Failed to connect to printer: ${err.message}` });
  });

  client.on('timeout', () => {
    console.error(`Connection to printer ${ip} timed out.`);
    client.destroy();
    res.status(500).send({ error: 'Connection timed out.' });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🖨️ AsHospitality Print Server is running.`);
  console.log(`Listening for print jobs on http://localhost:${PORT}`);
  console.log('Ensure this computer and your printers are on the same network.');
});
