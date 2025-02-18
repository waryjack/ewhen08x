import { proper } from "../helpers.mjs";
import EWBaseRoll from "./baseroll.mjs"

/**
 * Main attribute, Combat, and Career Rolls
 * this class creates a default 2d6 roll first; 
 * when prompted, however, it creates a new instance
 * with the relevant selections from the prompt
 */
export default class EWMCCRoll extends EWBaseRoll {
    /**
     * @param data roll data object
     * @param options roll options
     */
    constructor(formula, data, options) {
        super(formula, data, options);

        // merges custom options into the "default options" of a roll
        foundry.utils.mergeObject(this.options, this.constructor.DEFAULT_OPTIONS, {
          insertKeys: true,
          insertValues: true,
          overwrite: false
        });

    }

    /**
     * Workhorse - prompts, collects, and builds a roll object to turn into chat data
     */

    static async prompt(options = {}) {
        
        // value checks for debugging
        console.warn("Roll Data: ", this.data);
        console.warn("Roll Options: ", this.options);
        // Gather rolldata, etc.
        let promptData = this._buildPromptData(options.stat, options.actorId);
        const content = await renderTemplate(CONFIG.ewhen.DIALOG_TYPE.TASK, promptData);
       
        
        const rollConfig = await foundry.applications.api.DialogV2.wait({
                window: { title: "EW.rolltype.basicroll"},
                content: content,
                classes: ["ew-dialog"],
                buttons: [{
                    action:"roll",
                    label:"Roll",
                    default:true,
                    callback: (event, button, dialog) => { return button.form.elements }
                },
                    {
                        action: "cancel",
                        label: "Cancel"
                }],
                submit: result => {
                    console.log("Roll dialog result: ", result);
                    if (result === "cancel") return;
                    return result;
                }
            });

        if (!rollConfig) return;

        // Construct formula and set up options object
        const fobj = this._prepareFormula(rollConfig, options.data, options.actorId, options.dm) ?? "2d6";
        options.att = rollConfig.pattr.value;
        options.com = rollConfig.cattr.value;
        options.car = rollConfig.career.value;
        options.attVal = fobj.attVal;
        options.comVal = fobj.comVal;
        options.carVal = fobj.carVal;
        options.diceonly = fobj.diceonly;
        options.mods = fobj.mods;
        options.hilo = fobj.hilo;
        options.actor = game.actors.get(this.actorId);
        options.diffDisplay = this._getDiffDisplay(rollConfig.difficulty.value); // localizes the selected difficulty
        options.rollDisplay = this._getRollDisplay(options.att, options.com, options.car); // returns what the roll is named in chat - Attribute, Combat, or Career (e.g. "Strength" or "Melee" of "Thief")
        
        const statroll = new this(fobj.formula, options.data, options)
        await statroll.evaluate();
        let outcome = this._getOutcome(statroll, options.dm) // returns success, failure, etc.
        let chatData = await this._prepareChatMessageContext(outcome, statroll) // builds context object
    
        await this._rollToChat(chatData);

    }

    static _prepareFormula(rollConfig, data, actorId, dm) {

        let carVal = 0;
        let attVal = 0;
        let comVal = 0;
        let nothing = ["none","","-"];
        let keep = "";
        let numDice = 2;
        let baseDiff = 0;
        let hilo = "";
        let netExtraDice = Math.abs(rollConfig.bdice.value - rollConfig.pdice.value);
        if(netExtraDice !== 0) {
            keep = (rollConfig.bdice.value > rollConfig.pdice.value) ? "kh2" : "kl2";
            numDice += netExtraDice;
        }
        
        attVal = data.main_attributes[rollConfig.pattr.value].rank ?? 0;
        comVal = (!nothing.includes(rollConfig.cattr.value)) ? data.combat_attributes[rollConfig.cattr.value].rank : 0;
        
        if (!nothing.includes(rollConfig.career.value)) {
            carVal = data.careers[rollConfig.career.value].rank;
        }

        // Determine difficulty modifier value
       
        baseDiff = CONFIG.ewhen.DIFF_VALUE[rollConfig.difficulty.value]

        let totalMods = baseDiff + Number(rollConfig.othermods.value);

        let formula = `${numDice}${dm.baseDie}${keep}+${attVal}+${comVal}+${carVal}+${totalMods}`
        
        switch(keep) {
            case "kh2": hilo = "H"; break;
            case "kl2": hilo = "L"; break;
            default: hilo = "";
        }
        
        let diceonly = `${numDice}${dm.baseDie}`;

        return {
            formula:formula,
            diceonly:diceonly,
            mods:totalMods,
            attVal:attVal,
            comVal:comVal,
            carVal:carVal,
            hilo:hilo
        }
    }

    static _getRollDisplay(att, com, car) {

      let settings = game.settings.get("ewhen","allSettings");

      let displayName = (car != "none" && car != "") ? car : (com != "none" && com != "") ? settings[com.substring(0,3)+"Name"] : settings[att.substring(0,3)+"Name"];

      return displayName;
    }

    static _getDiffDisplay(diff) {
        return game.i18n.localize(`EW.difficulty.${diff}`);
    }

