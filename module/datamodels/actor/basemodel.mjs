const {
  HTMLField, SchemaField, NumberField, StringField, BooleanField, FilePathField
} = foundry.data.fields;
import { getDiceModel } from "../../diceModels.js";
import { getStatSchema, getHealthSchema } from "../../helpers.mjs";

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
        strength: new SchemaField(getStatSchema()),
        agility: new SchemaField(getStatSchema()),
        mind: new SchemaField(getStatSchema()),
        appeal: new SchemaField(getStatSchema())
      }),
      combat_attributes: new SchemaField({
        melee: new SchemaField(getStatSchema()),
        ranged: new SchemaField(getStatSchema()),
        defense: new SchemaField(getStatSchema()),
        initiative: new SchemaField(getStatSchema())
      }),
      resources: new SchemaField({
        lifeblood: new SchemaField(getHealthSchema()),
        resolve: new SchemaField(getHealthSchema())
      }),
      careers: new ArrayField(new SchemaField({
        name: new StringField({required:true, initial:game.i18n.localize("EW.sheet.newcareer")}),
        rank: new NumberField({required:true, integer:true, min:0, initial:0}),
        id: new StringField({required:true, nullable:false, initial:""}),
      }), {required:true, initial:[{name:game.i18n.localize("EW.sheet.newcareer"), rank:0}]}),
    };
  }

  prepareDerivedData() {
    super.prepareDerivedData()

    // Set initiative based on system settings
    this._setInitiative(game.settings.get("ewhen","allSettings"));
  }

  _setInitiative() {
    this.initiative = `${settings.diceType} + ${settings.initAttribute} + ${settings.initCombat}`;
  }
  

}
