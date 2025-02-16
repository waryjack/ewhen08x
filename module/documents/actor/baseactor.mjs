import EWMCCRoll from "../../roll/statroll.mjs";
import { getDiceModel } from "../../diceModels.js";
import EWBaseRoll from "../../roll/baseroll.mjs";
const { DialogV2 } = foundry.applications.api;
const { ChatMessage } = foundry.documents;

export default class EWActor extends Actor {
  
  static ATYPES = Object.freeze({
    major:["hero","rival"],
    minor:["rabble","rival"]
  })

  static mainAttributes = {
      STRENGTH: "strength",
        AGILITY: "agility",
        MIND: "mind",
        APPEAL: "appeal",
    }

  static combatAttributes = {
      MELEE: "melee",
      RANGED: "ranged",
      DEFENSE: "defense",
      INITIATIVE: "initiative"
  }

  static ADD_CAREER_TEMPLATE = "systems/ewhen/templates/prompts/AddCareer.hbs";
  static ADD_POOL_TEMPLATE = "systems/ewhen/templates/prompts/AddPool.hbs";
  static RABBLE_DMG_PROMPT_TEMPLATE = "systems/ewhen/templates/prompts/rabbledamage.hbs";

  /**
   * @override
   */

  prepareBaseData(){
    super.prepareBaseData();
  }

  prepareDerivedData(){
    super.prepareDerivedData();
  }

  async _statRoll(stat, statId){
    return EWMCCRoll.prompt({
        dm:getDiceModel(game),
        actorId:this._id,
        stat:stat,
        statId:statId,
        data:this.getRollData()
    })
    
  }
  
    /**
    * @param res {String} - FIXME - belongs in the datamodel
    */
  async _adjustResource(res, html) {
     
  }

  async _weaponRoll(){

  }

  async _armorRoll(){

  }

  async _spendHeroPoint(){
    
  }

  async applyRemoveTraitModifier (item, action) {

        if(item.type == "trait") {
            const diceModel = getDiceModel(game)

            let type = item.type;
            let pmod = item.system.priority_dieMod;
            const adata = foundry.utils.duplicate(this.system.priority_roll);


            if(pmod == "bonus") {
                // expression is: 3d6kh2 for 2d6, 3d12kh2 for 2d12, 4d6kh3 for 3d6
                adata.expression = `${diceModel.numberOfDice + 1}${diceModel.baseDie}kh${diceModel.numberOfDice}`;
            } else if (type == "trait" && pmod == "penalty") {
                adata.expression = `${diceModel.numberOfDice + 1}${diceModel.baseDie}kl${diceModel.numberOfDice}`;
            }

            actor.update({ "system.priority_roll": adata});
        }

    }

    // Rabble Damage Method
    async _rollRabbleDamage() {
        const content = await renderTemplate("systems/ewhen/templates/prompts/rabbledamage.hbs", {});
        const prompt = await DialogV2.wait({
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
                if (result === "cancel") return;
                return result;
            }

        })
        
        
        if (!prompt) return;
        
        //console.log("Prompt: ", prompt);
        let mod = (prompt.mod.value != "") ? prompt.mod.value : 0;

        let horde="";
        if (prompt.dmg.value === "2d6kl1") horde="Horde";
        let formula = `${prompt.dmg.value}+${mod}`;
        //console.log("formioli: ",formula)
        let roll = new EWBaseRoll(formula);
        

        let testContent = `<h1>Rabble ${horde} Damage Roll</h1><p><strong>Damage Roll:</strong> ${formula}</p><p><strong>Damage Amount</strong>: ${roll.total}`
        await roll.toMessage({content:testContent})

    }

    //getters
    getAttribute(attribute){
        var attSet;
        Object.values(this.mainAttributes).includes(attribute) ? attSet="main_attributes" : attSet = "combat_attributes";
        return this.system[attSet][attribute];
    }

    getLifeblood() {
        return this.system.resources.lifeblood;
    }

    getResolve() {
        return this.system.resources.resolve;
    }

    getHeroPoints() {
        return this.system.resources.hero_points;
    }

    get isCreature() {
        return this.system.isCreature;
    }

    get size() {
        return this.system.size;
    }
}

