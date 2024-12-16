// Install required dependencies before implementing
// npm install --save express body-parser soap cors

// server.ts (Node.js backend using Express)
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import soap from 'soap';

const app = express();
const port = 3000; // Port number for the server

// Middleware
app.use(cors());
app.use(express.json());

// SOAP API endpoint and WSDL
const soapApiUrl = 'https://www.w3schools.com/xml/tempconvert.asmx?WSDL';

// Endpoint to call SOAP API
app.post('/api/suspend-customer', async (req, res) => {
    const { custref, requestcode, requestcomment } = req.body;

    if (!custref || !requestcode || !requestcomment) {
        return res.status(400).send({ error: 'Missing required fields' });
    }

    const soapRequestArgs = {
        custref,
        requestcode,
        requestcomment
    };

    try {
        const client = await soap.createClientAsync(soapApiUrl);
        const [result] = await client.SomeSoapOperationAsync(soapRequestArgs);
        const custsuspensionid = result.custsuspensionid;
        res.send({ custsuspensionid });
    } catch (error) {
        console.error('SOAP API Error:', error);
        res.status(500).send({ error: 'Failed to call SOAP API' });
    }
});

app.get('/api/convert-temperature', async (req, res) => {
    const fahrenheit = req.query.Fahrenheit; // The Fahrenheit value comes from the request body

    // Prepare the SOAP XML body
    const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <FahrenheitToCelsius xmlns="https://www.w3schools.com/xml/">
      <Fahrenheit>${fahrenheit}</Fahrenheit>
    </FahrenheitToCelsius>
  </soap:Body>
</soap:Envelope>`;

    // Set up the HTTP headers for the SOAP request
    const headers = {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'https://www.w3schools.com/xml/FahrenheitToCelsius',
    };

    try {
        // Send the POST request to the SOAP service
        const response = await axios.post(soapApiUrl, xmlBody, { headers });

        // SOAP response is typically wrapped in XML, so we need to parse it
        const result = response.data;

        // Send the result as JSON (optional, you can adjust this if needed)
        res.send({ result });
    } catch (error) {
        console.error('SOAP API Error:', error);
        res.status(500).send({ error: 'Failed to call SOAP API' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});