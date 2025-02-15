import EWMCCRoll from "../../roll/statroll.mjs";
import { getDiceModel } from "../../diceModels.js";

export default class EWBaseActor extends Actor {

  mainAttributes = {
      STRENGTH: "strength",
      AGILITY: "agility",
      MIND: "mind",
      APPEAL: "appeal",
  }

  combatAttributes = {
      MELEE: "melee",
      RANGED: "ranged",
      DEFENSE: "defense",
      INITIATIVE: "initiative"
  }

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
    let statroll = await new EWMCCRoll(game.settings.get("ewhen","allSettings").diceType, this.getRollData(), {stat:stat, statId:statId, actorId:this._id, dm:getDiceModel(game)});
    await statroll.prompt();
  }

  async _addCareer() {
    const content = await renderTemplate("systems/ewhen/templates/prompts/AddCareer.hbs");
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

    let newcareer = {
        rank:prompt.newrank.value,
        id:foundry.utils.randomID(16)
    }
    let myCareers = this.system.careers
    myCareers[prompt.newname.value] = newcareer;

    console.log('career object: ', myCareers)
    await this.update({"system.careers":myCareers});
        
   
  }

  async _deleteCareer(career, c_id) {
 
    const proceed = await foundry.applications.api.DialogV2.confirm({
        window: { title: "EW.prompts.deletecareer" },
        content: game.i18n.localize("EW.prompts.delwarning") + name + game.i18n.localize("EW.prompts.delcareer"),
        modal: true
      });

    if (proceed) {
        let newCareers = {};
        Object.entries(this.system.careers).forEach(([key, value]) => {
            console.log("key",key, "value", value);
            if (key === career && value.id === c_id) {
                // skip it
            } else {
                newCareers[key] = value;
            }
        });
       
        console.log("myCareers delete check:", newCareers);
        await this.update({"system.careers":newCareers});
    } else {
        console.log("Cancelled");
    }

  }

  async _addPool() {
    const content = renderTemplate(CONFIG.EW.DIALOG_TYPE.ADD_POOL);
    const prompt = await foundry.applications.api.DialogV2.wait({
        window: { title: "EW.prompts.addpool"},
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

    if(this.system.pools.includes(prompt.newName.value)) {
        ui.notifications.warn(game.i18n.localize("EW.warnings.duplicatePoolName")+ " " + prompt.newName.value);
        return;
    }

    this.system.careers[prompt.newName.value] = {
        min:prompt.newmin.value, 
        max:prompt.newmax.value, 
        current:prompt.newcurrent.value, 
        id:foundry.utils.randomID(16)
    };

  }

  async _deletePool(pool) {
    
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

    getArcanaPoints() {
        return this.system.resources.arcana_points;
    }

    getFaithPoints() {
        return this.system.resources.faith_points;
    }

    getPsiPoints() {
        return this.system.resources.psi_points;
    }

    get isCreature() {
        return this.system.isCreature;
    }

    get isNPC() {
        return this.system.isNPC;
    }

    get size() {
        return this.system.size;
    }
}

