import fs from 'fs'
import FormData from 'form-data'
import axios from 'axios'

const HOSTINGER_API_URL = 'https://mediumblue-bear-211634.hostingersite.com/api'
const HOSTINGER_API_KEY = process.env.HOSTINGER_API_KEY || 'sispegib-secret-key-2024'

async function testUploadAxios() {
    fs.writeFileSync('test-upload.txt', 'Hello bucket test')

    try {
        const form = new FormData()
        form.append('file', fs.createReadStream('test-upload.txt'))

        const response = await axios.post(`${HOSTINGER_API_URL}/upload`, form, {
            headers: {
                'x-api-key': HOSTINGER_API_KEY,
                ...form.getHeaders()
            }
        })

        console.log('Status:', response.status)
        console.log('Data:', response.data)
    } catch (e) {
        console.error('Axios error:', e.response?.data || e.message)
    } finally {
        fs.unlinkSync('test-upload.txt')
    }
}

testUploadAxios()
