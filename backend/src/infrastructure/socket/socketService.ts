
  import { Server, Socket } from 'socket.io';
  
  export function setupSocketListeners(io: Server): void {
    io.on('connection', (socket: Socket) => {
      console.log('A user connected');
  
      socket.on('chat message', (msg: string) => {
        console.log('Message received:', msg);
        io.emit('chat message', msg); // Emit the message to all connected clients
      });
  
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  }
  