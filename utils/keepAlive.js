const express = require('express');
const app = express();

app.all('/', (req, res) => {
    res.send('Bot is running 24/7!');
});

module.exports = () => {
    // Replit uses process.env.PORT automatically
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`[Keep-Alive] Web server is listening on port ${port}`);
    });
};

