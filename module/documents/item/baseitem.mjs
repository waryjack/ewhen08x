import EWWeaponRoll from "../../roll/weaponroll.mjs";
import EWArmorRoll from "../../roll/armorroll.mjs";
import EWPowerRoll from "../../roll/powerroll.mjs";

export default class EWBaseItem extends Item {


  

    /** @override */
    getRollData() {
      const rollData = this.system ?? {};
  
      return rollData;
    }
  
    /** @override */
    prepareDerivedData() {
      super.prepareDerivedData();
    }

    async _rollWeaponDamage(atts) {
      await EWWeaponRoll.prompt({wname:this.name, w_id:this._id, actorAttributes:atts, weaponStats:this.getRollData()})
    }

    async _rollArmor() {
      console.log("Armor item: ", this.system.protection.variable);
      // let protection = (this.system.protection.fixed == 0) ? this.system.protection.variable : this.system.protection.fixed;
      const formula = (this.system.protection.fixed === 0) ? this.system.protection.variable : this.system.protection.fixed;
      console.log("formioli: ", formula)
      let roll = new EWArmorRoll(formula);
      
      await roll.evaluate();
      let tt = new Handlebars.SafeString(await roll.getTooltip());
      console.log("tt",tt);
      let chatData = {
        armor:this.name,
        protection:formula,
        total:roll.total,
        tooltip:new Handlebars.SafeString(await roll.getTooltip())
      }

      let content = await renderTemplate("systems/ewhen/templates/roll/armormessage.hbs", chatData);
      ChatMessage.create({
        user: game.user._id,
        rolls: [roll],
        speaker: ChatMessage.getSpeaker(),
        content: content
      });
    }

    // GETTERS

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