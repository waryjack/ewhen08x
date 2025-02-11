import { getDiceModel } from '../diceModels.js';
import { EWBaseRoll } from "./EWBaseRoll.mjs";

/**
 * Main attribute, Combat, and Career Rolls
 * this class creates a default 2d6 roll first; 
 * when prompted, however, it creates a new instance
 * with the relevant selections from the prompt
 */
export class EWMCCRoll extends EWBaseRoll {
    /**
     * @param {bd,pd,att,com,car,diff,mod} selections object containing the selected info from the roll dialog
     * @param data roll data object
     * @param options roll options
     */
    constructor(formula = "2d6", data = {}, options = {}) {
        super(formula, data, options);
        foundry.utils.mergeObject(this.options, this.constructor.DEFAULT_OPTIONS, {
          insertKeys: true,
          insertValues: true,
          overwrite: false
        });

        this.options.dm = getDiceModel(game);
        formula = this._constructFormula(selections, data);
        this.options.displayName = this._getRollDisplayName(selections, data);
        this.options.displayDiff = this._getDiffDisplayName(selections, data);

    }

    _constructFormula(s, data) {
        let career = null;
        let keep = "";
        let numDice = 2;
        let baseDiff = 0;
        let totalMods = 0;
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

        // Determine difficulty modifier value
       
        switch (s.diff) {
            case "very_easy": baseDiff = 2; break;
            case "easy": baseDiff = 1; break;
            case "moderate": baseDiff = 0; break;
            case "hard": baseDiff = -1; break;
            case "tough": baseDiff = -2; break;
            case "demanding": baseDiff = -4; break;
            case "formidable": baseDiff = -6; break;
            case "heroic": baseDiff = -8; break;
        }

        totalMods = baseDiff + s.mod;

        let formula = `${numDice}${this.dm.baseDie}${keep} + ${attVal} + ${comVal} + ${carVal} + ${totalMods}`
        return formula;
    }

    _getRollDisplayName(s,data) {
      let displayName = "";
      let settings = game.settings.get("ewhen","allSettings");
      switch(att) {
        case "strength": displayName = settings.strName; break;
        case "agility": displayName = settings.agiName; break;
        case "mind": displayName = settings.minName; break;
        case "appeal": displayName = settings.appName; break;
        default: displayName = "Unknown";
       }

       // show the career roll name if it's a career roll
       if (s.car != "" && s.car != "none") {
                displayName = s.car
            }
       
            // put combat second; it's more important to know than career and you shouldn't use careers
            // normally in a combat roll anyhow
       if (combat != "none") {
        switch(combat) {
            case "melee": displayName = settings.melName;break;
            case "ranged": displayName = settings.ranName;break;
            case "initiative": displayName = settings.iniName;break;
            case "defense": displayName = settings.defName;break;
            default: displayName = "Unknown";
        }
       }

        return displayName;
    }

    _getDiffDisplayName(s,data) {
        return `EW.difficulty.${s.diff}`;
    }

    static async prompt(options = {}) {


    }
}

