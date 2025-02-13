import { getDiceModel } from "../diceModels.js";

/**
 * Main attribute, Combat, and Career Rolls
 * this class creates a default 2d6 roll first; 
 * when prompted, however, it creates a new instance
 * with the relevant selections from the prompt
 */
export class EWMCCRoll extends foundry.dice.Roll {
    /**
     * @param data roll data object
     * @param options roll options
     */
    constructor(formula = "2d6", data, options) {
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

    static async prompt(rollData, options, actorId) {

        console.log("Prompt data");
        console.log("rollData: ", rollData);
        console.log("options: ", options);
        console.log("actorId: ", actorId);

        // Gather rolldata, etc.
        let promptData = this._buildPromptData(options.chosenStat, actorId);
        let content = await renderTemplate(CONFIG.ewhen.DIALOG_TYPE.TASK, promptData);
        
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
        options.dm = getDiceModel(game);
        let fParts = this._prepareFormula(rollConfig, rollData, actorId, options.dm);
        options.attVal = fParts.attVal;
        options.comVal = fParts.comVal;
        options.carVal = fParts.carVal;
        options.att = rollConfig.pattr;
        options.com = rollConfig.cattr;
        options.car = rollConfig.career;

        options.totalMods = fParts.mods;
        options.diffDisplay = this._getDiffDisplay(rollConfig.difficulty); // localizes the selected difficulty
        options.rollDisplay = this._getRollDisplay(rollConfig.pattr,rollConfig.cattr,rollConfig.career); // returns what the roll is named in chat - Attribute, Combat, or Career (e.g. "Strength" or "Melee" of "Thief")
        

        this.ewroll = new this(fParts.formula, rollData, options);
        await this.ewroll.evaluate() // will this work if I update the formula in by setting this.formula? Maybe

        let outcome = this._getOutcome() // returns success, failure, etc.
        chatData = await this._prepareChatMessageContext(outcome) // builds context object
        await this._rollToChat(CONFIG.ewhen.MESSAGE_TYPE.TASK, chatData);

    }

    static _prepareFormula(rollConfig, data, actorId, dm) {
        console.log("RollConfig in prepareFormula: ", rollConfig);
        console.log("Rollconfig.pattr: ", rollConfig.pattr.value);
        console.log("Rollconfig.cattr: ", rollConfig.cattr.value);
        console.log("Rollconfig.career: ", rollConfig.career.value);
        console.log("RollData from actor: ", data);
        let actor = game.actors.get(actorId);
        let career = null;
        let carVal = 0;
        let keep = "";
        let numDice = 2;
        let baseDiff = 0;
        let totalMods = 0;
        let netExtraDice = Math.abs(rollConfig.bdice.value - rollConfig.pdice.value);
        if(netExtraDice !== 0) {
            keep = (rollConfig.bdice.value > rollConfig.pdice.value) ? "kh2" : "kl2";
            numDice += netExtraDice;
        }
        
        let attVal = data.main_attributes[rollConfig.pattr.value].rank ?? 0;
        let comVal = rollConfig.cattr.value != "none" ? data.combat_attributes[rollConfig.cattr.value].rank : 0;
        
        if (rollConfig.career.value != "none" && rollConfig.career.value != "") {
            career = actor.items
                .filter(item => item.type == "career")
                .find(item => item.name == rollConfig.career.value);
            carVal = career.system.rank
        }

        // Determine difficulty modifier value
       
        switch (rollConfig.difficulty.value) {
            case "very_easy": baseDiff = 2; break;
            case "easy": baseDiff = 1; break;
            case "moderate": baseDiff = 0; break;
            case "hard": baseDiff = -1; break;
            case "tough": baseDiff = -2; break;
            case "demanding": baseDiff = -4; break;
            case "formidable": baseDiff = -6; break;
            case "heroic": baseDiff = -8; break;
        }

        totalMods = baseDiff + rollConfig.othermods.value;

        let formula = `${numDice}${dm.baseDie}${keep} + ${attVal} + ${comVal} + ${carVal} + ${totalMods}`

        return {
            formula:formula ?? "2d6",
            attVal: attVal ?? 0,
            comVal: comVal ?? 0,
            carVal: carVal ?? 0,
            mods:totalMods ?? 0
        }
    }

    static _getRollDisplay(att, com, car) {
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
       if (car != "" && car != "none") {
                displayName = car
            }
       
            // put combat second; it's more important to know than career and you shouldn't use careers
            // normally in a combat roll anyhow
       if (com != "none") {
        switch(com) {
            case "melee": displayName = settings.melName;break;
            case "ranged": displayName = settings.ranName;break;
            case "initiative": displayName = settings.iniName;break;
            case "defense": displayName = settings.defName;break;
            default: displayName = "Unknown";
        }
       }
        return displayName;
    }

    static _getDiffDisplay(diff) {
        return `EW.difficulty.${diff}`;
    }

    static _getOutcome() {

        let outcome = "";
        let outcomeClass = "";
        console.log("Roll: ", this.ewroll);
        let keptDice = this.ewroll.terms[0].values;
        console.warn("KeptDice: ", keptDice);
        let total = this.total;
        let mightyThreshold = this.options.dm.tn + (Number(this.options.totalMods) < 0 ? Math.abs(Number(this.options.totalMods)) : 0);


        // console.warn("Roll Object: ", this.rollObj);
        /*
        * Figure out the level of success; there are like 3 types of
        * critical success and frankly they're a bit of a pain
        */
            const diceTotal = keptDice.reduce((acc, value) => (acc + value), 0)
            console.log("diceTotal: ", diceTotal);
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

    static async _prepareChatMessageContext(data){
        return {
            actor:this.options.actor,
            roll: this,
            displayname: this.options.rollDisplay,
            diffStr: this.options.diffDisplay,
            formula: this.options.formula,
            rollTotal: this.total,
            outcome: data.outcome,
            outclass:data.outcomeClass,
            tooltip: await this.options.ewroll.getTooltip(),
            attribute: this.att,
            combat: this.com,
            career: this.car,
            attVal: this.attVal,
            comVal: this.comVal,
            carVal: this.carVal,
            mods: this.totalmods
        }
    }

    static _buildPromptData(attribute, actorId){
        console.log("In buildPrompt method with attribute ", attribute, " and actorId ", actorId);
        let isCombat = false;
        let actor = game.actors.get(String(actorId));
        console.log("Prompt Build Actor: ", actor);
        let maPicked = "";
        let caPicked = "";
        let cr = actor.items.filter(item => {return item.type == "career"});

        let ma = ["strength", "agility", "mind", "appeal"];
        let ca = ["melee", "ranged", "defense", "initiative"];
        
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
        } else {
           
            caPicked = "none";
            maPicked = attribute;
        }

        let priSelect = {
            "strength":game.settings.get("ewhen","allSettings").strName,
            "agility":game.settings.get("ewhen", "allSettings").agiName,
            "mind":game.settings.get("ewhen", "allSettings").minName,
            "appeal":game.settings.get("ewhen", "allSettings").appName
        }

        let comSelect = {
            "none":"-",
            "melee":game.settings.get("ewhen","allSettings").melName,
            "ranged":game.settings.get("ewhen","allSettings").ranName,
            "defense":game.settings.get("ewhen", "allSettings").defName,
            "initiative":game.settings.get("ewhen","allSettings").iniName
        }


        let dialogData = {
            primary: ma,
            priSelect: priSelect,
            combat: ca,
            comSelect: comSelect,
            careers: cr,
            maPicked: maPicked,
            caPicked: caPicked,
            attr: "",
            attr2: "",
            isCombat: isCombat,
            item: {},
            actor:actor,
            config:CONFIG.ewhen

        }
        console.log("DialogData (EWMCCRoll._buildPromptData): ", dialogData);
        return dialogData;

      
                
        
    }

    static async _rollToChat(template, chatData) {
        renderTemplate(template, chatData).then((msg)=>{
            ChatMessage.create({
                user: game.user._id,
                roll: this,
                rolls: [this],
                speaker: ChatMessage.getSpeaker(),
                content: msg
            });
            
        });
    }
    
}