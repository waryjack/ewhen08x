import { DICE_MODELS, DEFAULT_DICE_MODEL, getDiceModel } from '../diceModels.js'

export class EWCombat extends Combat {

    constructor(...args) {
        super(...args);
    }

    /**
     * @override
     */

    startCombat() {
        let updateDiffs = new Array();
        if(game.settings.get("ewhen", "priority")) {
            this.combatants.forEach(combatant => {
                let adjInit = this.convertInitiative(combatant);
                let diff = {_id:combatant._id, "initiative":adjInit, "initiative":adjInit};
                updateDiffs.push(diff);
                // combatant.update({"initiative":adjInit, "data.initiative":adjInit});
            });
            // // console.warn("Priority List Array: ", priorityList);
            this.updateEmbeddedDocuments("Combatant",  updateDiffs);
            super.startCombat();
        } else {
            super.startCombat();
        }
    }
     /**
     * @override
     */
    nextRound(){
        super.nextRound();
        if(!game.settings.get("ewhen", "rerollPerRound")) { return; }
        let rrlist = new Array();
        let updateDiffs = new Array();
        const diceModel = getDiceModel(game);

        // console.warn("Combatants: ", this.combatants);
        // console.warn("DiceModel: ", diceModel);


        if(game.settings.get("ewhen", "priority")) {
            this.combatants.forEach(combatant => {
                let adjInit = this.convertInitiative(combatant);
                let diff = {_id:combatant._id, "initiative":adjInit, "initiative":adjInit};
                updateDiffs.push(diff);
                // combatant.update({"initiative":adjInit, "data.initiative":adjInit});
            });
            // // console.warn("Priority List Array: ", priorityList);
            this.updateEmbeddedDocuments("Combatant",  updateDiffs);
        } else {
            let cibd = 0;
            let cipd = 0;
            let cimd = 0;
            for (let c of this.combatants) {
                rrlist.push(c.id);
                cibd = c.actor.system.priority_roll.bd;
                cipd = c.actor.system.priority_roll.pd;
                cimd = c.actor.system.priority_roll.md;
            }
            let tInitDiceMods = cibd + cipd + cimd;
            let initFormula = diceModel.numberOfDice + diceModel.baseDie + "kh" + diceModel.numberOfDice;
            // console.warn(initFormula);
            this.rollInitiative(rrlist, {formula:initFormula});
        }
    }

    /**
     * Converts initiative from rolled initiative to Priority Ladder position
     * @param {Combatant} com - combatant object drawn from the current combat
     */
    convertInitiative(com, init) {

        if(game.settings.get("ewhen", "priority") === false) { return; }

        const diceModel = getDiceModel(game)
        // console.warn("DiceModel: ", diceModel);
        var adjInit = 0;
        var isPC;
       console.log("Combatant in convertInit: ", com);
   
        let actorId = com.actorId;
        let actor = game.actors.get(actorId);
   

        let actorInitMods = actor.system.priority_roll.bd + actor.system.priority_roll.pd + actor.system.priority_roll.miscMod;
        let initExpr = (actorInitMods + diceModel.numberOfDice) + diceModel.baseDie + "kh" + diceModel.numberOfDice;
        // console.warn("Init Expression: ", initExpr);
        let initiative = new Roll(initExpr).evaluate().then((outcome) => initResult = outcome);
        let initRoll = initResult.total;
        let name = actor.name;
        let isRival = actor.system.isRival;
        let isTough = actor.system.isTough;
        let isRabble = actor.system.isRabble;

        if(!isRival && !isTough && !isRabble) { isPC = true; } else { isPC = false; }

        let mnd = actor.getAttribute("mind").rank;
        let ini = actor.getAttribute("initiative").rank;
        let diceOnly = initRoll - mnd - ini;

        if(!isPC){
        // todo - work on Rivals with "Diabolical Plan" feat;
            if (isRival) { adjInit = 5; }
            if (isTough) { adjInit = 4; }
            if (isRabble) { adjInit = 2; }

        }

      //  // console.log(name, " isPC: ", isPC);;

        if (isPC) {
            if(diceOnly >= diceModel.success) {
                // mighty success; initiative = 8
                adjInit = 8;
            } else if (initRoll >= diceModel.tn && diceOnly < diceModel.success && diceOnly > diceModel.failure) {
                // regular success; initiative = 6
                adjInit = 6;
            } else if (initRoll < diceModel.tn && diceOnly < diceModel.success && diceOnly > diceModel.failure) {
                // regular failure; initiative = 3
                adjInit = 3;
            } else if (diceOnly <= diceModel.failure) {
                // calam failure, initiative = 1
                adjInit = 1;
            }
        }
    
      return adjInit;

    }

}
