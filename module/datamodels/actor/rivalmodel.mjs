const {
  HTMLField, BooleanField, SchemaField, NumberField, StringField, ArrayField
} = foundry.data.fields;
import EWBaseActorData from "./basemodel.mjs";
import { getDiceModel } from "../../diceModels.js";

export default class EWRivalData extends EWBaseActorData {
  static defineSchema() {
    const actorData = super.defineSchema();
    return {
      ...actorData,
      hero_points: new NumberField({required:true, integer:true, min:0, initial:5}),
      pools: new ArrayField(new SchemaField({
        poolname: new StringField({required:true, initial:game.i18n.localize("EW.game_term.newpool")}),
        max: new NumberField({required:true, integer:true, initial:0, min:1}),
        min: new NumberField({required:true, integer:true, initial:0, min:0}),
        current: new NumberField({required:true, integer:true, initial:0, min:0}),
        id: new StringField({required:true, nullable:false, initial:""})
      }), {required:true, initial:[]}),
      priority: new NumberField({required:true, integer:true, min:5, initial:5})
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

    his.resources.lifeblood.max = this.main_attributes.strength.rank + 10 + this.resources.lifeblood.misc_lfb;
    this.resources.resolve.max = this.main_attributes.mind.rank + 10 + this.resources.resolve.misc_res;

    let totalLbd = this.resources.lifeblood.regular + this.resources.lifeblood.lasting + this.resources.lifeblood.fatigue;
    let totalRsd = this.resources.resolve.regular + this.resources.resolve.lasting + this.resources.resolve.fatigue;

    this.resources.lifeblood.value = Math.max(0, this.resources.lifeblood.max - totalLbd);
    this.resources.resolve.value = Math.max(0, this.resources.resolve.max - totalRsd);

    this.priority = 5;
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