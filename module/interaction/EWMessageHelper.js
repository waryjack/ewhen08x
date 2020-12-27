export class EWMessageHelper {

    static generateMessage(template, data) {


        console.warn("Requested Message Template: ", template);
        console.warn("Data: ", data);
        renderTemplate(template, data).then((msg)=>{
            ChatMessage.create({
                user: game.user._id,
                roll: data.roll,
                type:CHAT_MESSAGE_TYPES.ROLL,
                speaker: ChatMessage.getSpeaker(),
                content: msg
            });
            
        });
    }

}