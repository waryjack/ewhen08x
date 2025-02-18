import EWBaseRoll from "./baseroll.mjs";
const { DialogV2 } = foundry.applications.api;

export default class EWWeaponRoll extends EWBaseRoll {

    static WEAPON_ROLL_TEMPLATE = "systems/ewhen/templates/prompts/weapondamage.hbs";
    static WEAPON_DMG_TEMPLATE = "systems/ewhen/templates/roll/damagemessage.hbs";
    
    constructor(formula, data, options){
        super(formula, data, options);
        foundry.utils.mergeObject(this.options, this.constructor.DEFAULT_OPTIONS, {
            insertKeys: true,
            insertValues: true,
            overwrite: false
          });

          //rebuild after gathering the information using resetFormula
    }

    static async prompt(options = {}){

        console.log("weap roll opts: ", options);
        options.dicecode = CONFIG.ewhen.DAMAGE_DICE_PROGRESSION[options.weaponStats.damage.dice]
        const content = await renderTemplate(this.WEAPON_ROLL_TEMPLATE, options);
        const prompt = await DialogV2.wait({
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
                if (result === "cancel") return;
                return result;
            }

        });

        if (!prompt) return new Error("No data received from prompt");
    
        options.scaleDmg = prompt.scaleDmg.value;
        let dmgDice = (options.scaleDmg != "" && options.scaleDmg != "0") ? options.scaleDmg : options.weaponStats.damage.dice; 
        console.log("Dice code: ", options.dicecode)
        options.mods = prompt.mods.value;
        let att = options.weaponStats.damage.add_attribute;
        let half = options.weaponStats.damage.half_attribute;
        let attVal = !half ? options.actorAttributes[att].rank : Math.floor(options.actorAttributes[att].rank/2);
        let attOp = attVal >= 0 ? "+" : "-";
        let modOp = Number(options.mods) >= 0 ? "+" : "-";
        

        let formula = `${dmgDice}${attOp}${Math.abs(attVal)}${modOp}${Math.abs(options.mods)}`;
        let weaponroll = new this(formula, options.weaponStats, options)

        await weaponroll.evaluate();
    
        let chatData = {
            tooltip: new Handlebars.SafeString(await weaponroll.getTooltip()),
            weapon: options.wname,
            damage: `${options.dicecode}${attOp}${Math.abs(attVal)}${modOp}${Math.abs(options.mods)}`,
            total: weaponroll.total
        }
             
        let chatContent = await renderTemplate(this.WEAPON_DMG_TEMPLATE, chatData);
        ChatMessage.create({
            user: game.user._id,
            rolls: [weaponroll],
            speaker: ChatMessage.getSpeaker(),
            content: chatContent
        })

    }

    get WEAPON_ROLL_TEMPLATE() {
        return this.WEAPON_ROLL_TEMPLATE;
    }

    get WEAPON_DMG_TEMPLATE() {
        return this.WEAPON_DMG_TEMPLATE;
    }
}