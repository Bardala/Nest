import { Server, Socket } from 'socket.io';
import http from 'http';

class Connection {
  io: Server;
  socket: Socket;
  spaceId: string | string[] | undefined;

  constructor(io: Server, socket: Socket) {
    this.io = io;
    this.socket = socket;

    socket.on('join_room', this.handleJoinRoom.bind(this));
    socket.on('from_client', this.handleMsgs.bind(this));
    socket.on('disconnect', this.handleDisconnect.bind(this));
  }

  private handleJoinRoom(spaceId: string) {
    this.socket.join(spaceId);
    console.log(`User ${this.socket.id} joined room ${spaceId}`);
  }

  private handleMsgs(data: { message: string; spaceId: string }) {
    console.log(data);
    this.io.to(data.spaceId).emit('from_server', data.message);
  }

  private handleDisconnect() {
    console.log('user disconnected');
  }
}

export function initSockets(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', socket => {
    console.log('User Connected', socket.id);
    new Connection(io, socket);
  });
}
