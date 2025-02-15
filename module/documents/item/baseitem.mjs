

export default class EWItem extends Item {

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
  }