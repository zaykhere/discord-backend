const FriendInvitation = require("../models/FriendInvitation");
const User = require("../models/User");
const updatePendingFriendsInvitations = require("../socketHandlers/updates/friends");

const postInvite = async (req,res) => {
  try {
    const {targetMailAddress} = req.body;

  const {userId, email} = req.user;

  if(email.toLowerCase().trim() === targetMailAddress.toLowerCase().trim()) {
    return res.status(400).send("Sorry, you cannot become friends with yourself.");
  }

  const targetUser = await User.findOne({
    email: targetMailAddress
  });

  if(!targetUser) {
    return res.status(404).send(`Friend of ${targetMailAddress} has not been found. Now please check mail address.`);
  }

  const invitationAlreadyReceived = await FriendInvitation.findOne({
    senderId: userId,
    receiverId: targetUser._id
  })

  if(invitationAlreadyReceived) {
    return res.status(400).send("Invitation has already been sent");
  }

  const usersAlreadyFriends = targetUser.friends.find((friendId) => friendId.toString() === userId.toString());

  if(usersAlreadyFriends) {
    return res.status(409).send("Friend already added. Please check friendslist");
  }

  const newInvitation = await FriendInvitation.create({
    senderId: userId,
    receiverId: targetUser._id
  })

  // send pending invitation update to specific user

  updatePendingFriendsInvitations(targetUser._id.toString());

  return res.status(201).send("Invitation is sent");
  } catch (error) {
    console.log(error);
    res.status(500).send(`Error! ${error?.message}`);
  }

  
}

const postAccept = async(req,res) => {
  try {
    const {id} = req.body;

    const invitation = await FriendInvitation.findById(id);

    if(!invitation) {
      return res.status(401).send("Error occured. Please try again.");
    }

    const {senderId, receiverId} = invitation;

    //add friends to both users;

    const senderUser = await User.findById(senderId);
    const receiverUser = await User.findById(receiverId);

    if(!senderUser || !receiverUser) {
      return res.status(404).send("User doesn't exist");
    }

    senderUser.friends = [...senderUser.friends, receiverId];
    receiverUser.friends = [...receiverUser.friends, senderId];

    await senderUser.save();
    await receiverUser.save();

    //delete invitation
    await FriendInvitation.findByIdAndDelete(id);

    //update list of friends if users are online
    updatePendingFriendsInvitations.updateFriends(senderId.toString());
    updatePendingFriendsInvitations.updateFriends(receiverId.toString());

    //update list of friends pending Invitations 
    updatePendingFriendsInvitations(receiverId.toString());

    return res.status(200).send("Friend successfully added");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Something went wrong. Please try again.");
  }
}

const postReject = async(req,res) => {
  try {
    const {id} = req.body;
    const {userId} = req.user;

    const invitationExists = await FriendInvitation.exists({_id: id});

    if(invitationExists) {
      await FriendInvitation.findByIdAndDelete(id);
    }

    updatePendingFriendsInvitations(userId);

    return res.status(200).send("Invitation succeessfully rejected");

  } catch (error) {
    console.log(error);
    return res.status(500).send(error?.message);
  }
}

module.exports = {
  postInvite,
  postAccept,
  postReject
}