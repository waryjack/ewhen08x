const {
  HTMLField, SchemaField, NumberField, StringField, BooleanField
} = foundry.data.fields;

import EWBaseItemData from "./EWBaseItemData.mjs"

export default class EWWeaponData extends EWBaseItemData {
  static defineSchema() {
    const itemSchema = super.defineSchema();
    return {
      ...itemSchema,
      wpn_type: new StringField({required:true, initial:"lightMelee"}),
      damage: new SchemaField({
        dice: new StringField({required:true, initial:"d6L"}),
        scale: new NumberField({required:true, initial:1, min:1}),
        add_attribute: new StringField({required:true, initial:""}),
        half_attribute: new BooleanField({required:true, initial:false}),
        mod: new NumberField({required:true, initial:0}),
        ap: new NumberField({required:true, initial:0})
      }),
      hands:new StringField({required:true, initial:"one handed"}),
      notes: new HTMLField({initial:""}),
      range: new NumberField({required:true, initial:0}),
      recoil: new NumberField({required:true, initial:0})
    };
  }
}