const {
    ArrayField, HTMLField, SchemaField, NumberField, StringField, BooleanField, FilePathField
  } = foundry.data.fields;

export function proper(content) {
    return content[0].toUpperCase() + content.substring(1);
}

export function getStatSchema(){
    return {
      rank: new NumberField({required:true, integer:true, min:0, initial:1}),
      scale: new NumberField({required:true, integer:true, min:1, initial:1}),
      mod: new NumberField({required:true, integer:true, initial:0})
    }
  }
  
export function getHealthSchema() {
    return {
      max: new NumberField({required:true, integer:true, initial:0, min:0}),
      value: new NumberField({required:true, integer:true, initial:0, min:0}),
      regular: new NumberField({required:true, integer:true, initial:0, min:0}),
      lasting: new NumberField({required:true, integer:true, initial:0, min:0}),
      fatigue: new NumberField({required:true, integer:true, initial:0, min:0}),
      critical: new NumberField({required:true, integer:true, initial:0, min:0}),
      misc_lfb: new NumberField({required:true, integer:true, initial:0, min:0}),
      misc_res: new NumberField({required:true, integer:true, initial:0, min:0})
    }
  }