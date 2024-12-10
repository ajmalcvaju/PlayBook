import { Server, Socket } from "socket.io";

export const createSocketConnectionForVideo = (io: Server, socket: Socket) => {
    socket.on('offer', (data) => {
        socket.to(data.target).emit('offer', data);
    });

    socket.on('answer', (data) => {
        socket.to(data.target).emit('answer', data);
    });

    socket.on('candidate', (data) => {
        socket.to(data.target).emit('candidate', data);
    });

}