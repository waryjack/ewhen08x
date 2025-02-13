const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField
} = foundry.data.fields;

import EWBaseItemData from "./EWBaseItemData.mjs"

export default class EWPointPoolData extends EWBaseItemData {
  static defineSchema() {
    const itemData = super.defineSchema();
    return {
      ...itemData,
      min: new NumberField({required:true, initial:0, min:0}),
      max: new NumberField({required:true, initial:0}),
      current: new NumberField({required:true, initial:0})
    };
  }
}