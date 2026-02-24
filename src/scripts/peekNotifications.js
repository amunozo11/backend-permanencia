import mongoose from 'mongoose'
import 'dotenv/config'
import Notification from '../models/Notification.js'
import User from '../models/User.js'

async function check() {
    await mongoose.connect(process.env.MONGODB_URI)
    const notifs = await Notification.find().populate('usuario', 'nombre role').lean()
    console.log("NOTIFICATIONS:")
    console.log(notifs)

    const admins = await User.find({ role: 'admin' }).lean()
    console.log("ADMINS:")
    console.log(admins)

    mongoose.disconnect()
}

check()
