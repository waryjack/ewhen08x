export class EWCombat extends Combat {

       

    getActorCombatant(actor) {
        return this.combatants.find((c) => c.actor._id === actor._id);
    }




}