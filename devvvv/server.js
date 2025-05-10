const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chocolateshop', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Order schema
const orderSchema = new mongoose.Schema({
  productName: String,
  price: Number,
  customerName: String,
  customerEmail: String,
  paymentMethod: String,
  paymentDetails: String,
  orderDate: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// ✅ Serve static files from the project root
app.use(express.static(path.join(__dirname)));  

// ✅ Serve home.html as the default homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Order Submission Route
app.post('/order', async (req, res) => {
  const { productName, price, customerName, customerEmail, paymentMethod, paymentDetails } = req.body;
  try {
    const order = new Order({
      productName,
      price,
      customerName,
      customerEmail,
      paymentMethod,
      paymentDetails
    });
    await order.save();

    res.send(`
      <h2 style="text-align: center; color: green; margin-top: 20px;">
        Order placed successfully!
      </h2>
      <p style="text-align: center;">
        <a href="/" style="color: purple; text-decoration: underline;">Back to Home</a>
      </p>
    `);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).send('Error placing order');
  }
});

// Start the server
const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
