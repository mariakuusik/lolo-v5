import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

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