
  import { Server, Socket } from 'socket.io';
import { createSocketConnectionForVideo } from './videoCall';

  export const createSocketConnectionForChat = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173"],
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    io.on('connection', (socket: Socket) => {
      console.log('A user connected');
     
      // createSocketConnectionForCall(io, socket);
      createSocketConnectionForVideo(io, socket);

      socket.on('chat message', (msg: string) => {
        console.log('Message received:', msg);
        io.emit('chat message', msg);
      });
      // socket.on('offer', (offer) => {
      //   console.log('Offer received:', offer);
      //   socket.broadcast.emit('offer', offer); // Send offer to all other clients
      // });
      // socket.on('answer', (answer) => {
      //   console.log('Answer received:', answer);
      //   socket.broadcast.emit('answer', answer); // Send answer to the other client
      // });
    
      // socket.on('candidate', (candidate) => {
      //   console.log('Candidate received:', candidate);
      //   socket.broadcast.emit('candidate', candidate); // Broadcast ICE candidate
      // });
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
    return io
  }
  
  // export function setupSocketListeners(io: Server): void {
    // io.on('connection', (socket: Socket) => {
    //   console.log('A user connected');
  
    //   socket.on('chat message', (msg: string) => {
    //     console.log('Message received:', msg);
    //     io.emit('chat message', msg);
    //   });
    //   socket.on('offer', (offer) => {
    //     console.log('Offer received:', offer);
    //     socket.broadcast.emit('offer', offer); // Send offer to all other clients
    //   });
    //   socket.on('answer', (answer) => {
    //     console.log('Answer received:', answer);
    //     socket.broadcast.emit('answer', answer); // Send answer to the other client
    //   });
    
    //   socket.on('candidate', (candidate) => {
    //     console.log('Candidate received:', candidate);
    //     socket.broadcast.emit('candidate', candidate); // Broadcast ICE candidate
    //   });
    //   socket.on('disconnect', () => {
    //     console.log('User disconnected');
    //   });
    // });
  // }  
  