import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [/^[\w.-]+@unicesar\.edu\.co$/, 'Solo se permiten correos @unicesar.edu.co'],
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        nombre: {
            type: String,
            required: true,
            maxlength: 50,
        },
        apellidos: {
            type: String,
            required: true,
            maxlength: 50,
        },
        numero_documento: {
            type: String,
            required: true,
            unique: true,
            match: [/^\d{7,10}$/, 'Número de documento inválido'],
        },
        role: {
            type: String,
            enum: ['admin', 'estudiante'],
            default: 'estudiante',
        },

        activo: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
)

// Hash password antes de guardar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

// Comparar contraseña
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

userSchema.index({ role: 1 })

export default mongoose.model('User', userSchema)
