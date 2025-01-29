import { DICE_MODELS, DEFAULT_DICE_MODEL, getDiceModel } from '../diceModels.js'

export class EWCombat extends Combat {

    constructor(...args) {
        super(...args);
    }

    /**
     * @override
     */

    startCombat() {
       // let updateDiffs = new Array();
        if(game.settings.get("ewhen", "allSettings").priority) {
            this.combatants.forEach(combatant => {
                this.convertInitiative(combatant)
                    .then((result) => {
                        let updateDiffs = new Array();
                        let combatant = result[1];
                        let adjInit = result[0];
                        let diff = {_id:combatant._id, "initiative":adjInit, "initiative":adjInit};
                        updateDiffs.push(diff);
                        // console.log("Combatant: ", combatant);
                        // console.log("Adjinit: ", adjInit);
                        // console.log("Update Diffs: ", updateDiffs);
                        return updateDiffs;
                    })
                    .then((updateDiffs) => this.updateEmbeddedDocuments("Combatant", updateDiffs))
                    .then(() => super.startCombat());
                // combatant.update({"initiative":adjInit, "data.initiative":adjInit});
            });
        } else {
            
            super.startCombat();
        }
    }
     /**
     * @override
     */
    nextRound(){
        super.nextRound();
        if(!game.settings.get("ewhen", "allSettings").rerollPerRound) { return; }
        let rrlist = new Array();
        
        const diceModel = getDiceModel(game);

        // console.warn("Combatants: ", this.combatants);
        // console.warn("DiceModel: ", diceModel);


        if(game.settings.get("ewhen", "allSettings").priority) {
            this.combatants.forEach(combatant => {
                this.convertInitiative(combatant)
                    .then((result) => {
                        let updateDiffs = new Array();
                        let combatant = result[1];
                        let adjInit = result[0];
                        let diff = {_id:combatant._id, "initiative":adjInit, "initiative":adjInit};
                        updateDiffs.push(diff);
                        // console.log("Combatant: ", combatant);
                        /* console.log("Adjinit: ", adjInit);
                        console.log("Update Diffs: ", updateDiffs); */
                        return updateDiffs;
                    })
                    .then((updateDiffs) => this.updateEmbeddedDocuments("Combatant", updateDiffs))
                });
        } else {
            // example @combat_attributes.melee.rank, main_attributes.strength.rank; 0 is none selected
            // need to be split apart to parse the 
            let initAttribute = game.settings.get('ewhen', 'allSettings').initAttribute;
            let initCombat = game.settings.get('ewhen', 'allSettings').initCombat;
           
            let cimd = 0;
            for (let c of this.combatants) {
                rrlist.push(c.id);
                /*cibd = c.actor.system.priority_roll.bd;
                cipd = c.actor.system.priority_roll.pd;
                cimd = c.actor.system.priority_roll.md;*/
            }
           // let tInitDiceMods = cibd + cipd + cimd;

           let initFormula = `${diceModel.numberOfDice + diceModel.baseDie}kh${diceModel.numberOfDice} + ${initAttribute} + ${initCombat}`

           if(game.settings.get("ewhen", "allSettings").singleDieInit) {
                initFormula = `1d6 + ${initAttribute} + ${initCombat}`
           }
            // console.warn("RRlist and initformula: ", rrlist, initFormula);
            this.rollInitiative(rrlist, {formula:initFormula});
        }
    }

    /**
     * Converts initiative from rolled initiative to Priority Ladder position
     * @param {Combatant} com - combatant object drawn from the current combat
     */
    async convertInitiative(com, init) {

        if(game.settings.get("ewhen", "allSettings").priority === false) { return; }

        const diceModel = getDiceModel(game)
        // console.warn("DiceModel: ", diceModel);
        var adjInit = 0;
        var isPC;
        // console.log("Combatant in convertInit: ", com.actor.name);
   
        // let actorId = com.actorId;
        let actor = com.token.actor;
   
        // console.warn("Actor from Combatant Information: ", actor);
        // get initiative expression mods
        let initAttribute = game.settings.get('ewhen', 'allSettings').initAttribute;
        let initCombat = game.settings.get('ewhen', 'allSettings').initCombat;

        // couple dummy variables for building the initiative expression below
        let iaVal = 0;
        let icVal = 0;
        // get the actual values to insert into the roll expression, since they don't appear to interpret the macro shorthand
         // example @combat_attributes.melee.rank, main_attributes.strength.rank; 0 is none selected
        // kludgy string fiddling to get the actual name; a smarter person would have solved this through elegant redesign. I am not that person.

        if (initAttribute === '0') {
            // do nothing; the values will just be zero
        } else {
            let iaString = initAttribute.split(".")[1]
           // console.log("init attribute: ", iaString);
            iaVal = actor.system.main_attributes[iaString].rank;
           // console.log("init att val: ", iaVal);
        }

        if (initCombat === '0') { 
            // do nothing
        } else {
            let icString = initCombat.split(".")[1];
           // console.log("init com: ", icString);
            icVal = actor.system.combat_attributes[icString].rank;
           // console.log("init com val: ", actor, actor.system.combat_attributes[icString].rank);
        }



       

        let actorInitMods = actor.system.priority_roll.bd + actor.system.priority_roll.pd + actor.system.priority_roll.miscMod;
        let initExpr = `${(actorInitMods + diceModel.numberOfDice) + diceModel.baseDie}kh${diceModel.numberOfDice} + ${iaVal} + ${icVal}`;
        if(game.settings.get("ewhen", "allSettings").singleDieInit) {
            initExpr = `1d6 + ${iaVal} + ${icVal}`;
        }
        //console.warn("Init Expression: ", initExpr);
        let initiative = await new Roll(initExpr).evaluate()
        let initRoll = initiative.total;
        //console.log("INitExpr: ", initExpr);
        // console.log("InitRoll: ", initRoll);
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

      /* console.log("Dice Model (target): ", diceModel.tn);
      console.log("Dice Model (success): ", diceModel.success);
      console.log("Dice Model (failure): ", diceModel.failure); */

        if (isPC) {
            if(diceOnly >= diceModel.success) {
                // console.log("mighty success; initiative = 8");
                adjInit = 8;
            } else if (initRoll >= diceModel.tn && diceOnly < diceModel.success && diceOnly > diceModel.failure) {
                // console.log("regular success; initiative = 6");
                adjInit = 6;
            } else if (initRoll < diceModel.tn && diceOnly < diceModel.success && diceOnly > diceModel.failure) {
                // console.log("regular failure; initiative = 3");
                adjInit = 3;
            } else if (diceOnly <= diceModel.failure) {
                // console.log("calamitous failure, initiative = 1");
                adjInit = 1;
            }
        }

    //   console.log("Adj Init: ", adjInit);
      let returnVal = [adjInit, com]
    
      return returnVal;

    }

}
