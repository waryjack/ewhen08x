const {
  SchemaField, NumberField, StringField, ArrayField
} = foundry.data.fields;

export default class EWVehicleData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    
    return {
      type: new StringField(),
      crew: new SchemaField({
        rank: new NumberField({required:true, min:0, initial:0})
      }),
      size: new SchemaField(statfield(2)),
      scan: new SchemaField(statfield(1)),
      speed: new SchemaField(statfield(1)),
      def: new SchemaField(statfield(1)),
      armor: new SchemaField(statfield(0)),
      frame: new SchemaField({
        rank: new NumberField({required:true, min:0, initial:0}),
        scale: new NumberField({required:true, min:1, initial:2}),
        mod: new NumberField({required:true, initial:0}),
        value: new NumberField({required:true, initial:0}),
        lasting: new NumberField({required:true, initial:0}),
        critical: new NumberField({required:true, initial:0})
      }),
      resources: new SchemaField({
        shield: new SchemaField(lifeAndResolve())
      }),
      traits: new SchemaField({
        careers: new ArrayField(new StringField()),
        boons: new ArrayField(new StringField()),
        flaws: new ArrayField(new StringField()),
        powers: new ArrayField(new StringField())
      }),
    };
  }

  updateFrame(html) {
    // console.warn("Called UpdateFrame");
    // const actorData = foundry.utils.duplicate(this.data);
    const resData = foundry.utils.deepClone(this.system.frame);
    var totalDmg = 0;



        let lastDmg = Number(html.find("#lasting-dmg").val());
        let critDmg = Number(html.find("#crit-dmg").val());

        resData.lasting = lastDmg;
        resData.critical = Math.min(critDmg, 5);
        totalDmg = lastDmg;
        let currentLb = resData.max - totalDmg;
        resData.value = currentLb;

            if(totalDmg > resData.max) {
                ui.notifications.error(game.i18n.localize("EW.warnings.damageoverrun"));
            } else {
                this.update({ "system.frame": resData });

            }

  }

  updateShield(html) {
      // console.warn("Called UpdateShields");

      const resData = foundry.utils.deepClone(this.system.resources.shield);
      var totalDmg = 0;

          let fatDmg = Number(html.find("#fatigue-dmg").val());
          let regDmg = Number(html.find("#regular-dmg").val());
          let lastDmg = Number(html.find("#lasting-dmg").val());


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

                  this.update({ "system.resources.shield" : resData} );

              }
  }
}

function statfield(scale){
  return {
    rank: new NumberField({required:true, min:0, initial:1}),
    scale: new NumberField({required:true, min:1, initial:scale}),
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
    critical: new NumberField({required:true, initial:0, min:0})
  }
}