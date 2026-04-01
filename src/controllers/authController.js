import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role, nombre: user.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )
}

export const register = async (req, res) => {
    try {
        const { email, password, nombre, apellidos, numero_documento } = req.body
        console.log('Intento de registro:', { email, nombre })

        if (!email || !password || !nombre || !apellidos || !numero_documento) {
            return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' })
        }

        // Validar dominio
        if (!email.endsWith('@unicesar.edu.co')) {
            return res.status(400).json({
                success: false,
                message: 'Solo se permiten correos con dominio @unicesar.edu.co',
            })
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            console.log('Registro fallido: Usuario ya existe', email)
            return res.status(400).json({ success: false, message: 'El correo ya está registrado' })
        }

        const user = new User({
            email: email.toLowerCase(),
            password,
            nombre,
            apellidos,
            numero_documento,
            role: 'estudiante',
        })

        await user.save()
        console.log('Usuario registrado con éxito:', email)

        const token = generateToken(user)

        res.status(201).json({
            success: true,
            message: 'Registro exitoso',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    nombre: user.nombre,
                    apellidos: user.apellidos,
                    numero_documento: user.numero_documento,
                    role: user.role,
                },
            },
        })
    } catch (error) {
        console.error('Error en registro:', error)
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'El correo ya está registrado' })
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        console.log('Intento de login:', email)

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' })
        }

        const user = await User.findOne({ email: email.toLowerCase(), activo: true })
        if (!user) {
            console.log('Login fallido: Usuario no encontrado o inactivo', email)
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            console.log('Login fallido: Contraseña incorrecta', email)
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' })
        }

        console.log('Login exitoso:', email)
        const token = generateToken(user)

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    nombre: user.nombre,
                    apellidos: user.apellidos,
                    numero_documento: user.numero_documento,
                    role: user.role,
                },
            },
        })
    } catch (error) {
        console.error('Error en login:', error)
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
}


export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
        }
        res.json({ success: true, data: user })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
}
