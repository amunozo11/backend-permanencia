import mongoose from 'mongoose'

const { DB_USER, DB_PASS, DB_CLUSTER, DB_NAME } = process.env
const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_CLUSTER}.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`

export default function connectDB() {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
      console.error('MongoDB connection error:', err)
      process.exit(1)
    })
}