export class EWMessageHelper {

    static generateMessage(template, data) {

        renderTemplate(template, data).then((msg)=>{
            ChatMessage.create({
                user: game.user._id,
                type:CONST.CHAT_MESSAGE_TYPES.ROLL,
                speaker: ChatMessage.getSpeaker(),
                content: msg
            });
            
        });
    }

}