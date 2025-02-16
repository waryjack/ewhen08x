

export default class EWBaseItem extends Item {


  static PROMPT_TEMPLATES = {
    weapon:"systems/ewhen/templates/prompt/weapondamage.hbs",
    armor:"systems/ewhen/templates/prompts/armorroll.hbs",
    power:"systems/ewhen/templates/prompts/powerroll.hbs"
  }

    /** @override */
    getRollData() {
      const rollData = this.actor?.getRollData() ?? {};
  
      // Shallow copy
      rollData.item = {...this.system, flags: this.flags, name: this.name};
  
      return rollData;
    }
  
    /** @override */
    prepareDerivedData() {
      super.prepareDerivedData();
    }

    get PROMPT_TEMPLATES() {
      return this.PROMPT_TEMPLATES;
    }

    get currency_cost() {
      return this.system.currency_cost;
    }

    get credit_cost() {
      return this.system.credit_cost;
    }

    get description() {
      return this.system.description;
    }

    get quantity() {
      return this.system.quantity;
    }

    get weight() {
      return this.system.weight;
    }

    get source() {
      return this.system.source;
    }

    get era(){
      return this.system.era;
    }

  }