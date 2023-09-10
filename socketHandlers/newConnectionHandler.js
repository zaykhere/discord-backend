const serverStore = require("../serverStore");
const updatePendingFriendsInvitations = require("./updates/friends");

const newConnectionHandler = async (socket, io) => {
  const userDetails = socket.user;

  serverStore.addNewConnectedUser({
    socketId: socket.id,
    userId: userDetails.userId
  })

  //update pending friends invitations list

  updatePendingFriendsInvitations(userDetails.userId)

  console.log("update friends")

  updatePendingFriendsInvitations.updateFriends(userDetails.userId);
}

module.exports = newConnectionHandler;