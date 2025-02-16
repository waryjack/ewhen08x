// Imports
import EWBaseActor from "./baseactor.mjs"
const { DialogV2 } = foundry.applications.api;

export default class EWRabble extends EWBaseActor {
    
    static PROMPT_TEMPLATE = "systems/ewhen/templates/prompt/rabbledamage.hbs";

    async _rabbleDamage() {
        const content = await renderTemplate(this.PROMPT_TEMPLATE, {});
        const prompt = new DialogV2.wait({
            window: { title: "EW.rolltype.rabbledamage"},
            content:content,
            classes: ["ew-dialog"],
            buttons: [{
                action:"roll",
                label:"EW.buttons.roll",
                default:true,
                callback:(event,button,dialog) => {
                    return button.form.elements
                }
            },
            {
                action:"cancel",
                label:"EW.buttons.cancel"
            }],
            submit: result => {
                if (result === cancel) return;
                return result;
            }

        })
        
        if (!prompt) return;

        let formula = `${prompt.dmg.value}+${prompt.mod.value}`;
        let roll = new EWBaseRoll(formula);
        roll.toMessage()

    }

    get PROMPT_TEMPLATE() {
        return this.PROMPT_TEMPLATE;
    }
}