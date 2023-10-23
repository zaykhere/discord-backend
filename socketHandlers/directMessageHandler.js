const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const directMessageHandler = async(socket, data) => {
  try {
    const {userId} = socket.user;

    const {receiverId, content} = data;

    console.log(receiverId);

    //create new message

    const message = await Message.create({
      content: content,
      author: userId,
      date: new Date(),
      type: "DIRECT"
    });

    //find if conversation exists. if not, create new:

    const conversation = await Conversation.findOne({
      participants: {$all: [userId, receiverId]}
    });

    if(conversation) {
      conversation.messages.push(message._id);
      await conversation.save();

      //perform update to sender and receiver
    }

    else {
      const newConversation = await Conversation.create({
        messages: [message._id],
        participants: [userId, receiverId]
      })

      //perform update to sender and receivr
    }

  } catch (error) {
    console.error(error);
  }
}

module.exports = directMessageHandler;