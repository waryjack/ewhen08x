const {
    HTMLField, SchemaField, NumberField, StringField, ArrayField
  } = foundry.data.fields;
  import EWBaseActorData from "./basemodel.mjs";
  import { getStatSchema } from "../../helpers.mjs";

export default class EWToughData extends EWBaseActorData {
  static defineSchema(){
    const baseSchema = super.defineSchema();
    return {
      ...baseSchema,
      priority: new NumberField({required:true, integer:true, initial:4}),
      subtype: new StringField({initial:''}),
      size: new SchemaField(getStatSchema(1)) // acolyte, priest, etc.
    }
  }



  prepareBaseData() {// they can haprepareBaseData(){
    super.prepareBaseData();
  }

   /**
  * @override
  */
   prepareDerivedData() {
   

    this.resources.lifeblood.max = this.main_attributes.strength.rank + 5 + this.resources.lifeblood.misc_lfb;
    this.resources.resolve.max = this.main_attributes.mind.rank + 5 + this.resources.resolve.misc_res;

    let totalLbd = this.resources.lifeblood.regular + this.resources.lifeblood.lasting + this.resources.lifeblood.fatigue;
    let totalRsd = this.resources.resolve.regular + this.resources.resolve.lasting + this.resources.resolve.fatigue;

    this.resources.lifeblood.value = Math.max(0, this.resources.lifeblood.max - totalLbd);
    this.resources.resolve.value = Math.max(0, this.resources.resolve.max - totalRsd);

    this.priority = 4;
    super.prepareDerivedData();
  }
}