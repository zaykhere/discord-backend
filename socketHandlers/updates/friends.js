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

const updateFriends = async (userId) => {
  try {
    const receiverList = serverStore.getActiveConnections(userId);

    if (receiverList.length > 0) {
      const user = await User.findById(userId, { _id: 1, friends: 1 }).populate("friends", "_id username email");

      if (!user) {
        return res.status(404).send("user not found");
      }

      const friendsList = user.friends.map((f) => {
        return {
          id: f._id,
          email: f?.email,
          username: f?.username
        }
      });

      console.log({friendsList});

      //get io instance
      const io = serverStore.getSocketServerInstance();

      receiverList.forEach((receiverSocketId) => {
        io.to(receiverSocketId).emit('friends-list', {
          friends: friendsList ? friendsList : []
        })
      });
    }

    

  } catch (error) {
    console.log(error);
  }
}

module.exports = updatePendingFriendsInvitations;
module.exports.updateFriends = updateFriends;