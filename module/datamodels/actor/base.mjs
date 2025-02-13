const {
  HTMLField, SchemaField, NumberField, StringField, BooleanField, FilePathField
} = foundry.data.fields;


function _statfield(){
  return {
    rank: new NumberField({required:true, integer:true, min:0, initial:1}),
    scale: new NumberField({required:true, integer:true, min:1, initial:1}),
    mod: new NumberField({required:true, integer:true, initial:0})
  }
}

function _lifeAndResolve() {
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

export default class EWBaseActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      actor_image: new FilePathField({required:false, categories: ["IMAGE"]}),
      isCreature: new BooleanField({required:true, initial:false, label:"Creature"}),
      backstory: new HTMLField({initial: ""}),
      size: new StringField({required:true, initial:"medium"}),
      armorbonus: new NumberField({required:true, integer:true, min:0, initial:0}),
      miscarmor: new NumberField({required:true, integer:true, min:0, initial:0}),
      initiative: new StringField({required:true, initial:"2d6"}),
      main_attributes: new SchemaField({
        strength: new SchemaField(_statfield()),
        agility: new SchemaField(_statfield()),
        mind: new SchemaField(_statfield()),
        appeal: new SchemaField(_statfield())
      }),
      combat_attributes: new SchemaField({
        melee: new SchemaField(_statfield()),
        ranged: new SchemaField(_statfield()),
        defense: new SchemaField(_statfield()),
        initiative: new SchemaField(_statfield())
      }),
      resources: new SchemaField({
        lifeblood: new SchemaField(_lifeAndResolve()),
        resolve: new SchemaField(_lifeAndResolve())
      })
    };
  }

  

}
