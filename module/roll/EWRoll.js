/**
* Not sure whether this should ultimately extend Roll,
* or stand alone. It *uses* Roll, but I could extend it and
* remove the "rollDice()" method it seems. Maybe later; it's
* functional at the moment, if clumsy.
*/

import { EWMessageHelper } from "../interaction/EWMessageHelper.js";

import { getDiceModel } from '../diceModels.js'

export class EWRoll {

    rollInfo = {};
    actor={};
    roll={};
    rollObj={};
    result; // for testing
    html;
    isDamage;
    item;
    actor;

    /**
    *
    * @param data - object including submitted HTML from dialog,
    *               actor making the roll, whether it's
    *               a damage roll, and what weapon is being
    *               rolled.
    */
    constructor(data){

        console.log("Data: ", data);
        this.html = data.html;
        this.actor = data.actor;
        this.isDamage = data.isDamage;
        this.item = data.item;
        this.result = 0;


        if(this.isDamage){
            this.compileDamageRollInfo();
        } else if (this.item.type == "armor") {
            this.compileArmorRollInfo();
        } else {
            this.compileRollInfo();
        }
       //  console.log("This.actor: ", this.actor, "This.html: ", this.html);
    }

    /**
    *  Uses the html from the dialog to build the roll expression
    *  Ungainly and awkward, like a 13-year-old
    */
    compileRollInfo() {
        var attrVal = 0;
        var comVal = 0;
        var cVal = 0;
        let bdNum = 0;
        let pdNum = 0;
        let totalDiceMods = 0;
        let baseDiff = 0;


        let attr = this.html.find("#pattr").val().toLowerCase();
        let combat = this.html.find("#cattr").val().toLowerCase();
        let othermods = this.html.find("#othermods").val();
        let difflevel = this.html.find("#difficulty").val();
        let careerName = this.html.find("#career").val();

        /*
        *  Figure out actual roll based on penalty / bonus dice
        *  Bonus dice cancel penalties, so the net amount is determined
        *  Then that tells us whether diceSuffix is kh2 or kl2
        */

        bdNum = Number(this.html.find("#bdice").val());
        pdNum = Number(this.html.find("#pdice").val());
        const diceModel = getDiceModel(game)
        totalDiceMods = bdNum - pdNum;
        const diceSuffix = totalDiceMods > 0 ? `kh${diceModel.numberOfDice}` : `kl${diceModel.numberOfDice}`;

        let dice = `${diceModel.numberOfDice}${diceModel.baseDie}`
        if (totalDiceMods != 0) {
            let diceCount = Math.abs(totalDiceMods) + diceModel.numberOfDice;
            dice = diceCount + diceModel.baseDie + diceSuffix;
        }

        /*
        * If a career is involved, get its rank
        */

       if (careerName != "none") {
            let career = this.actor.items
                .filter(item => item.type == "career")
                .find(item => item.name == careerName);

            if (career) {
                let itemId = career._id;
                // console.warn("EWRoll career item object: ", this.actor.items.get(itemId));
                cVal = this.actor.items.get(itemId).system.rank;
                // console.warn("EWRoll cVal: ", cVal);
            }
       }

       /*
       * Get the base difficulty modifier
       */
       switch (difflevel) {
           case "very_easy": baseDiff = 2; break;
           case "easy": baseDiff = 1; break;
           case "moderate": baseDiff = 0; break;
           case "hard": baseDiff = -1; break;
           case "tough": baseDiff = -2; break;
           case "demanding": baseDiff = -4; break;
           case "formidable": baseDiff = -6; break;
           case "heroic": baseDiff = -8; break;
       };

       let diffStr = "EW.difficulty."+difflevel;
       // console.warn("diffStr", diffStr);

       /*
       * Get the other difficulty modifier; needs streamlining
       */

       let totalMods = baseDiff + Number(othermods);
       attrVal = attr == "none" ? 0 : this.actor.system.main_attributes[attr].rank;
       comVal = combat == "none" ? 0 : this.actor.system.combat_attributes[combat].rank;

       let rollExpr = dice + "+" + attrVal + "+" + comVal + "+" + cVal + "+" + totalMods;

       /*
       * Stash the data in the object; this is probably extreme overkill
       * but this class also generates the roll message (maybe refactor that later?)
       */

       let rollInfo = {
           expr: rollExpr,
           chosenAttribute: attr,
           chosenCombat: combat,
           chosenCareer: careerName,
           attrVal: attrVal,
           comVal: comVal,
           cVal: cVal,
           diffStr: diffStr,
           mods: totalMods,
           bdNum: bdNum,
           pdNum: pdNum,
           tt:""
       }
       console.log(rollInfo);
       this.rollInfo = rollInfo;

    }

