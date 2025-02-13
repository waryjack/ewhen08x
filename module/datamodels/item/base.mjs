const {
  HTMLField, NumberField, StringField, FilePathField, ArrayField
} = foundry.data.fields;

export default class EWBaseItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    
    return {
      item_image: new FilePathField({required:false, categories: ["IMAGE"]}),
      currency_cost: new NumberField({required:true, min:0, initial:0}),
      credit_cost: new NumberField({required:true, min:0, initial:0}),
      description: new HTMLField({initial:""}),
      quantity: new NumberField({required:true, min:0, initial:1}),
      weight: new NumberField({required:true, min:0, initial:0}),
      source: new StringField({initial:""}),
      era: new StringField({initial:""}),
      checkval: new StringField({initial:"None"})
    };
  }

}

