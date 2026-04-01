import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './src/models/User.js'

async function debug() {
    console.log('--- DIAGNOSTIC START ---')
    try {
        const { DB_USER, DB_PASS, DB_CLUSTER, DB_NAME } = process.env
        const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_CLUSTER}.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`

        console.log('Connecting to MongoDB...')
        await mongoose.connect(MONGO_URI)
        console.log('MongoDB Connected')

        const email = 'admin@unicesar.edu.co'
        const password = 'Admin2026$'

        console.log('Finding user by email:', email)
        const user = await User.findOne({ email: email.toLowerCase() })

        if (!user) {
            console.log('Result: User NOT found')
        } else {
            console.log('Result: User FOUND')
            console.log('Role:', user.role)
            console.log('Comparing password...')
            const isMatch = await user.comparePassword(password)
            console.log('Password MATCH:', isMatch)
        }
    } catch (err) {
        console.log('CATCHED ERROR TYPE:', err.name)
        console.log('CATCHED ERROR MESSAGE:', err.message)
        console.error(err)
    } finally {
        await mongoose.disconnect()
        console.log('--- DIAGNOSTIC END ---')
        process.exit(0)
    }
}
debug()
