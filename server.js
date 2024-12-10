// Install required dependencies before implementing
// npm install --save express body-parser soap cors

// server.ts (Node.js backend using Express)
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import soap from 'soap';

const app = express();
const port = 3000; // Port number for the server

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SOAP API endpoint and WSDL
const soapApiUrl = 'http://internal-soap-api-url?wsdl';

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

app.get('/api/get-health-check', async (req, res) => {
    res.send("Hello world");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});