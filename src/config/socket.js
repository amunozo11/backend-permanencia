import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Cliente conectado (Socket): ', socket.id);

        // Aquí puedes manejar uniéndose a canales si es necesario
        // Ej: socket.join('admin_room') si solo los admins deben escuchar

        socket.on('disconnect', () => {
            console.log('Cliente desconectado: ', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        console.warn('Socket.io no ha sido inicializado aún.');
        return null;
    }
    return io;
};
