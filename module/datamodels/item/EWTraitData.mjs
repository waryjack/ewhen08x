const {
 BooleanField, StringField
} = foundry.data.fields;

import EWBaseItemData from "./EWBaseItemData.mjs"

export default class EWTraitData extends EWBaseItemData {
  static defineSchema() {
    const itemData = super.defineSchema();
    return {
      ...itemData,
      isTemporary: new BooleanField({required:true, initial:false}),
      type: new StringField({initial:""}),
      priority_dieMod: new StringField({initial: "none"}),
      prereq_for: new StringField({initial:""}),
    };
  }
}