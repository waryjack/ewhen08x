import EWMCCRoll from "../../roll/statroll.mjs";
import { getDiceModel } from "../../diceModels.js";

export default class EWBaseActor extends Actor {
  
    

  static #ATYPES = Object.freeze({
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

  static #ADD_CAREER_TEMPLATE = "systems/ewhen/templates/prompts/AddCareer.hbs";
  static #ADD_POOL_TEMPLATE = "systems/ewhen/templates/prompts/AddPool.hbs";

  /**
   * @override
   */

  prepareBaseData(){
    super.prepareBaseData();
  }

  prepareDerivedData(){
    super.prepareDerivedData();
  }

  async rollStat(stat, statId){
    let statroll = new EWMCCRoll(game.settings.get("ewhen","allSettings").diceType, 
                                       this.getRollData(), 
                                        {    
                                            stat:stat, 
                                            statId:statId, 
                                            actorId:this._id, 
                                            dm:getDiceModel(game)
                                        });
    await statroll.prompt();
  }

  async _addCareer() {
    const content = await renderTemplate(EWBaseActor.ADD_CAREER_TEMPLATE);
    const prompt = await foundry.applications.api.DialogV2.wait({
        window: { title: "EW.prompts.addcareer"},
        content: content,
        classes: ["ew-dialog"],
        buttons: [{
            action:"save",
            label:"EW.buttons.add",
            default:true,
            callback: (event, button, dialog) => { return button.form.elements }
        },
            {
                action: "cancel",
                label: "EW.buttons.cancel"
        }],
        submit: result => {
            console.log("Roll dialog result: ", result);
            if (result === "cancel") return;
            return result;
        }
    });

    // Need to do some validation because there's none built in to object besides "be an object"
    if(Object.keys(this.system.careers).includes(prompt.newname.value)) {
        ui.notifications.warn(game.i18n.localize("EW.warnings.duplicateCareerName") + " " + prompt.newname.value);
        return;
    }

    let toAddKey = `system.careers.${prompt.newname.value}`
    let toAddObj = {
        [toAddKey]: {
            rank:prompt.newrank.value, 
            id:foundry.utils.randomID(16)
        }
    }
    await this.update(toAddObj);
  }

  async _deleteCareer(career, c_id) {
 
    const proceed = await foundry.applications.api.DialogV2.confirm({
        window: { title: "EW.prompts.deletecareer" },
        content: game.i18n.localize("EW.prompts.delwarning") + career + game.i18n.localize("EW.prompts.delcareer"),
        modal: true
      });

    if (proceed) {
        let toDelete = "";
        console.log(this.system.careers);
        Object.entries(this.system.careers).forEach(([key, value]) => {
            console.log("key",key, "value", value);
            if (key === career && value.id === c_id) {
                toDelete = key;
            }
        });
        console.log("todelete: ", toDelete);

        let deleteKey = `system.careers.-=${toDelete}`;
        let delObj = {
            [deleteKey]:null
        }
   
        await this.update(delObj);
    } else {
        console.log("Cancelled");
    }

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

  async 

    applyRemoveTraitModifier (item, action) {

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

    static get ATYPES() {
        return EWBaseActor.#ATYPES;
    }

    static get ADD_CAREER_TEMPLATE() {
        return EWBaseActor.#ADD_CAREER_TEMPLATE;
    }

    static get ADD_POOL_TEMPLATE() {
        return EWBaseActor.#ADD_POOL_TEMPLATE;
    }

    get isCreature() {
        return this.system.isCreature;
    }

    get size() {
        return this.system.size;
    }
}

