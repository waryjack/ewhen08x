const {
  SchemaField, NumberField, StringField, ArrayField
} = foundry.data.fields;
import { getStatSchema, getHealthSchema } from "../../helpers.mjs";

export default class EWVehicleData extends foundry.abstract.TypeDataModel {
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
        critical: new NumberField({required:true, integer:true, initial:0})
      }),
      resources: new SchemaField({
        shield: new SchemaField(getHealthSchema())
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

    var frame = this.frame.rank;
    var lasting = this.frame.lasting;
    var shieldDmg = this.resources.shield.lasting + this.resources.shield.regular + this.resources.shield.fatigue;

    this.frame.max = Math.max(5, frame);
    this.frame.value = Math.max(0, this.frame.max - lasting);
    this.resources.shield.max = Math.max(5, frame);
    this.resources.shield.value = Math.max(0, this.resources.shield.max - shieldDmg);
  }

  updateFrame(html) {
    // console.warn("Called UpdateFrame");
    // const actorData = foundry.utils.duplicate(this.data);
    const resData = this.frame;
    var totalDmg = 0;



        let lastDmg = html.lastdmg.value; // Number(html.find("#lasting-dmg").val());
        let critDmg = html.critdmg.value; // Number(html.find("#crit-dmg").val());

        resData.lasting = lastDmg;
        resData.critical = Math.min(critDmg, 5);
        totalDmg = lastDmg;
        let currentLb = resData.max - totalDmg;
        resData.value = currentLb;

            if(totalDmg > resData.max) {
                ui.notifications.error(game.i18n.localize("EW.warnings.damageoverrun"));
            } else {
                this.frame = resData;

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
}