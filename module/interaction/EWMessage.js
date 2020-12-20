export class EWMessageHelper {

    templates = {
        EWMESSAGE_TASK: "systems/ewhen/templates/sheets/roll/EWRollMessage.hbs",
        EWMESSAGE_DAMAGE: "systems/ewhen/templates/sheets/roll/EWDamageMessage.hbs",
        EWMESSAGE_ARMOR: "systems/ewhen/templates/sheets/roll/EWArmorMessage.hbs",
        EWMESSAGE_HEROPOINT: "systems/ewhen/templates/sheets/roll/EWHeroPoint.hbs"
    }

    constructor() {
        this.templates = templates;

    }

    generateMessage(type, data) {
        ChatMessage.create(); // from supplied message data and template
    }

}