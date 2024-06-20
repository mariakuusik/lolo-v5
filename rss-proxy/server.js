import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/webparser', async (req, res) => {
    const { url } = req.body;

    try {
        const response = await fetch('https://uptime-mercury-api.azurewebsites.net/webparser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch clutter-free content');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching clutter-free content:', error);
        res.status(500).json({ error: 'Failed to fetch clutter-free content' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});