const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://your-mongodb-host:27017/your-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Serve static files (like home.html)
app.use(express.static(path.join(__dirname, 'public')));

// API routes (if any)
app.use('/api', require('./routes/api'));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
