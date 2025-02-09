const {
  HTMLField, SchemaField, NumberField, StringField, ArrayField
} = foundry.data.fields;
import EWBaseActorData from "./EWBaseActorData.mjs"

export default class EWMajorActorData extends EWBaseActorData {
  static defineSchema() {
    const actorData = super.defineSchema();
    return {
      ...actorData,
      resources: new SchemaField({
        hero_points: new NumberField({required:true, min:0, initial:5}),
        arcana_points: new NumberField({required:true, min:0, initial:0}),
        faith_points: new NumberField({required:true, min:0, initial:0}),
        psi_points: new NumberField({required:true, min:0, initial:0}),
        credit_rating: new NumberField({required:true, min:0, initial:0}),
        currency: new NumberField({required:true, min:0, initial:0}),
        lifeblood: new SchemaField(lifeAndResolve()),
        resolve: new SchemaField(lifeAndResolve())
      }),
      traits: new SchemaField({
        careers: new ArrayField(new StringField()),
        boons: new ArrayField(new StringField()),
        flaws: new ArrayField(new StringField()),
        powers: new ArrayField(new StringField())
      }),
    };
  }
}

function statfield(){
  return {
    rank: new NumberField({required:true, min:0, initial:1}),
    scale: new NumberField({required:true, min:1, initial:1}),
    mod: new NumberField({required:true, initial:0})
  }
}

function lifeAndResolve() {
  return {
    max: new NumberField({required:true, initial:0, min:0}),
    value: new NumberField({required:true, initial:0, min:0}),
    regular: new NumberField({required:true, initial:0, min:0}),
    lasting: new NumberField({required:true, initial:0, min:0}),
    fatigue: new NumberField({required:true, initial:0, min:0}),
    critical: new NumberField({required:true, initial:0, min:0}),
    misc_lfb: new NumberField({required:true, initial:0, min:0}),
  }
}