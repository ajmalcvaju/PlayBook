import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import userRoutes from './infrastructure/routes/userRoutes';
import turfRoutes from './infrastructure/routes/turfRoutes';
import adminRoutes from './infrastructure/routes/adminRoutes';
import path from 'path';
import http from 'http';
import { connectDB } from './infrastructure/database/connect';
import socketIo from 'socket.io';
import { setupSocketListeners } from './infrastructure/socket/socketService';

const app = express();
const server = http.createServer(app);
export const io = new socketIo.Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']}
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const paths = path.join(__dirname, 'public');
app.use(express.static('public'));
console.log(paths);

connectDB();

app.use('/api/users', userRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/admin', adminRoutes);

setupSocketListeners(io);


server.listen(7000, () => {
  console.log('Server running at http://localhost:7000');
});
