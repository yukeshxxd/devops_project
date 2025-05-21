const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/chocolateshop', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Schemas
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

const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cart: [{
    productId: Number,
    name: String,
    price: Number,
    quantity: Number,
    category: String,
    image: String
  }]
}, { collection: 'login' });
const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'mySuperSecretKey123!@#',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(express.static(path.join(__dirname)));

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Authentication Middleware
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

// User Info Route
app.get('/me', requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('name email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ name: user.name, email: user.email });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Order Route
app.post('/order', async (req, res) => {
  const { productName, price, customerName, customerEmail, paymentMethod, paymentDetails } = req.body;
  try {
    const order = new Order({ productName, price, customerName, customerEmail, paymentMethod, paymentDetails });
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
    console.error('Order error:', error);
    res.status(500).send('Error placing order');
  }
});

// Signup
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists with this email' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User signed up successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    req.session.userId = user._id;
    res.status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
app.post('/logout', requireLogin, (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

// Cart API Routes
app.get('/api/cart', requireLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.cart || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/cart', requireLogin, async (req, res) => {
  const { productId, name, price, category, image } = req.body;
  if (!productId || !name || !price) {
    return res.status(400).json({ message: 'Missing product info' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existingItem = user.cart.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({ productId, name, price, quantity: 1, category, image });
    }
    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/cart', requireLogin, async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || typeof quantity !== 'number') {
    return res.status(400).json({ message: 'Missing or invalid data' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const item = user.cart.find(item => item.productId === productId);
    if (!item) return res.status(404).json({ message: 'Product not in cart' });

    if (quantity <= 0) {
      user.cart = user.cart.filter(i => i.productId !== productId);
    } else {
      item.quantity = quantity;
    }

    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/cart/:productId', requireLogin, async (req, res) => {
  const productId = parseInt(req.params.productId);
  if (!productId) return res.status(400).json({ message: 'Invalid product ID' });

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.cart = user.cart.filter(item => item.productId !== productId);
    await user.save();

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
