export default class EWBaseRoll extends foundry.dice.Roll {

    static async _rollToChat(chatData) {
        renderTemplate(CONFIG.ewhen.MESSAGE_TYPE.TASK, chatData).then((msg)=>{
          ChatMessage.create({
              user: game.user._id,
              rolls: [chatData.roll],
              speaker: ChatMessage.getSpeaker(),
              content: msg
          });
      });
    }

}