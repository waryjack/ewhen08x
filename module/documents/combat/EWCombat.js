import { getDiceModel } from "../../diceModels.js";

export class EWCombat extends Combat {

    constructor(...args) {
        super(...args);
    }

    SETTINGS = game.settings.get("ewhen", "allSettings");

    /**
     * @override
     */

    startCombat() {
       // let updateDiffs = new Array();
        if(this.SETTINGS.priority) {
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
     * When priority roll is active, Rivals, Rabble, and Toughs don't roll initiative
     */

    rollAll() {

        if (this.SETTINGS.priority) {
            return;
        }

        super.rollAll();
    }

    /**
     * @override
     */

    rollNPC() {
        if (this.SETTINGS.priority) {
            return;
        }

        super.rollNPC();
    }

    /**
     * @override
     */
    rollInitiative(ids,options){
        const dm = getDiceModel(game);

        if(ids.length == 1){
            // this is rerolling a single person in the list. we want to snuff it if it's a nonPC
            let actor = this.combatants.get(ids[0]).token.actor;

            if(actor.type === "hero"){
                let initAttribute = this.SETTINGS.initAttribute;
                let initCombat = this.SETTINGS.initCombat;
                let initFormula = `${dm.numberOfDice + dm.baseDie}kh${dm.numberOfDice} + ${initAttribute} + ${initCombat}`
                
                if(this.SETTINGS.singleDieInit) {
                        initFormula = `1d6 + ${initAttribute} + ${initCombat}`
                }
                super.rollInitiative(ids,{formula:initFormula});
            } 
        } else {
            super.rollInitiative(ids, options)
        }
    }

     /**
     * @override
     */
    nextRound(){
        super.nextRound();
        if(!this.SETTINGS.rerollPerRound) { return; }
        let rrlist = new Array();
        const dm = getDiceModel(game);
        if(this.SETTINGS.priority) {
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
            
            let initAttribute = this.SETTINGS.initAttribute;
            let initCombat = this.SETTINGS.initCombat;
           
            let cimd = 0;
            for (let c of this.combatants) {
                rrlist.push(c.id);
                /*cibd = c.actor.system.priority_roll.bd;
                cipd = c.actor.system.priority_roll.pd;
                cimd = c.actor.system.priority_roll.md;*/
            }
           // let tInitDiceMods = cibd + cipd + cimd;

           let initFormula = `${dm.numberOfDice + dm.baseDie}kh${dm.numberOfDice} + ${initAttribute} + ${initCombat}`

           if(this.SETTINGS.singleDieInit) {
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

        if(this.SETTINGS.priority === false) { return; }
        const dm = getDiceModel(game);
        let adjInit = 0;
      
        let actor = com.token.actor;
   
        // get initiative expression mods
        let initAttribute = this.SETTINGS.initAttribute;
        let initCombat = this.SETTINGS.initCombat;

        // couple dummy variables for building the initiative expression below
        let iaVal = 0;
        let icVal = 0;
       
        // get the actual values to insert into the roll expression, since they don't appear to interpret the macro shorthand
        // example @combat_attributes.melee.rank, main_attributes.strength.rank; 0 is none selected
        iaVal = actor.system.main_attributes[initAttribute.split(".")[1]].rank;   
        icVal = actor.system.combat_attributes[initCombat.split(".")[1]].rank;
    
        let actorInitMods = actor.system.priority_roll.bd + actor.system.priority_roll.pd + actor.system.priority_roll.miscMod;
        let initExpr = `${(actorInitMods + dm.numberOfDice) + dm.baseDie}kh${dm.numberOfDice} + ${iaVal} + ${icVal}`;
        
        if(this.SETTINGS.singleDieInit) {
            initExpr = `1d6 + ${iaVal} + ${icVal}`;
        }
     
        let initiative = await new Roll(initExpr).evaluate()
        let initRoll = initiative.total;

        let mnd = actor.getAttribute("mind").rank;
        let ini = actor.getAttribute("initiative").rank;
        let diceOnly = initRoll - mnd - ini;

        if (actor.type === "hero") {
            if(diceOnly >= dm.success) {
                // console.log("mighty success; initiative = 8");
                adjInit = 8;
            } else if (initRoll >= dm.tn && diceOnly < dm.success && diceOnly > dm.failure) {
                // console.log("regular success; initiative = 6");
                adjInit = 6;
            } else if (initRoll < dm.tn && diceOnly < dm.success && diceOnly > dm.failure) {
                // console.log("regular failure; initiative = 3");
                adjInit = 3;
            } else if (diceOnly <= dm.failure) {
                // console.log("calamitous failure, initiative = 1");
                adjInit = 1;
            }
        } else {
            adjInit = actor.system.priority;
        }

      let returnVal = [adjInit, com]
    
      return returnVal;

    }

    get SETTINGS() {
        return this.SETTINGS
    }

}
