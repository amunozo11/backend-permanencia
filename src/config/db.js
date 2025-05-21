const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const { DB_USER, DB_PASS, DB_CLUSTER, DB_NAME } = process.env;
const MONGO_URI =
  `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_CLUSTER}.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

function connectDB() {
  mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
}

module.exports = connectDB;