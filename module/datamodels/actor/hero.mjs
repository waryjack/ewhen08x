const {
  HTMLField, BooleanField, SchemaField, NumberField, StringField, ArrayField
} = foundry.data.fields;
import EWBaseActorData from "./base.mjs";
import { getDiceModel } from "../../diceModels.js";

export default class EWHeroData extends EWBaseActorData {
  static defineSchema() {
    const actorData = super.defineSchema();
    return {
      ...actorData,
      isRival: new BooleanField({required:true, nullable:false, initial:false}),
      encumbrance: new NumberField({required:true, integer:true, min:0, initial:0}),
      careers: new ArrayField(new SchemaField({
        careername: new StringField({required:true, initial:game.i18n.localize("EW.game_term.newcareer")}),
        rank: new NumberField({required:true, integer:true, min:0, initial:0})
      })),
      pools: new ArrayField(new SchemaField({
        poolname: new StringField({required:true, initial:game.i18n.localize("EW.game_term.newpool")}),
        max: new NumberField({required:true, integer:true, initial:0, min:1}),
        min: new NumberField({required:true, integer:true, initial:0, min:0}),
        current: new NumberField({required:true, integer:true, initial:0, min:0})
      })),
      resources: new SchemaField({
        hero_points: new NumberField({required:true, integer:true, min:0, initial:5}),
        arcana_points: new NumberField({required:true, integer:true, min:0, initial:0}),
        faith_points: new NumberField({required:true, integer:true, min:0, initial:0}),
        psi_points: new NumberField({required:true, integer:true, min:0, initial:0}),
        credit_rating: new NumberField({required:true, integer:true, min:0, initial:0}),
        currency: new NumberField({required:true, min:0, initial:0}),
        lifeblood: new SchemaField(lifeAndResolve()),
        resolve: new SchemaField(lifeAndResolve())
      }),
      priority_roll: new SchemaField({
        numDice: new NumberField({required:true, integer:true, min:2, initial:2}),
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

    let str = this.main_attributes.strength.rank;
    let mnd = this.main_attributes.mind.rank;
    let mlf = this.resources.lifeblood.misc_lfb;
    let mre = this.resources.resolve.misc_res;

    // Initialize derived traits - lifeblood and resolve
    // but not for rabble or toughs!
    console.warn("Stats: ", str, mnd, mlf, mre);
    console.warn("Rabble? ", this.isRabble, " Tough? ", this.isTough);
    if (!this.isRabble && !this.isTough){
        this.resources.lifeblood.max = str + 10 + mlf;
        this.resources.resolve.max = mnd + 10 + mre;
        console.log("Lifeblood, resolve: ", this.resources.resolve.max);
    }

    if (this.isRabble) {
        this.resources.lifeblood.max = game.settings.get('ewhen', 'allSettings').rabbleStrength;
        this.resources.resolve.max = game.settings.get('ewhen', 'allSettings').rabbleStrength;
    }

    if (this.isTough) {
      this.resources.lifeblood.max = Number(str) + 5;
      this.resources.resolve.max = Number(mnd) + 5;
    }

    let totalLbd = this.resources.lifeblood.regular + this.resources.lifeblood.lasting + this.resources.lifeblood.fatigue;
    let totalRsd = this.resources.resolve.regular + this.resources.resolve.lasting + this.resources.resolve.fatigue;

    this.resources.lifeblood.value = Math.max(0, this.resources.lifeblood.max - totalLbd);
    this.resources.resolve.value = Math.max(0, this.resources.resolve.max - totalRsd);

    // Calculate priority roll expression based on base info and misc BD/PD bonuses
    console.log("Major Actor Data: ", this);
    this.priority_roll = this.setPriorityRoll();
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

   /**
       * Calculate the roll formula for priority rolls based on various character bonuses
       */
      setPriorityRoll() {
          const diceModel = getDiceModel(game)
          const priority = this.priority_roll;
          let netExtraDice = priority.bd - priority.pd;
          let numberOfDice = diceModel.numberOfDice;
          let baseDie = diceModel.baseDie;
  
          // If using H+I or BoL compatible initiative - uses just a single D6
          if(game.settings.get("ewhen", "allSettings").singleDieInit) {
              numberOfDice = 1;
              baseDie = "d6";
          }
  
          const newSuffix = netExtraDice < 0 ? `kl${numberOfDice}` : `kh${numberOfDice}`;
          // console.warn("net extra dice: ", netExtraDice);
  
          let finalFormula = (Number(numberOfDice) + Math.abs(netExtraDice)) + baseDie + newSuffix + "+" + priority.miscMod;
  
          this.priority_roll.expression = finalFormula;
  
          // console.warn("Priority Final Expression: ", finalFormula);
  
          return priority;
  
      }


}

function statfield(){
  return {
    rank: new NumberField({required:true, integer:true, min:0, initial:1}),
    scale: new NumberField({required:true, integer:true, min:1, initial:1}),
    mod: new NumberField({required:true, integer:true, initial:0})
  }
}

function lifeAndResolve() {
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