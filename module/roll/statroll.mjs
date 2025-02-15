
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

    async prompt() {

        // value checks for debugging
        console.warn("Roll Data: ", this.data);
        console.warn("Roll Options: ", this.options);
        // Gather rolldata, etc.
        let promptData = this._buildPromptData(this.options.stat, this.options.actorId);
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

        if (!rollConfig) {
            throw new Error("Nothing in rollConfig");
        }

        // Construct formula and set up options object
        this._prepareFormula(rollConfig, this.data, this.options.actorId, this.options.dm);
        this.options.att = rollConfig.pattr.value;
        this.options.com = rollConfig.cattr.value;
        this.options.car = rollConfig.career.value;
        this.options.actor = game.actors.get(this.actorId);

        this._getDiffDisplay(rollConfig.difficulty.value); // localizes the selected difficulty
        this._getRollDisplay(this.options.att, this.options.com, this.options.car); // returns what the roll is named in chat - Attribute, Combat, or Career (e.g. "Strength" or "Melee" of "Thief")
        
        await this.evaluate();
        let outcome = this._getOutcome() // returns success, failure, etc.
        let chatData = await this._prepareChatMessageContext(outcome) // builds context object
    
        await this._rollToChat(chatData);

    }

    _prepareFormula(rollConfig, data, actorId, dm) {

        let carVal = 0;
        let keep = "";
        let numDice = 2;
        let baseDiff = 0;
        let netExtraDice = Math.abs(rollConfig.bdice.value - rollConfig.pdice.value);
        if(netExtraDice !== 0) {
            keep = (rollConfig.bdice.value > rollConfig.pdice.value) ? "kh2" : "kl2";
            numDice += netExtraDice;
        }
        
        this.options.attVal = data.main_attributes[rollConfig.pattr.value].rank ?? 0;
        this.options.comVal = (rollConfig.cattr.value != "none" && rollConfig.cattr.value != "") ? data.combat_attributes[rollConfig.cattr.value].rank : 0;
        
        if (rollConfig.career.value != "none" && rollConfig.career.value != "" && rollConfig.career.value != "-") {
            carVal = data.careers[rollConfig.career.value].rank;
        }

        // Determine difficulty modifier value
       
        baseDiff = rollConfig.difficulty.value;

        this.options.totalMods = baseDiff + Number(rollConfig.othermods.value);

        this.options.formula = `${numDice}${dm.baseDie}${keep}+${this.options.attVal}+${this.options.comVal}+${carVal}+${this.options.totalMods}`
        
        switch(keep) {
            case "kh2": this.options.hilo = "H"; break;
            case "kl2": this.options.hilo = "L"; break;
            default: this.options.hilo = "";
        }
        
        this.options.diceonly = `${numDice}${dm.baseDie}`;
    }

    _getRollDisplay(att, com, car) {

      let settings = game.settings.get("ewhen","allSettings");

      let displayName = (car != "none" && car != "") ? car : (com != "none" && com != "") ? settings[com.substring(0,3)+"Name"] : settings[att.substring(0,3)+"Name"];

       this.options.rollDisplay = displayName
    }

    _getDiffDisplay(diff) {
        this.options.diffDisplay = game.i18n.localize(`EW.difficulty.${diff}`);
    }

    _getOutcome() {
        let outcome = "";
        let outcomeClass = "";
      
        let keptDice = this.terms[0].values;
    
        let total = this.total;
        let mightyThreshold = this.options.dm.tn + (Number(this.options.totalMods) < 0 ? Math.abs(Number(this.options.totalMods)) : 0);

        /*
        * Figure out the level of success; there are like 3 types of
        * critical success and frankly they're a bit of a pain
        */
            const diceTotal = keptDice.reduce((acc, value) => (acc + value), 0)
       
            // TODO: failure/success type based on dice model chosen
            if (diceTotal >= this.options.dm.success && mightyThreshold <= this.options.dm.success){
                outcome = "Mighty Success!";
                outcomeClass = "roll-mighty-sux";
            } else if (diceTotal >= this.options.dm.success) {
                outcome = "Automatic Success!";
                outcomeClass = "roll-auto-sux";
            } else if (diceTotal <= this.options.dm.failure) {
                outcome = "Automatic Failure!";
                outcomeClass = "roll-auto-fail";
            } else if (total >= this.options.dm.tn) {
                outcome = "Success!";
                outcomeClass = "roll-sux";
            } else if (total < this.options.dm.tn ) {
                outcome = "Failure!";
                outcomeClass = "roll-fail";
            }

        return {
            outcome: outcome,
            outcomeClass: outcomeClass
        }
    }

    async _prepareChatMessageContext(data){
        // console.log("_prepareChatMessageContext options visible: ", this.ewroll, "\n", this.ewroll.options);
        const opts =  this.options;
        const settings = game.settings.get("ewhen", "allSettings");

        let attStr = (opts.att != "none" && opts.att != "") ? ` + ${this._proper(settings[opts.att.substring(0,3)+"Name"])} (${opts.attVal})}` : "";
        let comStr = (opts.com != "none" && opts.com != "") ? ` + ${this._proper(settings[opts.com.substring(0,3)+"Name"])} (${opts.attVal})}` : "";
        let carStr = (opts.car != "none" && opts.com != "") ? ` + ${opts.car} (${opts.carVal})}` : "";

        let rollTitle = `${opts.rollDisplay} ${game.i18n.localize("EW.rolltype.roll")}`;
        let rollBreakdown = `<p><strong>${opts.diceonly}${opts.hilo} ${attStr}${comStr}${carStr}
                            + ${opts.totalMods}</strong></p>
                            <p style="font-size:0.85em;">Difficulty: ${game.i18n.localize(opts.diffDisplay)}</p>`;

        return {
            roll: this,
            breakdown: new Handlebars.SafeString(rollBreakdown),
            rollTitle: rollTitle,
            tooltip: new Handlebars.SafeString(await this.getTooltip()),
            outcome: data.outcome,
            outclass:data.outcomeClass,
            rollTotal: this.total
        }
    }

    _buildPromptData(attribute, actorId){
       
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
            "strength":gameSettings.strName,
            "agility":gameSettings.agiName,
            "mind":gameSettings.minName,
            "appeal":gameSettings.appName
        }

        let comSelect = {
            "none":"-",
            "melee":game.settings.get("ewhen","allSettings").melName,
            "ranged":gameSettings.ranName,
            "defense":gameSettings.defName,
            "initiative":gameSettings.iniName
        }


        let dialogData = {
            priSelect: priSelect,
            comSelect: comSelect,
            carSelect: carSelect,
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

    _proper(content) {
        console.log(content);
        return content[0].toUpperCase() + content.substring(1);
    }
    
}

