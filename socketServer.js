const authSocket = require("./middlewares/authSocket");
const newConnectionHandler = require("./socketHandlers/newConnectionHandler");
const disconnectHandler = require("./socketHandlers/disconnectHandler");
const { setSocketServerInstance, getOnlineUsers } = require("./serverStore");

const registerSocketServer = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  setSocketServerInstance(io);

  io.use((socket, next) => {
    authSocket(socket, next);
  })

  const emitOnlineUsers = () => {
    const onlineUsers = getOnlineUsers();
    io.emit("online-users", {onlineUsers});
  }

  io.on("connection", (socket) => {
    console.log("user connected");
    console.log(socket.id);

    newConnectionHandler(socket, io);
    emitOnlineUsers();

    socket.on('disconnect', () => {
      disconnectHandler(socket);
    })

  });

  setInterval(() => {
    emitOnlineUsers();
  }, 10000);


}

module.exports = registerSocketServer;