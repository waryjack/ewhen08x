const {
  HTMLField, BooleanField, SchemaField, NumberField, StringField, ArrayField, ObjectField
} = foundry.data.fields;
import EWBaseActorData from "./basemodel.mjs";
import { getDiceModel } from "../../diceModels.js";
import { getStatSchema } from "../../helpers.mjs";

export default class EWHeroData extends EWBaseActorData {
  static defineSchema() {
    const baseSchema = super.defineSchema();
    return {
      ...baseSchema,
      isRival: new BooleanField({required:true, nullable:false, initial:false}),
      size: new SchemaField(getStatSchema(1)),
      encumbrance: new NumberField({required:true, integer:true, min:0, initial:0}),
      hero_points: new NumberField({required:true, integer:true, min:0, initial:5}),
      priority: new SchemaField({
        numDice: new NumberField({required:true, integer:true, min:1, initial:2}),
        suffix: new StringField({required:true, initial:"kh2"}),
        miscMod: new NumberField({required:true, initial:0}),
        expression: new StringField({required:true, initial:"2d6kh2"}),
        bd: new NumberField({required:true, initial:0, min:0}),
        pd: new NumberField({required:true, initial:0, min:0})
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
    this.resources.lifeblood.max = this.main_attributes.strength.rank + 10 + this.resources.lifeblood.misc_lfb;
    this.resources.resolve.max = this.main_attributes.mind.rank + 10 + this.resources.resolve.misc_res;
    //these may be no longer needed; it's a manual tickbox approach instead
    let totalLbd = this.resources.lifeblood.regular + this.resources.lifeblood.lasting + this.resources.lifeblood.fatigue;
    let totalRsd = this.resources.resolve.regular + this.resources.resolve.lasting + this.resources.resolve.fatigue;
    this.resources.lifeblood.value = Math.max(0, this.resources.lifeblood.max - totalLbd);
    this.resources.resolve.value = Math.max(0, this.resources.resolve.max - totalRsd);

    this.priority = this.setPriorityRoll();
    super.prepareDerivedData();
  }

  setPriorityRoll() {
          const diceModel = getDiceModel(game);
          let netExtraDice = this.priority.bd - this.priority.pd;
         
          this.priority.numDice = game.settings.get("ewhen", "allSettings").singleDieInit ? 1 : diceModel.numberOfDice;
          let baseDie = game.settings.get("ewhen", "allSettings").singleDieInit ? "d6" : diceModel.baseDie
          let suffix = netExtraDice < 0 ? "kl2" : "kh2";

          this.priority.suffix = suffix;
          
          this.priority.expression = (Number(this.priority.numDice) + Math.abs(netExtraDice)) + baseDie + suffix + "+" + this.priority.miscMod;
  }

    _useHeroPoint() {
      const hp = this.hero_points;
      if(hp == 0) { ui.notifications.error(game.i18n.localize("EW.warnings.noHeroPoints")); return; }
      let newHp= Math.max(0, hp - 1);
      // console.log("HP / NewHP: ", hp, newHp);
      this.parent.update({"system.hero_points": newHp});

      let chatData = {
          actor:this.name
      }

    renderTemplate('systems/ewhen/templates/roll/heropoint.hbs', chatData).then((msg)=>{
        ChatMessage.create({
            user: game.user._id,
            type:CONST.CHAT_MESSAGE_STYLES.ROLL,
            speaker: ChatMessage.getSpeaker(),
            content: msg
        });



    });
  }


}
