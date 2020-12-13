export class EWCombatTracker extends CombatTracker {


constructor(...args){
    super(...args);

    console.log("Combat Object: ", this, this.data.hasCombat);

}
async getData(options) {
    let data = await super.getData(options);
    const sort = game.settings.get("lancer-initiative", "act-sort-last");

    if (!data.hasCombat || !sort) return data;
    let turns = Array.from(data.turns);
    turns = turns.sort(function (a, b) {
      const ad = a.flags.activations.value === 0 && a.css.indexOf("active") === -1;
      const bd = b.flags.activations.value === 0 && b.css.indexOf("active") === -1;
      return ad - bd;
    });
    return mergeObject(data, {
      turns: turns,
    });
  }

}