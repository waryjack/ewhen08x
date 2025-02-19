const {
  SchemaField, NumberField, StringField, ArrayField, BooleanField
} = foundry.data.fields;
import { getStatSchema, getHealthSchema } from "../../helpers.mjs";
import EWBaseActorData from "./basemodel.mjs";

export default class EWVehicleData extends EWBaseActorData {
  static defineSchema() {
    
    return {
      type: new StringField(),
      crew: new SchemaField({
        rank: new NumberField({required:true, integer:true, min:0, initial:0})
      }),
      size: new SchemaField(getStatSchema(2)),
      scan: new SchemaField(getStatSchema(1)),
      speed: new SchemaField(getStatSchema(1)),
      def: new SchemaField(getStatSchema(1)),
      armor: new SchemaField(getStatSchema(0)),
      frame: new SchemaField({
        rank: new NumberField({required:true, integer:true, min:0, initial:0}),
        scale: new NumberField({required:true, integer:true, min:1, initial:2}),
        mod: new NumberField({required:true, integer:true, initial:0}),
        value: new NumberField({required:true, integer:true, initial:0}),
        max: new NumberField({required:true, integer:true, initial:0}),
        lasting: new NumberField({required:true, integer:true, initial:0}),
        critical: new NumberField({required:true, integer:true, initial:0}),
        boxes: new ArrayField(new StringField(), {required:true, initial:[]}),
        critboxes: new ArrayField(new StringField(), {required:true, initial:[]})
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

  prepareDerivedData() {
    // Stub
    super.prepareDerivedData();

    /// check these, but okay.
    var frame = this.frame.rank;
    var lasting = this.frame.lasting;
    var shieldDmg = this.resources.shield.lasting + this.resources.shield.regular + this.resources.shield.fatigue;

    this.frame.max = Math.max(5, frame);
    this.frame.value = Math.max(0, this.frame.max - lasting);
    this.resources.shield.max = Math.max(5, frame);
    this.resources.shield.value = Math.max(0, this.resources.shield.max - shieldDmg);
  }


  async _updateFrame(newmax) {
     
    // capture the old settings
    let oldMax = this.frame.max;
    let oldBoxes = this.frame.boxes;

    // figure out the delta
    let maxDelta = Number(newmax) - oldMax;
    
    // adjust the box arrays to the new length
    if (maxDelta < 0) {
      //subtract items from the array
      for (let i; i < Math.abs(maxDelta); i++) {
        oldBoxes.pop();
      }
    } else {
      for (let i; i < maxDelta; i++) {
        oldBoxes.push("h");
      }
    }

    // set the new settings, as usual
    await this.actor.update({"system.frame[boxes]":oldBoxes, "system.frame.max":Number(prompt.newmax.value)});





    

  }

  updateShield(html) {
      // console.warn("Called UpdateShields");

      const resData = this.resources.shield;
      var totalDmg = 0;

          let fatDmg = html.fatdmg.value; // Number(html.find("#fatigue-dmg").val());
          let regDmg = html.regdmg.value; // Number(html.find("#regular-dmg").val());
          let lastDmg = html.lastdmg.value; // Number(html.find("#lasting-dmg").val());


          resData.regular = regDmg;
          resData.fatigue = fatDmg;
          resData.lasting = lastDmg;

          totalDmg = regDmg + fatDmg + lastDmg;
          let currentLb = resData.max - totalDmg;
          resData.value = currentLb;

              if(totalDmg > resData.max) {
                  ui.notifications.error(game.i18n.localize("EW.warnings.damageoverrun"));
              } else {


                  //  console.log("Actor Data post-update: ", actorData);

                  this.resources.shield = resData;

              }
  }
}