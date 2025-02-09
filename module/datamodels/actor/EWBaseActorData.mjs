const {
  HTMLField, SchemaField, NumberField, StringField, BooleanField, FilePathField
} = foundry.data.fields;


function _statfield(){
  return {
    rank: new NumberField({required:true, min:0, initial:1}),
    scale: new NumberField({required:true, min:1, initial:1}),
    mod: new NumberField({required:true, initial:0})
  }
}

function _lifeAndResolve() {
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

export default class EWMajorActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      actor_image: new FilePathField({required:false, categories: ["IMAGE"]}),
      isRival: new BooleanField({required:true, nullable:false,initial:false,label:"Rival"}),
      isRabble: new BooleanField({required:true, initial:false, label:"Rabble"}),
      isTough: new BooleanField({required:true, initial:false, label:"Tough"}),
      isCreature: new BooleanField({required:true, initial:false, label:"Creature"}),
      isEntity: new BooleanField({required:true, initial:false, label:"Entity"}),
      backstory: new HTMLField({initial: ""}),
      size: new StringField({required:true, initial:"medium"}),
      armorbonus: new NumberField({required:true, integer:true, min:0, initial:0}),
      miscarmor: new NumberField({required:true, integer:true, min:0, initial:0}),
      encumbrance: new NumberField({required:true, integer:true, min:0, initial:0}),
      priority_roll: new SchemaField({
        numDice: new NumberField({required:true, integer:true, min:2, initial:2}),
        suffix: new StringField({required:true, initial:"kh2"}),
        miscMod: new NumberField({required:true, initial:0}),
        expression: new StringField({required:true, initial:"2d6kh2"}),
        bd: new NumberField({required:true, initial:0, min:0}),
        pd: new NumberField({required:true, initial:0, min:0})
      }),
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

  prepareBaseData(){
    super.prepareBaseData();

    const actorData = this.system; // actorData is "actor.data.data"

    //console.warn("Actor Object: ", this);
    if (this.type === 'character') {
        this._prepareCharacterData(actorData);
    } else if (this.type === 'vehicle') {
        this._prepareVehicleData(actorData);
    }
  }

  /**
  * @param actorData {EWActor} - this EWActor object's system-specific data
  */
  _prepareCharacterData(actorData) {
      super.prepareDerivedData();

      const data = actorData;
      // console.warn("PrepareCharacterData data object: ", data);

      var str = data.main_attributes.strength.rank;
      var mnd = data.main_attributes.mind.rank;
      var mlf = data.resources.lifeblood.misc_lfb;
      var mre = data.resources.resolve.misc_res;

      // Initialize derived traits - lifeblood and resolve
      // but not for rabble or toughs!
      // console.warn("Rabble? ", data.isRabble, " Tough? ", data.isTough);
      if (!data.isRabble && !data.isTough){
          foundry.utils.setProperty(actorData, 'resources.lifeblood.max', Number(str) + 10 + mlf);
          foundry.utils.setProperty(actorData, 'resources.resolve.max', Number(mnd) + 10 + mre);
      }

      if (data.isRabble) {
          foundry.utils.setProperty(actorData, 'resources.lifeblood.max', game.settings.get('ewhen', 'allSettings').rabbleStrength);
          foundry.utils.setProperty(actorData, 'resources.resolve.max', game.settings.get('ewhen', 'allSettings').rabbleStrength);
      }

      if (data.isTough) {
          foundry.utils.setProperty(actorData, 'resources.lifeblood.max', Number(str)+5);
          foundry.utils.setProperty(actorData, 'resources.resolve.max', Number(mnd)+5);
      }

      let totalLbd = data.resources.lifeblood.regular + data.resources.lifeblood.lasting + data.resources.lifeblood.fatigue;
      let totalRsd = data.resources.resolve.regular + data.resources.resolve.lasting + data.resources.resolve.fatigue;

      foundry.utils.setProperty(actorData, 'resources.lifeblood.value', Math.max(0, data.resources.lifeblood.max - totalLbd));

      foundry.utils.setProperty(actorData, 'resources.resolve.value', Math.max(0, data.resources.resolve.max - totalRsd));

      // Calculate priority roll expression based on base info and misc BD/PD bonuses

      foundry.utils.setProperty(actorData, 'system.priority_roll', this.setPriorityRoll());
  }

  _prepareVehicleData(actorData) {
      // Stub
      super.prepareDerivedData();
      const data = actorData;
      // console.warn("vehicle data", data);

      var frame = data.frame.rank;
      var lasting = data.frame.lasting;
      var shieldDmg = data.resources.shield.lasting + data.resources.shield.regular + data.resources.shield.fatigue;

      foundry.utils.setProperty(actorData, "frame.max", Math.max(5, frame));
      foundry.utils.setProperty(actorData, "frame.value", Math.max(0, data.frame.max - lasting));
      foundry.utils.setProperty(actorData, "resources.shield.max", Math.max(5, frame));
      foundry.utils.setProperty(actorData, "resources.shield.value", Math.max(0, data.resources.shield.max - shieldDmg));
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
