This is overcomplicating the Roll. 

What matters is deriving the formula for the roll, so you can just create a new roll. No need for fancy prompting, just generate a basic Roll object with the formula and its default data. Then get it *back* and add in the actor shit, so you don't need to subclass roll at all.

Like so:

DocumentSheet Method: promptForRoll(rollType) { present dialog, gather roll configuration, call this.document._buildRoll with roll config}

Document method: 
// in Item and Actor, since weapon/armor/power rolls are Item rolls, while general stat rolls are Actor Rolls

this.system._buildRoll(type, rollData) { switch on roll type, call buildRoll in TypeDataModel, get roll parameters, new Roll(params).


DataModel method: _buildRoll(type, rollData) { returns }

alternatively - extend Roll for each type of roll (rather than the DrawSteel model that I only sorta understand :D ), and use that to prompt, evaluate, and display results - keep the roll implementations housed in the (whatever)Roll classes and out of the Documents, DataModels, and DocumentSheets. 

So a Roll subclass would basically be structured like this

EWBasicRoll extends foundry.api.Roll {
    constructor(formula = "2d6", data = {}, options = {}) {
        
        //do the mergeobject thing

        // 


        super(formula, data, options)

    }


    static async prompt() {
        // workhorse method
        // displays dialog
        // gathers information
        // sets all sorts of option things in this.options
        // calls methods to get display info, tooltips, formula, options, etc.
        this.options.formula = _prepareFormula();
        this.options.diffDisplay = _getDiffDisplay(diff); // localizes the selected difficulty
        this.options.rollDisplay = _getRollDisplayName(att,com,car); // returns what the roll is named in chat - Attribute, Combat, or Career (e.g. "Strength" or "Melee" of "Thief")
        
        this.ewroll = new this(formula, {}, this.options) --> might be necessary if this is a static method?
        await this.ewroll.evaluate() // will this work if I update the formula in by setting this.formula? Maybe

        outcome = _getOutcome() // returns success, failure, etc.
        chatData = await _createChatMessageContext(outcome) // builds context object
        await this._rollToChat(chatData);
        
    }

    _getOutcome() {
        figure out the type of success and return it
    }

    _getDiffDisplay() {
        return (localized)+difficulty
    }

    _getRollDisplayName(att,com,car) {
        // figure it out
        return rollName
    }

    async _prepareChatMessageContext(){
        return {
            roll: this.options.ewroll
            displayname: this.options.rollDisplay
            diffdisplay: this.options.diffDisplay
            formula: this.options.formula
            rollresult: this.options.ewroll.total
            outcome: this.options.outcome
            tooltip: await this.options.ewroll.getTooltip()
            attribute: this.att
            combat: this.com
            career: this.car
            totalmods: this.totalmods
        }
    }

    async _rollToChat(chatData) {
        renderTemplate(template, chatData).then((msg)=>{
            ChatMessage.create({
                user: game.user._id,
                roll: this,
                rolls: [this],
                //type:CONST.CHAT_MESSAGE_STYLES.ROLL,
                speaker: ChatMessage.getSpeaker(),
                content: msg
            });
            
        });
    }



}

Note: could do a lot of that in the constructor, so you don't have to do "new this"