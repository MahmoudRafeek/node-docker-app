const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('<h1>Docker is working! 🚀</h1> <p>Running from GitHub Codespaces</p>');
  res.send('aaaaaaaaaaaaaaaaaaaaa');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});