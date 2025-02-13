import { getDiceModel } from "../diceModels.js";


/**
 * Main attribute, Combat, and Career Rolls
 * this class creates a default 2d6 roll first; 
 * when prompted, however, it creates a new instance
 * with the relevant selections from the prompt
 */
export default class EWMCCRoll extends foundry.dice.Roll {
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
        options.hilo = fParts.hilo;
        options.diceonly = fParts.diceonly;
        options.att = rollConfig.pattr.value;
        options.com = rollConfig.cattr.value;
        options.car = rollConfig.career.value;
        options.actor = game.actors.get(actorId);

        options.totalMods = fParts.mods;
        options.diffDisplay = this._getDiffDisplay(rollConfig.difficulty.value); // localizes the selected difficulty
        options.rollDisplay = this._getRollDisplay(rollConfig.pattr.value,rollConfig.cattr.value,rollConfig.career.value); // returns what the roll is named in chat - Attribute, Combat, or Career (e.g. "Strength" or "Melee" of "Thief")
        

        this.ewroll = new this(fParts.formula, rollData, options);
        await this.ewroll.evaluate() // will this work if I update the formula in by setting this.formula? Maybe

        let outcome = this._getOutcome() // returns success, failure, etc.
        let chatData = await this._prepareChatMessageContext(outcome) // builds context object
        console.log("Chatdata from _prepareChatMEssageContext: ", chatData);
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

        totalMods = baseDiff + Number(rollConfig.othermods.value);

        let formula = `${numDice}${dm.baseDie}${keep} + ${attVal} + ${comVal} + ${carVal} + ${totalMods}`
        let hilo = "";
        switch(keep) {
            case "kh2": hilo = "H"; break;
            case "kl2": hilo = "L"; break;
            default: hilo = "";
        }
            
        return {
            formula:formula ?? "2d6",
            attVal: attVal ?? 0,
            comVal: comVal ?? 0,
            carVal: carVal ?? 0,
            mods:totalMods ?? 0,
            diceonly:`${numDice}${dm.baseDie}`,
            hilo:hilo
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
        let total = this.ewroll.total;
        let mightyThreshold = this.ewroll.options.dm.tn + (Number(this.ewroll.options.totalMods) < 0 ? Math.abs(Number(this.ewroll.options.totalMods)) : 0);


        // console.warn("Roll Object: ", this.rollObj);
        /*
        * Figure out the level of success; there are like 3 types of
        * critical success and frankly they're a bit of a pain
        */
            const diceTotal = keptDice.reduce((acc, value) => (acc + value), 0)
            console.log("diceTotal: ", diceTotal);
            // TODO: failure/success type based on dice model chosen
            if (diceTotal >= this.ewroll.options.dm.success && mightyThreshold <= this.ewroll.options.dm.success){
                outcome = "Mighty Success!";
                outcomeClass = "roll-mighty-sux";
            } else if (diceTotal >= this.ewroll.options.dm.success) {
                outcome = "Automatic Success!";
                outcomeClass = "roll-auto-sux";
            } else if (diceTotal <= this.ewroll.options.dm.failure) {
                outcome = "Automatic Failure!";
                outcomeClass = "roll-auto-fail";
            } else if (total >= this.ewroll.options.dm.tn) {
                outcome = "Success!";
                outcomeClass = "roll-sux";
            } else if (total < this.ewroll.options.dm.tn ) {
                outcome = "Failure!";
                outcomeClass = "roll-fail";
            }

        return {
            outcome: outcome,
            outcomeClass: outcomeClass
        }
    }

    static async _prepareChatMessageContext(data){
        console.log("_prepareChatMessageContext options visible: ", this.ewroll, "\n", this.ewroll.options);
        const opts =  this.ewroll.options;
        const settings = game.settings.get("ewhen", "allSettings");
        let attStr = "";
        let comStr = "";
        let carStr = "";
        switch(opts.att) {
            case "strength":attStr = `+ ${this._proper(settings.strName)} (${opts.attVal}) `;break;
            case "agility":attName = `+ ${this._proper(settings.agiName)} (${opts.attVal}) `;break;
            case "mind": attName = `+ ${this._proper(settings.minName)} + (${opts.attVal}) `;break;
            case "appeal": attName = `+ ${this._proper(settings.appName)} + (${opts.attVal}) `;break
        }
        switch(opts.com){
            case "melee":comName = `+ ${this._proper(settings.melName)} (${opts.comVal}) `;break;
            case "ranged":comName = `+ ${this._proper(settings.ranName)} (${opts.comVal}) `;break;
            case "defense":comName = `+ ${this._proper(settings.defName)} (${opts.comVal}) `;break;
            case "initiative":comName = `+ ${this._proper(settings.iniName)} (${opts.comVal}) `;break;
        }
        if(opts.car != "none" && opts.career != "") {
            carName = `+ ${this._proper(career)} (${opts.carVal}) `;
        }
        let rollTitle = `${opts.rollDisplay} ${game.i18n.localize("EW.rolltype.roll")}`;
        let rollBreakdown = `<p><strong>${opts.diceonly}${opts.hilo} ${attStr}${comStr}${carStr}
                            + ${opts.totalMods}</strong></p><p style="font-size:0.85em;">Difficulty: ${game.i18n.localize(opts.diffDisplay)}</p>`;

        return {
            roll: this.ewroll,
            breakdown: new Handlebars.SafeString(rollBreakdown),
            rollTitle: rollTitle,
            tooltip: new Handlebars.SafeString(await this.ewroll.getTooltip()),
            outcome: data.outcome,
            outclass:data.outcomeClass,
            rollTotal: this.ewroll.total
        }
                        
        return {
            actor:this.ewroll.options.actor,
            roll: this.ewroll,
            displayName: this.ewroll.options.rollDisplay,
            diffStr: this.ewroll.options.diffDisplay,
            formula: this.ewroll.formula,
            rollTotal: this.ewroll.total,
            outcome: data.outcome,
            outclass:data.outcomeClass,
            tooltip: new Handlebars.SafeString(await this.ewroll.getTooltip()),
            attribute: this.ewroll.options.att,
            combat: this.ewroll.options.com,
            career: this.ewroll.options.car,
            attVal: this.ewroll.options.attVal,
            comVal: this.ewroll.options.comVal,
            carVal: this.ewroll.options.carVal,
            mods: this.ewroll.options.totalMods,
            diceonly: this.ewroll.options.diceonly,
            hilo: this.ewroll.options.hilo
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
        let gameSettings = game.settings.get("ewhen","allSettings");

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

    static _proper(content) {
        console.log(content);
        return content[0].toUpperCase() + content.substring(1);
    }
    
}

