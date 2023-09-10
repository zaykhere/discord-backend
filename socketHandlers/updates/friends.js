const FriendInvitation = require("../../models/FriendInvitation");
const User = require("../../models/User");
const serverStore = require("../../serverStore");

const updatePendingFriendsInvitations = async(userId) => {
  try {
    const pendingInvitations = await FriendInvitation.find({
      receiverId: userId
    }).populate('senderId', '_id username email');

    // find if the specified userId has active connections

    const receiverList = serverStore.getActiveConnections(userId);

    const io = serverStore.getSocketServerInstance();

    receiverList.forEach((receiverSocketId) => {
      io.to(receiverSocketId).emit('friends-invitations', {
        pendingInvitations: pendingInvitations ? pendingInvitations : []
      });
    });

  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
}

module.exports = updatePendingFriendsInvitations;