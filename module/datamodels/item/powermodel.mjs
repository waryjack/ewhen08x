const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField
} = foundry.data.fields;
import EWBaseItemData from "./baseitemmodel.mjs";

export default class EWPowerData extends EWBaseItemData {
  static defineSchema() {
    const itemSchema = super.defineSchema();
    return {
      ...itemSchema,
      effect:new HTMLField({initial:""}),
      power_type: new StringField({initial:""}),
      arcana_magnitude: new StringField({initial:""}),
      success_roll: new StringField({initial:""}),
      difficulty: new StringField({initial:""}),
      resource_cost: new StringField({initial:""}),
      prereq: new StringField({initial:"none"}),
    };
  }
}