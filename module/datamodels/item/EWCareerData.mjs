const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField
} = foundry.data.fields;

import EWBaseItemData from "./EWBaseItemData.mjs"

export default class EWCareerData extends EWBaseItemData {
  static defineSchema() {
    const itemData = super.defineSchema();
    return {
      ...itemData,
      rank: new NumberField({required:true, min:0, initial:0})
    };
  }
}