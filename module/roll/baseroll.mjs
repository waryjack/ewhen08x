

// Base roll will handle evaluation of the assembled roll and chat message creation
// subclasses of EWBaseRoll handle prompting, getting the roll data, and building the options for the constructor

export default class EWBaseRoll extends foundry.dice.roll {

    /* @override */
    // this "catches" the render call, feeding constructed message "flavor" to 
    // the render call for displaying the roll
    async render({flavor, template = this.constructor.CHAT_TEMPLATE, isPrivate = false} = {}) {
        if (!this._evaluated) await this.evaluate({allowInteractive: !isPrivate});
        const chatData = await this._prepareContext({flavor, isPrivate});
        return renderTemplate(template, chatData);
      }



    async _prepareChatContext(){

    }

    async _rollToChat(chatData) {

    }

}