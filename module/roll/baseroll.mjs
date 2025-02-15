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