import fs from 'fs'
import FormData from 'form-data'

// Opcional: Para NodeJS > 18 el fetch nativo suele funcionar bien, 
// pero form-data clásico con fetch a veces requiere configuraciones extras de headers.
// Se usa import dinámico o fetch global.

const HOSTINGER_API_URL = 'https://mediumblue-bear-211634.hostingersite.com/api'
const HOSTINGER_API_KEY = process.env.HOSTINGER_API_KEY || 'sispegib-secret-key-2024'

// 1. Subir a Hostinger
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se subió ningún archivo' })
        }

        // Crear form-data para el reenvío
        const form = new FormData()
        form.append('file', fs.createReadStream(req.file.path))

        // Petición al servidor de Hostinger
        const response = await fetch(`${HOSTINGER_API_URL}/upload`, {
            method: 'POST',
            headers: {
                'x-api-key': HOSTINGER_API_KEY,
                // NO poner 'Content-Type': 'multipart/form-data', FormData lo autogenera con su boundary
            },
            body: form,
            // Importante para node-fetch/form-data compatibility en algunass versiones
            duplex: 'half'
        })

        const data = await response.json()

        // Eliminar el archivo temporal local
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                message: 'Error en el servidor de almacenamiento externo',
                error: data
            })
        }

        res.status(200).json({
            success: true,
            message: 'Archivo subido correctamente al bucket',
            data: data
        })

    } catch (error) {
        console.error('Error al subir archivo externo:', error)
        // Intentar limpiar porsiacaso
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }
        res.status(500).json({ success: false, message: 'Error interno conectando al bucket', error: error.message })
    }
}

// 2. Listar archivos de Hostinger
export const listFiles = async (req, res) => {
    try {
        const response = await fetch(`${HOSTINGER_API_URL}/files`, {
            method: 'GET',
            headers: {
                'x-api-key': HOSTINGER_API_KEY,
            }
        })

        const data = await response.json()

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                message: 'Error obteniendo archivos del bucket',
                error: data
            })
        }

        res.status(200).json({
            success: true,
            data: data
        })

    } catch (error) {
        console.error('Error listar archivos externos:', error)
        res.status(500).json({ success: false, message: 'Error interno conectando al bucket', error: error.message })
    }
}
