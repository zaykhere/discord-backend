const FriendInvitation = require("../models/FriendInvitation");
const User = require("../models/User");

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

  return res.status(201).send("Invitation is sent");
  } catch (error) {
    console.log(error);
    res.status(500).send(`Error! ${error?.message}`);
  }

  
}

module.exports = {
  postInvite
}