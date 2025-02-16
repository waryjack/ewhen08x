import EWBaseItem from "./baseitem.mjs";
const { DialogV2 } = foundry.applications.api;

export default class EWWeapon extends EWBaseItem {

   
    /* @override */
    prepareDerivedData(){
        super.prepareDerivedData();

    }

    async _rollDamage(actorData) {
        let attVal = (this.add_attribute != "none") ? actorData.main_attributes[this.add_attribute].rank : 0
        if (this.half_attribute) attVal = Math.floor(attVal/2);
        const rollconfig = await this._promptDamage(attVal)

        let baseDice = (prompt.scaleDmg.value != "none") ? prompt.scaledmg.value : this.damage_dice;
        let formula = `${baseDice}+${prompt.bonuses.value}+${attVal}-${prompt.penalties.value}`;
        let damageroll = new EWBaseRoll(formula, this.getRollData());
        await damageroll.evaluate();
        damageroll.toMessage()

    }

    async _promptDamage() {
        const content = await renderTemplate(this.PROMPT_TEMPLATES.weapon);
        const prompt = new DialogV2.wait({
            window: { title: "EW.rolltype.damageroll"},
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

        });

        if (!prompt) return new Error("No data received from prompt");
        return prompt;


    }

    get wpn_type() {
        return this.system.wpn_type;
    }

    get damage_dice() {
        return this.system.damage.dice;
    }

    get add_attribute() {
        return this.system.damage.add_attribute;
    }

    get half_attribute() {
        return this.system.damage.half_attribute;
    }

    get mod() {
        return this.system.damage.mod;
    }

    get ap() {
        return this.system.damage.ap;
    }

    get hands() {   
        return this.system.hands;
    }

    get range() {
        return this.system.range;
    }

    get recoil() {
        return this.system.recoil;
    }

}