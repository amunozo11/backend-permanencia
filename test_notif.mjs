import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

await mongoose.connect(MONGODB_URI)
console.log("Connected!")

// Find the logged-in admin by ID
const currentAdmin = await mongoose.connection.db.collection('users')
    .findOne({ _id: new mongoose.Types.ObjectId('699888ce8d8ca21887d120c4') })

console.log("Current session user:", JSON.stringify({
    id: currentAdmin?._id?.toString(),
    email: currentAdmin?.email,
    role: currentAdmin?.role,
    activo: currentAdmin?.activo
}))

// Find ALL users with any admin-like role
const allAdmins = await mongoose.connection.db.collection('users')
    .find({ role: { $regex: /admin/i } }).toArray()

console.log("All admin-like users:", allAdmins.map(u => ({
    id: u._id.toString(), email: u.email, role: u.role, activo: u.activo
})))

await mongoose.disconnect()
