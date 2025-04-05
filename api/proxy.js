import axios from 'axios';

export const config = {
    api: {
        bodyParser: true,
    },
};

export default async function handler(req, res) {
    const { url, ...restQuery } = req.query;

    if (!url) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.status(400).json({ error: 'Parameter ?url= diperlukan' });
    }

    // Tangani preflight CORS
    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return res.status(200).end();
    }

    try {
        const response = await axios({
            method: req.method,
            url,
            headers: {
                ...req.headers,
                host: undefined,
            },
            params: req.method === 'GET' ? restQuery : undefined,
            data: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? req.body : undefined,
        });

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/json');
        res.status(response.status).send(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const contentType = error.response?.headers?.['content-type'] || 'application/json';

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', contentType);

        if (error.response?.data instanceof Buffer) {
            res.status(status).send(error.response.data);
        } else {
            res.status(status).json({
                error: error.message,
                data: error.response?.data || null,
            });
        }
    }
}
