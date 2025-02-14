const {
  HTMLField, BooleanField, SchemaField, NumberField, StringField, ArrayField
} = foundry.data.fields;
import EWBaseActorData from "./base.mjs";
import { getDiceModel } from "../../diceModels.js";

export default class EWHeroData extends EWBaseActorData {
  static defineSchema() {
    const baseSchema = super.defineSchema();
    return {
      ...baseSchema,
      isRival: new BooleanField({required:true, nullable:false, initial:false}),
      encumbrance: new NumberField({required:true, integer:true, min:0, initial:0}),
      hero_points: new NumberField({required:true, integer:true, min:0, initial:5}),
      pools: new ArrayField(new SchemaField({
        name: new StringField({required:true, initial:game.i18n.localize("EW.sheet.newpool")}),
        max: new NumberField({required:true, integer:true, initial:0, min:1}),
        min: new NumberField({required:true, integer:true, initial:0, min:0}),
        current: new NumberField({required:true, integer:true, initial:0, min:0}),
        id: new StringField({required:true, nullable:false, initial:""})
      }), {required:true, initial:[]}),
      priority: new SchemaField({
        numDice: new NumberField({required:true, integer:true, min:1, initial:2}),
        suffix: new StringField({required:true, initial:"kh2"}),
        miscMod: new NumberField({required:true, initial:0}),
        expression: new StringField({required:true, initial:"2d6kh2"}),
        bd: new NumberField({required:true, initial:0, min:0}),
        pd: new NumberField({required:true, initial:0, min:0})
      }),
      traits: new SchemaField({
        careers: new ArrayField(new StringField()),
        boons: new ArrayField(new StringField()),
        flaws: new ArrayField(new StringField()),
        powers: new ArrayField(new StringField())
      }),
    };
  }

  prepareBaseData(){
    super.prepareBaseData();
  }

   /**
  * @override
  */
   prepareDerivedData() {
    super.prepareDerivedData();

    this.resources.lifeblood.max = this.main_attributes.strength.rank + 10 + this.resources.lifeblood.misc_lfb;
    this.resources.resolve.max = this.main_attributes.mind.rank + 10 + this.resources.resolve.misc_res;

    let totalLbd = this.resources.lifeblood.regular + this.resources.lifeblood.lasting + this.resources.lifeblood.fatigue;
    let totalRsd = this.resources.resolve.regular + this.resources.resolve.lasting + this.resources.resolve.fatigue;

    this.resources.lifeblood.value = Math.max(0, this.resources.lifeblood.max - totalLbd);
    this.resources.resolve.value = Math.max(0, this.resources.resolve.max - totalRsd);

    this.priority = this.setPriorityRoll();
  }

  setPriorityRoll() {
          const diceModel = getDiceModel(game);
          let netExtraDice = this.priority.bd - this.priority.pd;
         
          this.priority_roll.numDice = game.settings.get("ewhen", "allSettings").singleDieInit ? 1 : diceModel.numberOfDice;
          let baseDie = game.settings.get("ewhen", "allSettings").singleDieInit ? "d6" : diceModel.baseDie
          let suffix = netExtraDice < 0 ? "kl2" : "kh2";

          this.priority_roll.suffix = suffix;
          
          this.priority_roll.expression = (Number(this.priority_roll.numDice) + Math.abs(netExtraDice)) + baseDie + suffix + "+" + this.priority.miscMod;
  }


      applyRemoveTraitModifier (item, action) {
  
        if(item.type == "trait") {
            const diceModel = getDiceModel(game)
    
            let type = item.type;
            let pmod = item.system.priority_dieMod;
            const adata = foundry.utils.duplicate(this.system.priority_roll);
    
    
            if(pmod == "bonus") {
                // expression is: 3d6kh2 for 2d6, 3d12kh2 for 2d12, 4d6kh3 for 3d6
                adata.expression = `${diceModel.numberOfDice + 1}${diceModel.baseDie}kh${diceModel.numberOfDice}`;
            } else if (type == "trait" && pmod == "penalty") {
                adata.expression = `${diceModel.numberOfDice + 1}${diceModel.baseDie}kl${diceModel.numberOfDice}`;
            }
    
            actor.update({ "system.priority_roll": adata});
        }
    
      }

}