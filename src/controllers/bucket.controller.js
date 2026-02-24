import fs from 'fs'
import FormData from 'form-data'
import axios from 'axios'
import BucketFile from '../models/BucketFile.model.js'

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

        // Petición al servidor de Hostinger usando axios
        let response
        try {
            response = await axios.post(`${HOSTINGER_API_URL}/upload`, form, {
                headers: {
                    'x-api-key': HOSTINGER_API_KEY,
                    ...form.getHeaders()
                }
            })
        } catch (axiosError) {
            // Eliminar el archivo temporal local en caso de error HTTP
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path)
            }

            return res.status(axiosError.response?.status || 500).json({
                success: false,
                message: 'Error en el servidor de almacenamiento externo',
                error: axiosError.response?.data || axiosError.message
            })
        }

        const data = response.data

        // Eliminar el archivo temporal local tras éxito
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }

        // Extraer la URL dependiendo de la respuesta de Hostinger (data.url, data.fileUrl, data.path, etc)
        const fileUrl = data.url || data.fileUrl || data.path || (data.data && data.data.url) || null

        let fileDoc = null
        try {
            const newFile = new BucketFile({
                originalName: req.file.originalname,
                hostingerUrl: fileUrl || 'URL_NO_DETERMINADA',
                uploadedBy: req.user.id,
                mimetype: req.file.mimetype,
                size: req.file.size
            })
            fileDoc = await newFile.save()
        } catch (dbError) {
            console.error('Error guardando BucketFile en la base de datos:', dbError)
        }

        res.status(200).json({
            success: true,
            message: 'Archivo subido correctamente al bucket y registrado en la BD',
            data: data,
            dbRecord: fileDoc
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
        let response
        try {
            response = await axios.get(`${HOSTINGER_API_URL}/files`, {
                headers: {
                    'x-api-key': HOSTINGER_API_KEY,
                }
            })
        } catch (axiosError) {
            return res.status(axiosError.response?.status || 500).json({
                success: false,
                message: 'Error obteniendo archivos del bucket',
                error: axiosError.response?.data || axiosError.message
            })
        }

        const data = response.data

        res.status(200).json({
            success: true,
            data: data
        })

    } catch (error) {
        console.error('Error listar archivos externos:', error)
        res.status(500).json({ success: false, message: 'Error interno conectando al bucket', error: error.message })
    }
}