    /**
     * Compiles the roll for an armor item
     */
    compileArmorRollInfo() {
        let armorData = this.item.system;

        let expr = armorData.protection.variable;

        let armorbonus = this.actor.system.armorbonus + this.actor.system.miscarmor;

        expr = expr + "+" + armorbonus;

        console.log("armorbonus, expr", armorbonus, expr);

        let rollInfo = {
            expr: expr,
            tt:""
        }

        this.rollInfo = rollInfo;

    }

    /**
    * Compiles the damage roll from the weapon data and associated stats
    */
    compileDamageRollInfo(){

        console.log("Weapon item: ", this.item);
        var bonus = 0;
        var penalty = 0;
        var scaledDmg = "0";
        var bdNum = 0;
        var pdNum = 0;
        var friendlyDmgExtension = "";
        var attBonus = 0;

        // Weapon / item details
        let wpnName = this.item.name;
        console.log("wpn name: ", wpnName);

        let wpnImg = this.item.img;

        bonus = this.html.find("#bonus").val();
        penalty = this.html.find("#penalty").val();
        scaledDmg = this.html.find("#scaled-damage").val();
        let wpnDmg = scaledDmg == "0" ? this.item.system.damage.dice : scaledDmg;
        let dmgMod = this.item.system.damage.mod || 0
        let wpnAttrib = this.item.system.damage.add_attribute;
        let wpnHalfAtt = this.item.system.damage.half_attribute;

        let totalMods = bonus - penalty + dmgMod;

       // console.warn("ScaledDmg / WpnDmg: ", scaledDmg, wpnDmg);

        if(wpnAttrib != "none") {
            attBonus = this.actor.system.main_attributes[wpnAttrib].rank;
            attBonus = wpnHalfAtt ? Math.floor(attBonus/2) : attBonus;

            let properAttrib = wpnAttrib[0].toUpperCase() + wpnAttrib.substring(1,3);
            friendlyDmgExtension = ` + ${wpnHalfAtt ? '1/2' : ''}${properAttrib} (${attBonus})`
        }
        if (totalMods > 0) friendlyDmgExtension += ` + ${totalMods}`
        else if (totalMods < 0) friendlyDmgExtension += ` - ${Math.abs(totalMods)}`

       // Not handling weapon bonus/penalty dice right now

        // bdNum = Number(this.html.find("#bdice").val());
       // pdNum = Number(this.html.find("#pdice").val());



        let dmgExpr = wpnDmg + "+" + attBonus + (totalMods < 0 ? totalMods : `+${totalMods}`);
        // console.warn("Compiled formula: ", dmgExpr);

        let rollInfo = {
            friendlyExt: friendlyDmgExtension,
            expr: dmgExpr,
            bonus: bonus,
            penalty: penalty,
            mods: totalMods,
            bdNum: bdNum,
            pdNum: pdNum,
            tt:"",
            wpnName: wpnName,
            wpnImg: wpnImg,
            wpnDmg: wpnDmg
        }


        this.rollInfo = rollInfo;

    }

    /*
    * Instantiates a new Roll to do the actual dice rolling,
    * no need to reinvent the wheel there
    */

