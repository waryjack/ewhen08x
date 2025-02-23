const {
  HTMLField, SchemaField, NumberField, StringField, BooleanField, FilePathField, ObjectField
} = foundry.data.fields;
import EWActor from "../../documents/actor/baseactor.mjs";

import { getDiceModel } from "../../diceModels.js";
import { getStatSchema, getHealthSchema, getDefaultCareer } from "../../helpers.mjs";

export default class EWBaseActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      actor_image: new FilePathField({required:false, categories: ["IMAGE"]}),
      backstory: new HTMLField({initial: ""}),
      
      currency: new NumberField({required:true, min:0, initial:0}),
      credit_rating: new NumberField({required:true, min:0, initial:0}),
      armorbonus: new NumberField({required:true, integer:true, min:0, initial:0}),
      miscarmor: new NumberField({required:true, integer:true, min:0, initial:0}),
      initiative: new StringField({required:true}),
      main_attributes: new SchemaField({
        strength: new SchemaField(getStatSchema(1)),
        agility: new SchemaField(getStatSchema(1)),
        mind: new SchemaField(getStatSchema(1)),
        appeal: new SchemaField(getStatSchema(1))
      }),
      combat_attributes: new SchemaField({
        melee: new SchemaField(getStatSchema(1)),
        ranged: new SchemaField(getStatSchema(1)),
        defense: new SchemaField(getStatSchema(1)),
        initiative: new SchemaField(getStatSchema(1))
      }),
      resources: new SchemaField({
        lifeblood: new SchemaField(getHealthSchema()),
        resolve: new SchemaField(getHealthSchema()),
        shield: new SchemaField(getHealthSchema())
      }),
      pools: new ObjectField(),
      careers: new ObjectField(),
      dipswitches: new SchemaField({
        isCreature: new BooleanField({required:true, initial:false}),
        isMajor: new BooleanField({required:true, initial:true}),
        isShielded: new BooleanField({required:true, initial:false})
      })
    }
  }

  prepareDerivedData() {
    super.prepareDerivedData()

    // Set initiative based on system settings
    this._setInitiative(game.settings.get("ewhen","allSettings"));
    this._initializeHealth(this.parent.type);
    this._adjustHealth();
  }

  _setInitiative(settings) {
    this.initiative = `${settings.diceType} + ${settings.initAttribute} + ${settings.initCombat}`;
  }

  /**##### Adding and removing careeers, all character types can do so #####*/
  async _addCareer() {
    const content = await renderTemplate(EWActor.ADD_CAREER_TEMPLATE);
    const prompt = await foundry.applications.api.DialogV2.wait({
        window: { title: "EW.careers.prompt.addcareer"},
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
    if(Object.keys(this.careers).includes(prompt.newname.value)) {
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
    await this.parent.update(toAddObj);
  }

  /** Fills the arrays with the necessary info, unless they've already got data in them */
  _initializeHealth(type) {
    console.log("this: ", this);
    console.log("Actor Type: ", type);
    if (type === "vehicle"){
      console.log("resources: ", this.parent.system.resources);
      if (!this.resources.shield.boxes.length) {
        this.resources.shield.boxes = Array(this.resources.shield.max).fill("h").flat();
      }
      if (!this.resources.shield.critboxes.length) {
        this.resources.shield.critboxes = Array(this.resources.shield.max).fill("h").flat();
      }
      if (!this.frame.boxes.length) {
        this.frame.boxes = Array(this.frame.rank).fill("h").flat();
      }
      if (!this.frame.critboxes.length) {
        this.frame.critboxes = Array(this.frame.rank).fill("h").flat();
      }
    } else {
      console.log("this.resources: ", this.resources);
      if (!this.resources.lifeblood.boxes.length) { 
        this.resources.lifeblood.boxes = Array(this.resources.lifeblood.max).fill("h").flat();
      }
      if (!this.resources.resolve.boxes.length) { 
        this.resources.resolve.boxes = Array(this.resources.resolve.max).fill("h").flat();
      }
      if (!this.resources.lifeblood.critboxes.length){
        this.resources.lifeblood.critboxes = Array(5).fill("h").flat();
      }
      if (!this.resources.resolve.critboxes.length) {
        this.resources.resolve.critboxes = Array(5).fill("h").flat();
      }
    }
  }

  async _deleteCareer(career, c_id) {
 
    const proceed = await foundry.applications.api.DialogV2.confirm({
        window: { title: "EW.careers.prompt.delcareer" },
        content: game.i18n.localize("EW.prompt.deleteprefix") + career + game.i18n.localize("EW.prompts.delcareer"),
        modal: true
      });

    if (proceed) {
        let toDelete = "";
        console.log(this.careers);
        Object.entries(this.careers).forEach(([key, value]) => {
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
   
        await this.parent.update(delObj);
    } else {
        console.log("Cancelled");
    }

  }

  /* ##### Add/Remove Point Pools; also permitted by all character types #####*/
  async _addPool() {
    const content = await renderTemplate(EWActor.ADD_POOL_TEMPLATE);
    const prompt = await foundry.applications.api.DialogV2.wait({
        window: { title: "EW.pools.prompt.addpool"},
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

    if(Object.keys(this.pools).includes(prompt.newname.value)) {
        ui.notifications.warn(game.i18n.localize("EW.warnings.duplicatePoolName")+ " " + prompt.newname.value);
        return;
    }
    

    let toAddKey = `system.pools.${prompt.newname.value}`
    let toAddObj = {
        [toAddKey]: {
            min:prompt.newmin.value, 
            max:prompt.newmax.value, 
            current:prompt.newcurrent.value, 
            id:foundry.utils.randomID(16)
        }
    }
    await this.parent.update(toAddObj)
  }

  async _deletePool(pool, p_id) {
    console.log("args: ", pool, p_id)
    const proceed = await foundry.applications.api.DialogV2.confirm({
        window: { title: "EW.pools.prompt.delpool" },
        content: game.i18n.localize("EW.prompt.deleteprefix") + pool + game.i18n.localize("EW.pools.prompt.delpool"),
        modal: true
      });

    if (proceed) {
        let toDelete = "";
        Object.entries(this.pools).forEach(([key, value]) => {
            console.log("key",key, "value", value);
            if (key === pool && value.id === p_id) {
                toDelete = key;
            }
        });

        let deleteKey = `system.pools.-=${toDelete}`;
        let delObj = {
            [deleteKey]:null
        }

        console.log("delete object: ", delObj)
   
        await this.parent.update(delObj);
    } else {
        console.log("Cancelled");
    }
  }

  // Adjust lifeblood or resolve
  async _adjustResource(res, html) {
    
  }

  /* async _applyRemoveTraitModifier (item, action) {

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

  }*/

  /**
   * @param {String} track the health track being updated
   * @param {Number} pos the position in the health track array of the box being updated
   * @param {String} state the current state of the track (healthy, fatigue, regular, lasting);
   */
  async _cycleHitBox(track, pos, state) {

  // console.warn("clicked location: ", hitLocation, "box position: ", position);
    let boxes = [];

    switch(track) {
      case "lifeblood":boxes = this.resources.lifeblood.boxes; break;
      case "resolve":boxes = this.resources.resolve.boxes; break;
      case "frame":boxes = this.frame.boxes; break;
      case "shield":boxes = this.resources.shield.boxes; break;
    }
    let newState = "";

    // rotate through (l)asting, (h)ealthy, (f)atigue, (r)egular damage on each click
    switch(state){
      case "l": newState = "h";break;
      case "h": newState = "f";break;
      case "f": newState = "r";break;
      case "r": newState = "l";break;
      default:newState = currState;
    }

    boxes[pos] = newState;
    await this.actor.update({[`system.resources.${track}.boxes`]:boxes});
}

/**
   * @param {String} track the health track being updated
   * @param {Number} pos the position in the health track array of the box being updated
   * @param {String} state the current state of the track (critical or healthy);
   */

async _cycleCritBox(track,pos,state) {

  // console.warn("clicked location: ", hitLocation, "box position: ", position);
    let boxes = [];

    switch(track) {
      case "lifeblood":boxes = this.resources.lifeblood.critboxes; break;
      case "resolve":boxes = this.resources.resolve.critboxes; break;
      case "frame":boxes = this.frame.critboxes; break;
      case "shield":boxes = this.resources.shield.critboxes; break;
    }
    let newState = state == "c" ? "h" : "c";

    boxes[pos] = newState;
    await this.actor.update({[`system.resources.${track}.critboxes`]:boxes});
}

  async _adjustHealth(){
    
    console.log(this.resources.lifeblood.boxes, this.resources.lifeblood.max);
    if(this.parent.type === "vehicle") {
      while (this.frame.boxes.length != this.frame.rank) {
        this.frame.boxes.length < this.frame.rank ? this.frame.boxes.push("h") : this.frame.boxes.shift();
      }

    } else {
      while (this.resources.lifeblood.boxes.length < this.resources.lifeblood.max) {
        this.resources.lifeblood.boxes.push('h');
      }
      while (this.resources.lifeblood.boxes.length > this.resources.lifeblood.max) {
        this.resources.lifeblood.boxes.shift();
      }
      
      while (this.resources.resolve.boxes.length < this.resources.resolve.max) {
        this.resources.resolve.boxes.push('h');
      }
      while (this.resources.resolve.boxes.length > this.resources.resolve.max) {
        this.resources.resolve.boxes.shift();
      
      }
    }
  }

}

