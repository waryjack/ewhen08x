const {
  SchemaField, NumberField, StringField, ArrayField, BooleanField
} = foundry.data.fields;
import { getStatSchema, getHealthSchema } from "../../helpers.mjs";

export default class EWVehicleData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      crew: new SchemaField({
        rank: new NumberField({required:true, integer:true, min:0, initial:0})
      }),
      size: new SchemaField(getStatSchema(2)),
      scan: new SchemaField(getStatSchema(1)),
      speed: new SchemaField(getStatSchema(1)),
      def: new SchemaField(getStatSchema(1)),
      armor: new SchemaField(getStatSchema(1)),
      frame: new SchemaField({
        rank: new NumberField({required:true, integer:true, min:0, initial:1}),
        scale: new NumberField({required:true, integer:true, min:1, initial:2}),
        mod: new NumberField({required:true, integer:true, initial:0}),
        value: new NumberField({required:true, integer:true, initial:1}),
        max: new NumberField({required:true, integer:true, initial:5}),
        lasting: new NumberField({required:true, integer:true, initial:0}),
        critical: new NumberField({required:true, integer:true, initial:0}),
        boxes: new ArrayField(new StringField(), {required:true, initial:[]}),
        critboxes: new ArrayField(new StringField(), {required:true, initial:[]})
      }),
      shield: new SchemaField(getHealthSchema()),
      isShielded: new BooleanField({nullable:false, initial:true,  required:true})
    }
  }

  prepareBaseData(){
    super.prepareBaseData();

  }

  prepareDerivedData() {
    // Stub
    super.prepareDerivedData();

    this._initializeHealth();
    this._adjustHealth();
  }

  _initializeHealth() {
    if (!this.shield.boxes.length) {
      this.shield.boxes = Array(this.shield.max).fill("h").flat();
    }
    if (!this.shield.critboxes.length) {
      this.shield.critboxes = Array(this.shield.max).fill("h").flat();
    }
    if (!this.frame.boxes.length) {
      this.frame.boxes = Array(this.frame.rank).fill("h").flat();
    }
    if (!this.frame.critboxes.length) {
      this.frame.critboxes = Array(this.frame.rank).fill("h").flat();
    }
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

  async _adjustHealth(){

      while (this.frame.boxes.length != this.frame.rank) {
        this.frame.boxes.length < this.frame.rank ? this.frame.boxes.push("h") : this.frame.boxes.shift();
      }

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

  async _adjustStat(stat, dir) {
    console.log("stat, dir: ", stat, dir);
    let curr = this[stat].rank;
    console.log("Current value: ", curr);
    switch(stat){
      case "size": if (dir === "increase") { curr += 1 } else { curr -= 1}
                   console.log("adjusted size rank: ", curr); 
                   await this.parent.update({"system.size.rank":curr})
                   break;
      default: console.log("nothing here yet");
    }
  }
}