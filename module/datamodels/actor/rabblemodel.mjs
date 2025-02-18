const {
    BooleanField, NumberField, StringField
  } = foundry.data.fields;
  import EWBaseActorData from "./basemodel.mjs";
  import { getDiceModel } from "../../diceModels.js";

export default class EWRabbleData extends EWBaseActorData {
  static defineSchema(){
    const baseSchema = super.defineSchema();
    return {
      ...baseSchema,
      priority: new NumberField({required:true, integer:true, initial:2}),
      subtype: new StringField({initial:''}), // acolyte, priest, etc.
      armed: new BooleanField({required:true, nullable:false, initial:false})
    }
  }

  prepareBaseData(){
    super.prepareBaseData();
  }

  prepareDerivedData() {
    this.main_attributes = this._setStatValues(this.main_attributes);
    this.combat_attributes = this._setStatValues(this.combat_attributes)

    let health = game.settings.get("ewhen","allSettings").rabbleStrength ?? 3
    this.resources.lifeblood = {
      value: health,
      regular: 0,
      lasting: 0,
      fatigue: 0,
      critical: 0,
      misc_lfb: 0,
      misc_res: 0
    }

    this.priority = 2;

    super.prepareDerivedData();
}

  _setStatValues(obj) {

    for (const [stat, vals] of Object.entries(obj)) {
      for (const v of Object.keys(vals)) {
        vals[v] = 0
      }
      obj[stat] = vals
    }

    return obj;
  }
}