const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory array to store chat history (satisfying 'no data base' requirement)
let chatHistory = [];

app.post('/api/save-message', (req, res) => {
    const { role, text, timestamp, media } = req.body;
    
    if (!role || !text) {
        return res.status(400).json({ error: 'Role and text are required' });
    }
    
    const message = {
        id: Date.now().toString(),
        role,
        text,
        timestamp: timestamp || new Date().toISOString(),
        media: media || null
    };
    
    chatHistory.push(message);
    res.status(201).json(message);
});

app.get('/api/history', (req, res) => {
    res.json(chatHistory);
});

// Clear history endpoint (optional but helpful)
app.delete('/api/history', (req, res) => {
    chatHistory = [];
    res.json({ message: 'History cleared' });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
