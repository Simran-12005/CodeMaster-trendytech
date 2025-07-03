const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Waitress server running');
});

app.listen(PORT, () => {
  console.log(`Waitress server on port ${PORT}`);
});
