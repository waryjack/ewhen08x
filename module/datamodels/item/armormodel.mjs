const {
  SchemaField, NumberField, StringField, BooleanField
} = foundry.data.fields;
import EWBaseItemData from "./baseitemmodel.mjs";

export default class EWArmorData extends EWBaseItemData {
  static defineSchema() {
    const itemSchema = super.defineSchema();
    return {
      ...itemSchema,
      armor_type: new StringField({initial:"none", required:true}),
      equipped: new BooleanField({required:true, initial:false}),
      accessory: new BooleanField({required:true, initial:false}),
      protection: new SchemaField({
        fixed: new NumberField({required:true, nullable:false, initial:0, min:0}),
        variable: new StringField({required:true, initial:""}),
        scale: new NumberField({required:true, initial:1, min:1})
      }),
      penalty: new SchemaField({
        to: new StringField({initial:"none"}),
        amount: new NumberField({required:true, min:0, initial:0})
      }),
      bonus: new SchemaField({
        to: new StringField({initial:"none"}),
        amount: new NumberField({required:true, min:0, initial:0})
      }),
      diffmod: new SchemaField({
        to: new StringField({initial:"none"}),
        amount: new NumberField({min:0, initial:0})
      })
    };
  }
}