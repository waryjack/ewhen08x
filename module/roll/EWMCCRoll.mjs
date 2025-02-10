import { getDiceModel } from '../diceModels.js';
import { EWBaseRoll } from "./EWBaseRoll.mjs";

/**
 * Main attribute, Combat, and Career Rolls
 */
export class EWMCCRoll extends EWBaseRoll {
    /**
     * @param {bd,pd,att,com,car,mod} selections object containing the selected info from the roll dialog
     * @param data roll data object
     * @param options roll options
     */

    constructor(selections, data = {}, options = {}){
        this.dm = getDiceModel(game);
        this.data = data;
        this.options = options;
        this.formula = this._constructFormula(selections, data)
        
        super(formula, data, options);

    }

    _constructFormula(s, data) {
        let career = null;
        let keep = "";
        let numDice = 2;
        
        let netExtraDice = Math.abs(s.bd - sel.pd);
        if(netExtraDice !== 0) {
            keep = (s.bd > s.pd) ? "kh2" : "kl2";
            numDice += netExtraDice;
        }
        
        let attVal = data.main_attributes[s.att].rank ?? 0;
        let comVal = data.combat_attributes[s.com].rank ?? 0;
        
        if (s.car != "none" && s.car != "") {
            career = this.actor.items
                .filter(item => item.type == "career")
                .find(item => item.name == s.car);
        }
        let carVal = career.system.rank ?? 0;

        let formula = `${numDice}${this.dm.baseDie}${keep} + ${attVal} + ${comVal} + ${carVal}`
        return formula;
    }
}