    rollDice() {
        let expr = this.rollInfo.expr;
        const diceModel = getDiceModel(game)
        expr = expr == "none" ? `0${diceModel.baseDie}` : expr;
        let res = {};
        let r = new Roll(expr);
        this.rollObj = r;
        this.rollObj.evaluate().then((outcome) => res = outcome);
        // console.warn("Roll result: ", r.total);
        this.result = res.total;

    }

    /**
    * @param tt - the generated tooltip for the dice roll
    *             it will be put in a show/hide div in the actual
    *             message
    * @param isDamage - boolean indicating if we should use the damage roll template or regular roll template
    */

    createChatMessage(tt, isDamage) {
        const diceModel = getDiceModel(game)

        var outcome = "";
        var outcomeClass = "";

        let keptDice = this.rollObj.terms[0].values;
        let total = this.rollObj.total;
        let mightyThreshold = diceModel.tn + (Number(this.rollInfo.mods) < 0 ? Math.abs(Number(this.rollInfo.mods)) : 0);

        // console.warn("mightThreshold", mightyThreshold);


        // console.warn("Roll Object: ", this.rollObj);
        /*
        * Figure out the level of success; there are like 3 types of
        * critical success and frankly they're a bit of a pain
        */
        if(isDamage) {
            let chatData = {
                roll: this.rollObj,
                rollTotal: this.result,
                tooltip: new Handlebars.SafeString(tt),
                d: this.rollInfo,
                outcome: "",
                outclass: "roll-sux",
                actor:this.actor._id
            }

            EWMessageHelper.generateMessage(CONFIG.ewhen.MESSAGE_TYPE.DAMAGE, chatData);

        } else {
            const diceTotal = keptDice.reduce((acc, value) => (acc + value), 0)
            // TODO: failure/success type based on dice model chosen
            if (diceTotal >= diceModel.success && mightyThreshold <= diceModel.success){
                outcome = "Mighty Success!";
                outcomeClass = "roll-mighty-sux";
            } else if (diceTotal >= diceModel.success) {
                outcome = "Automatic Success!";
                outcomeClass = "roll-auto-sux";
            } else if (diceTotal <= diceModel.failure) {
                outcome = "Automatic Failure!";
                outcomeClass = "roll-auto-fail";
            } else if (total >= diceModel.tn) {
                outcome = "Success!";
                outcomeClass = "roll-sux";
            } else if (total < diceModel.tn ) {
                outcome = "Failure!";
                outcomeClass = "roll-fail";
            }

            let chatData = {
                roll: this.rollObj,
                rollTotal: this.result,
                tooltip: new Handlebars.SafeString(tt),
                d: this.rollInfo,
                outcome: outcome,
                outclass: outcomeClass,
                actor:this.actor._id
            }

            EWMessageHelper.generateMessage(CONFIG.ewhen.MESSAGE_TYPE.TASK, chatData);
        }

    }

    /**
    * @param tt - tooltip for display in chat message
    *
    * If I was smarter and more patient, I'd figure out
    * how to combine this with the createChatMessage()
    * method. But I am a simple and impatient man.


    createDamageMessage(tt) {

        let chatData = {
            roll: this.rollObj,
            tooltip: new Handlebars.SafeString(tt),
            d: this.rollInfo,
            outcome: "",
            outclass: "roll-sux",
            actor:this.actor._id
        }

       // console.log("D mods: ", chatData.d.mods);

       EWMessageHelper.generateMessage(CONFIG.ewhen.MESSAGE_TYPE.DAMAGE, chatData);

    } */

    createArmorMessage(tt) {
        let chatData = {
            roll: this.rollObj,
            rollTotal: this.result,
            tooltip: new Handlebars.SafeString(tt),
            outclass: "roll-sux",
            name: this.item.name,
            img: this.item.img,
            protection: this.item.system.protection.variable,
            armorbonus: this.actor.system.armorbonus,
            actor: this.actor._id
        }

        EWMessageHelper.generateMessage(CONFIG.ewhen.MESSAGE_TYPE.ARMOR, chatData);

    }

}


