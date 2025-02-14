

// Base roll will handle evaluation of the assembled roll and chat message creation
// subclasses of EWBaseRoll handle prompting, getting the roll data, and building the options for the constructor

export default class EWBaseRoll extends foundry.dice.Roll {

    async _rollToChat(chatData) {
        renderTemplate(CONFIG.EW.MESSAGE_TYPE.TASK, chatData).then((msg)=>{
          ChatMessage.create({
              user: game.user._id,
              rolls: [chatData.roll],
              speaker: ChatMessage.getSpeaker(),
              content: msg
          });
      });
    }

}