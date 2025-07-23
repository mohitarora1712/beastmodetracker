const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function seedAdmin() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const email = 'admin@gmail.com';
  const password = '123456789';
  const accessPin = 'BeastModeOn';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists.');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    email,
    password: hashedPassword,
    accessPin,
  });
  await user.save();
  console.log('Admin user created.');
  process.exit(0);
}

seedAdmin(); 