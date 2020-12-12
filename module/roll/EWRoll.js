export class EWRoll {

    rollInfo = {};
    actor={};
    roll={};
    rollObj={};

    constructor(data){
        // console.log("Constructor data: ", data);
        this.html = data.html;
        this.actor = data.actor;

        this.compileRollInfo();
       //  console.log("This.actor: ", this.actor, "This.html: ", this.html);
    }

    compileRollInfo() {
        console.log("EWRoll's html: ", this.html);
        var attrVal = 0;
        var comVal = 0;
        var cVal = 0;

        let attr = this.html.find("#pattr").val().toLowerCase();
        let combat = this.html.find("#cattr").val().toLowerCase();
        let bonus = this.html.find("#bonus").val();
        let penalty = this.html.find("#penalty").val();
        let careerName = this.html.find("#career").val();
        let bdNum = this.html.find("#bdice").val();
        let bdSuffix = "";
        let dice = "2d6";
       
       if (careerName != "none") {
            let careers = this.actor.data.items.filter(function(item) {return item.type == "career"});
            // console.log("Career Items: ", careers);
            let thisCareer = careers.filter(function(item) { return item.name == careerName});

            let itemId = thisCareer[0]._id;
       
            cVal = this.actor.getOwnedItem(itemId).data.data.rank;

       }

       bdNum == "None" ? dice = dice : dice = (Number(bdNum) + 2) + "d6kh2";
       let totalMods = Number(bonus) - Number(penalty);
       attr == "none" ? attrVal = 0 : attrVal = this.actor.data.data.main_attributes[attr].rank;
       combat == "none" ? comVal = 0 : comVal = this.actor.data.data.combat_attributes[combat].rank;
        // carVal = item.rank;
        // console.log("Attr, Combat, Career: " + attrVal, comVal, cVal);

       let rollExpr = dice + "+" + attrVal + "+" + comVal + "+" + cVal + "+" + totalMods;

       let rollInfo = {
           expr: rollExpr,
           chosenAttribute: attr,
           chosenCombat: combat,
           chosenCareer: careerName,
           attrVal: attrVal,
           comVal: comVal,
           cVal: cVal,
           bonus: bonus,
           penalty: penalty,
           mods: totalMods,
           bdNum: bdNum,
           tt:""
       }
       console.log(rollInfo);
       this.rollInfo = rollInfo;

    }

    roll() {
        var tip;
        // this.assembleRollInfo();
        let r = new Roll(this.rollInfo.expr);
        r.evaluate();
        this.rollObj = r;

    }

    toMessage(tt) {
        var outcome = "";
        var outcomeClass = "";  
        
        let keptDice = this.rollObj.terms[0].values;
        let total = this.rollObj.total;
        let mightyThreshold = 9 + Number(this.rollInfo.penalty);

     
        
        if (keptDice[0]==6 && keptDice[1]==6 && mightyThreshold <= 12){
            outcome = "Mighty Success!";
            outcomeClass = "roll-mighty-sux";
        } else if (keptDice[0] == 6 && keptDice[1]==6) {
            outcome = "Automatic Success!";
            outcomeClass = "roll-auto-sux";
        } else if (keptDice[0]==1 && keptDice[1]==1) {
            outcome = "Automatic Failure!";
            outcomeClass = "roll-auto-fail";
        } else if (total >= 9) {
            outcome = "Success!";
            outcomeClass = "roll-sux";
        } else if (total < 9 ) {
            outcome = "Failure!";
            outcomeClass = "roll-fail";
        }

        let chatData = {
            roll: this.rollObj,
            tooltip: new Handlebars.SafeString(tt),
            d: this.rollInfo,
            outcome: outcome,
            outclass: outcomeClass
        }

        renderTemplate('systems/ewhen/templates/roll/EWRollMessage.hbs', chatData).then((msg)=>{
            ChatMessage.create({
                user: game.user._id,
                type:CONST.CHAT_MESSAGE_TYPES.ROLL,
                speaker: ChatMessage.getSpeaker(),
                content: msg
            });
            


        });
        

    }

    get rollObject() {
        return this.rollObj;
    }

     
}