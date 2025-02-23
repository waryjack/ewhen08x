const {
    ArrayField, HTMLField, SchemaField, NumberField, StringField, BooleanField, FilePathField
  } = foundry.data.fields;

export function proper(content) {
    return content[0].toUpperCase() + content.substring(1);
}

export function getStatSchema(value){
    return {
      rank: new NumberField({required:true, integer:true, min:-5, initial:0}),
      scale: new NumberField({required:true, integer:true, min:1, initial:value}),
      mod: new NumberField({required:true, integer:true, initial:0})
    }
  }
  
export function getHealthSchema() {
    return {
      max: new NumberField({required:true, integer:true, initial:1, min:0}),
      min: new NumberField({required:true, integer:true, initial:0, min:0}),
      value: new NumberField({required:true, integer:true, initial:0, min:0}),
      regular: new NumberField({required:true, integer:true, initial:0, min:0}), // may not be needed with the cycleBox approach
      lasting: new NumberField({required:true, integer:true, initial:0, min:0}), // may not be needed with the cycleBox approach
      fatigue: new NumberField({required:true, integer:true, initial:0, min:0}), // may not be needed with the cycleBox approach
      critical: new NumberField({required:true, integer:true, initial:0, min:0}), // may not be needed with the cycleBox approach
      misc_lfb: new NumberField({required:true, integer:true, initial:0, min:0}),
      misc_res: new NumberField({required:true, integer:true, initial:0, min:0}),
      boxes: new ArrayField(new StringField(), {required:true, initial:[]}),
      critboxes: new ArrayField(new StringField(), {required:true, initial:[]})
    }
  }

export function getDefaultCareer(){
  let cname = game.i18n.localize("EW.sheet.newcareer");
  let cobject = {};
  cobject[cname] = {
    rank:0,
    id:foundry.utils.randomID(16)
  }
  return cobject
}

export function getDefaultPool(){
  let pname = game.i18n.localize("EW.sheet.newpool");
  let pobject = {};
  pobject[pname] = {
    min:0,
    max:5,
    current:5,
    id:foundry.utils.randomID(16)
  }
  return pobject;
}