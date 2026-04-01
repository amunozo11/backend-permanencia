import 'dotenv/config'
import mongoose from 'mongoose'
import User from './src/models/User.js'

async function checkUsers() {
    try {
        const { DB_USER, DB_PASS, DB_CLUSTER, DB_NAME } = process.env
        const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_CLUSTER}.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`
        await mongoose.connect(MONGO_URI)
        const users = await User.find({}, 'email role nombre active')
        console.log('Users found:', users)
        process.exit(0)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}
checkUsers()
