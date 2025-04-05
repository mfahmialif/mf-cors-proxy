const axios = require('axios');

export default async function handler(req, res) {
  const { url, ...query } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Parameter ?url= harus diisi.' });
  }

  try {
    const response = await axios({
      method: req.method,
      url: url,
      headers: { ...req.headers, host: undefined },
      data: req.body,
      params: req.method === 'GET' ? query : undefined,
    });

    // Set headers dari target ke response
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: 'Terjadi kesalahan saat mengakses URL target.',
      error: error.message,
      response: error.response?.data || null,
    });
  }
}