    static _getOutcome(statroll) {
        console.log("Statroll created by prompt(): ", statroll);
        let outcome = "";
        let outcomeClass = "";
      
        let keptDice = statroll.terms[0].values;
    
        let total = statroll.total;
        let mightyThreshold = statroll.options.dm.tn + (Number(statroll.options.totalMods) < 0 ? Math.abs(Number(statroll.options.totalMods)) : 0);

        /*
        * Figure out the level of success; there are like 3 types of
        * critical success and frankly they're a bit of a pain
        */
            const diceTotal = keptDice.reduce((acc, value) => (acc + value), 0)
       
            // TODO: failure/success type based on dice model chosen
            if (diceTotal >= statroll.options.dm.success && mightyThreshold <= statroll.options.dm.success){
                outcome = "Mighty Success!";
                outcomeClass = "roll-mighty-sux";
            } else if (diceTotal >= statroll.options.dm.success) {
                outcome = "Automatic Success!";
                outcomeClass = "roll-auto-sux";
            } else if (diceTotal <= statroll.options.dm.failure) {
                outcome = "Automatic Failure!";
                outcomeClass = "roll-auto-fail";
            } else if (total >= statroll.options.dm.tn) {
                outcome = "Success!";
                outcomeClass = "roll-sux";
            } else if (total < statroll.options.dm.tn ) {
                outcome = "Failure!";
                outcomeClass = "roll-fail";
            }

        return {
            outcome: outcome,
            outcomeClass: outcomeClass
        }
    }

    static async _prepareChatMessageContext(data, statroll){
        // console.log("_prepareChatMessageContext options visible: ", this.ewroll, "\n", this.ewroll.options);
        const opts =  statroll.options;
        console.log("Opts: ", opts)
        const settings = game.settings.get("ewhen", "allSettings");

        let attStr = (opts.att != "none" && opts.att != "") ? ` + ${proper(settings[opts.att.substring(0,3)+"Name"])} (${opts.attVal})` : "";
        let comStr = (opts.com != "none" && opts.com != "") ? ` + ${proper(settings[opts.com.substring(0,3)+"Name"])} (${opts.comVal})` : "";
        let carStr = (opts.car != "none" && opts.com != "") ? ` + ${opts.car} (${opts.carVal})` : "";

        let rollTitle = `${opts.rollDisplay} ${game.i18n.localize("EW.rolltype.roll")}`;
        let rollBreakdown = `<p><strong>${opts.diceonly}${opts.hilo} ${attStr}${comStr}${carStr} + ${opts.mods} vs. TN ${opts.dm.tn}</strong></p><p style="font-size:0.85em;">Difficulty: ${game.i18n.localize(opts.diffDisplay)}</p>`;

        return {
            roll: statroll,
            breakdown: new Handlebars.SafeString(rollBreakdown),
            rollTitle: rollTitle,
            tooltip: new Handlebars.SafeString(await statroll.getTooltip()),
            outcome: data.outcome,
            outclass:data.outcomeClass,
            rollTotal: statroll.total,
            actorid: statroll.options.actor
        }
    }

    static _buildPromptData(attribute, actorId){
       
        let isCombat = false;
        let actor = game.actors.get(String(actorId));
        console.log("Prompt Build Actor: ", actor);
        let maPicked = "";
        let caPicked = "";
        let crPicked = "";
        let gameSettings = game.settings.get("ewhen","allSettings");
        let carSelect = {"none":"-"};

        let ma = ["strength", "agility", "mind", "appeal"];
        let ca = ["melee", "ranged", "defense", "initiative"];
        let cr = Object.keys(actor.system.careers);

        console.log("Career keys: ", cr);
        
        if(ca.includes(attribute)) {
            isCombat = true;
            caPicked = attribute;
            switch(caPicked) {
                case "melee": maPicked = gameSettings.meleeLink;break;
                case "ranged": maPicked = gameSettings.rangedLink;break;
                case "defense": maPicked = gameSettings.defenseLink;break;
                case "initiative": maPicked = gameSettings.initiativeLink;break;
                default: maPicked = "agility";
            }
        } else if (cr.includes(attribute)){
            crPicked = attribute;
            caPicked = "none";
            maPicked = "strength"; // default to strength
        } else {
            caPicked = "none";
            crPicked = "none";
            maPicked = attribute; // default to just the selected main attribute
        }

        Object.entries(actor.system.careers).forEach(([key, value]) => {
            console.log("key",key, "value", value);
            carSelect[key] = key;
        });

        console.log(carSelect);

        let priSelect = {
            "strength":proper(gameSettings.strName),
            "agility":proper(gameSettings.agiName),
            "mind":proper(gameSettings.minName),
            "appeal":proper(gameSettings.appName)
        }

        let comSelect = {
            "none":"-",
            "melee":proper(gameSettings.melName),
            "ranged":proper(gameSettings.ranName),
            "defense":proper(gameSettings.defName),
            "initiative":proper(gameSettings.iniName)
        }

        let diffSelect = {
            "very_easy":"EW.difficulty.very_easy",
            "easy": "EW.difficulty.easy",
            "moderate":"EW.difficulty.moderate",
            "hard":"EW.difficulty.hard",
            "tough":"EW.difficulty.tough",
            "demanding":"EW.difficulty.demanding",
            "formidable":"EW.difficulty.formidable",
            "heroic":"EW.difficulty.heroic"
        }


        let dialogData = {
            priSelect: priSelect,
            comSelect: comSelect,
            carSelect: carSelect,
            diffSelect: diffSelect,
            maPicked: maPicked,
            caPicked: caPicked,
            crPicked: crPicked,
            isCombat: isCombat,
            actor:actor,
            config:CONFIG.ewhen

        }
        console.log("DialogData (EWMCCRoll._buildPromptData): ", dialogData);
        return dialogData;

    }

    /* now located in superclass
    async _rollToChat(template, chatData) {
        console.log("rollToChat ewroll: ", this.ewroll);
        renderTemplate(template, chatData).then((msg)=>{
            ChatMessage.create({
                user: game.user._id,
                rolls: [chatData.roll],
                speaker: ChatMessage.getSpeaker(),
                content: msg
            });
            
        });
    }
    */
    
}

