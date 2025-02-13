const {
    HTMLField, SchemaField, NumberField, StringField, ArrayField
  } = foundry.data.fields;
  import EWBaseActorData from "./base.mjs";
  import { getDiceModel } from "../../diceModels.js";

export class EWRabbleData extends EWBaseActorData {
  static defineSchema(){
    const actorData = super.defineSchema();
    return {
      ...actorData,
      priority: new NumberField({required:true, integer:true, initial:2}),
      subtype: new StringField({initial:''}) // acolyte, priest, etc.
    }
  }

  prepareBaseData(){
    super.prepareBaseData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    health = game.settings.get("ewhen","allSettins").rabbleStrength ?? 3

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

  }
}