import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../../.env') })

const { DB_USER, DB_PASS, DB_CLUSTER, DB_NAME } = process.env

const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_CLUSTER}.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`

async function seedAdmin() {
    try {
        await mongoose.connect(MONGO_URI)
        console.log('MongoDB conectado')

        const existingAdmin = await User.findOne({ role: 'admin' })
        if (existingAdmin) {
            console.log('Ya existe un admin:', existingAdmin.email)
            process.exit(0)
        }

        const admin = new User({
            email: 'admin@unicesar.edu.co',
            password: 'Admin2026$',
            nombre: 'Administrador',
            apellidos: 'SIGPEBI',
            role: 'admin',
        })

        await admin.save()
        console.log('✅ Admin creado exitosamente:')
        console.log('   Email: admin@unicesar.edu.co')
        console.log('   Password: Admin2026$')
        console.log('   Rol: admin')
        process.exit(0)
    } catch (error) {
        console.error('Error al crear admin:', error)
        process.exit(1)
    }
}

seedAdmin()
