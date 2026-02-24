import 'dotenv/config'
import app from './src/app.js'
import http from 'http'
import { initSocket } from './src/config/socket.js'

const PORT = process.env.PORT || 5000
const server = http.createServer(app)

initSocket(server)

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
