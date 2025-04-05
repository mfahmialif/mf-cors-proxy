const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const app = express();

const myLimit = process.argv[2] || '100kb';
console.log('Using limit:', myLimit);

app.use(bodyParser.json({ limit: myLimit }));

app.all('*', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers') || '*');

    if (req.method === 'OPTIONS') {
        res.send();
        return;
    }

    const targetURL = req.header('Target-URL');
    if (!targetURL) {
        res.status(500).json({ error: 'There is no Target-URL header in the request' });
        return;
    }

    try {
        const fetchOptions = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.header('Authorization') || '',
            },
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
        };

        const response = await fetch(targetURL + req.url, fetchOptions);
        const data = await response.text();

        res.status(response.status).send(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching target URL' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Proxy server listening on port', PORT);
});
