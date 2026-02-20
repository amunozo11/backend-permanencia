import 'dotenv/config'
import mongoose from 'mongoose'
import User from './src/models/User.js'

async function testAuthLogic() {
    try {
        const { DB_USER, DB_PASS, DB_CLUSTER, DB_NAME } = process.env
        const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_CLUSTER}.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`
        await mongoose.connect(MONGO_URI)

        const email = 'admin@unicesar.edu.co'
        const password = 'Admin2026$'

        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            console.log('User not found')
            process.exit(1)
        }

        console.log('User found:', user.email, 'Role:', user.role)
        const isMatch = await user.comparePassword(password)
        console.log('Password match:', isMatch)

        process.exit(0)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}
testAuthLogic()
