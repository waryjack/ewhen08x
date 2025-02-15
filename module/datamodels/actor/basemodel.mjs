const {
  HTMLField, SchemaField, NumberField, StringField, BooleanField, FilePathField, ObjectField
} = foundry.data.fields;
import { getDiceModel } from "../../diceModels.js";
import { getStatSchema, getHealthSchema, getDefaultCareer } from "../../helpers.mjs";

export default class EWBaseActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      actor_image: new FilePathField({required:false, categories: ["IMAGE"]}),
      isCreature: new BooleanField({required:true, initial:false, label:"Creature"}),
      backstory: new HTMLField({initial: ""}),
      size: new StringField({required:true, initial:"medium"}),
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
        resolve: new SchemaField(getHealthSchema())
      }),
      careers: new ObjectField()
    }
  }

  prepareDerivedData() {
    super.prepareDerivedData()

    // Set initiative based on system settings
    this._setInitiative(game.settings.get("ewhen","allSettings"));
  }

  _setInitiative(settings) {
    this.initiative = `${settings.diceType} + ${settings.initAttribute} + ${settings.initCombat}`;
  }

  

  // Adjust lifeblood or resolve
  async _adjustResource(res, html) {
    
  }

  async _deleteCareer(career, id) {
      console.log("career", career, "id", id);
      console.log("Actor data: ", this);
      let myCareers = this.careers;
      let newCareers = {};
      let toDelete = "";
      console.log("my careers", myCareers);
      Object.entries(this.careers).forEach(([key, value]) => {
          console.log("key",key, "value", value);
          if (key === career && value.id === id) {
              // skip it
          } else {
              newCareers[key] = value;
          }
      });
     
      console.log("myCareers delete check:", newCareers);
      foundry.utils.setProperty(this, "careers", newCareers);
      await this.actor.update()
    }

  async _applyRemoveTraitModifier (item, action) {

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

}

