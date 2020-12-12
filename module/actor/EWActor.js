import { EWRoll } from "../roll/EWRoll.js";

export class EWActor extends Actor {

  // @override
  prepareBaseData(){
        super.prepareBaseData();
        console.log(this.data);
   
        const actorData = this.data;
        const data = actorData.data;
        const flags = actorData.flags;
        
        if (actorData.type === 'character') this._prepareCharacterData(actorData);
        else if (actorData.type === 'vehicle') this._prepareVehicleData(data);
    }

    _prepareCharacterData(actorData) {
        super.prepareDerivedData();
        const data = actorData.data;

        var str = data.main_attributes.strength.rank;
        var mnd = data.main_attributes.mind.rank;

        console.log("Stat pulls: ", str, mnd);
        data.resources.lifeblood.max = Number(str) + 10;
        console.log("LB Max", data.resources.lifeblood.max);
        data.resources.resolve.max = Number(mnd) + 10;
       
        if (data.resources.lifeblood.current == 0 
            && data.resources.lifeblood.fatigue == 0
             && data.resources.lifeblood.regular == 0 
             && data.resources.lifeblood.lasting == 0) {
            
                data.resources.lifeblood.current = data.resources.lifeblood.max;
        }
        if (data.resources.resolve.current == 0 
            && data.resources.resolve.fatigue == 0
             && data.resources.resolve.regular == 0 
             && data.resources.resolve.lasting == 0) {
            
                data.resources.resolve.current = data.resources.resolve.max;
        }
    }

    _prepareVehicleData(actorData) {
        // Stub
    }

   basicRoll() {
        const pri = duplicate(this.data.data.main_attributes);
        const com = duplicate(this.data.data.combat_attributes);
        const car = this.items.filter(function(item) {return item.type == "career"});

        console.log("Careers", car);

        let dialogData = {
            primary: pri,
            combat: com,
            careers: car
        }

        renderTemplate('systems/ewhen/templates/roll/EWBasicRoll.hbs', dialogData).then((dlg) => {
            new Dialog({
                title:game.i18n.localize("EW.rolltype.basicroll"),
                content: dlg,
                buttons: {
                    roll: {
                     icon: '<i class="fas fa-check"></i>',
                     label: "Yes",
                     callback: (html) => {
                      //  console.log("passed html: ", html); 
                        let rdata = {
                            html: html,
                            actor: this
                        };
                        let ewroll = new EWRoll(rdata);
                        ewroll.roll();
                        ewroll.rollObj.getTooltip().then((tt) => ewroll.toMessage(tt));
                        }
                    },
                    close: {
                     icon: '<i class="fas fa-times"></i>',
                     label: "Cancel",
                     callback: () => { console.log("Clicked Cancel"); return; }
                    }
                   },
                default: "close"
            }).render(true);

        });
    }

    updateResource(res) {
        const actorData = duplicate(this.data);
        const resData = duplicate(actorData.data.resources[res]);
        console.log(resData);
        let dialogData = {
            resname: "EW.activity.adjust"+res,
            resinfo: resData
        }
        
        renderTemplate('systems/ewhen/templates/actor/EWAdjustResource.hbs', dialogData).then((dlg)=>{ 
           new Dialog({
            title: game.i18n.localize("EW.activity.adjust"+res),
            content: dlg,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Continue",
                    callback: (html) => { console.log("Clicked continue", res);

                        let fatDmg = Number(html.find("#fatigue-dmg").val());
                        let regDmg = Number(html.find("#regular-dmg").val());
                        let lastDmg = Number(html.find("#lasting-dmg").val());
                        let critDmg = Number(html.find("#crit-dmg").val());

                        console.log("Submitted (reg, fat, last): ", regDmg, fatDmg, lastDmg);
                        console.log("ResData (current,reg,fat,last): ", resData.current, resData.regular, resData.fatigue, resData.lasting);

                        resData.regular = regDmg;
                        resData.fatigue = fatDmg;
                        resData.lasting = lastDmg;
                        resData.critical = Math.min(critDmg, 5);
                        let totalDmg = regDmg + fatDmg + lastDmg;
                        let currentLb = resData.max - totalDmg;
                        resData.current = currentLb;

                        console.log("ResData after math (current,reg,fat,last): ", resData.current, resData.regular, resData.fatigue, resData.lasting);


                        if(totalDmg > resData.max) { 
                            ui.notifications.error(game.i18n.localize("EW.warnings.damageoverrun")); 
                        } else {  
                        
                            actorData.data.resources[res] = resData;

                          console.log("Actor Data post-update: ", actorData);
             
                            this.update(actorData);
                            this.sheet.render(true);
                        }
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => { console.log("Clicked cancel", res); return; }
                }
            },
            default: "ok"
            }).render(true);
        });


    }

    rollAttribute(attr){
        
        const ma = duplicate(this.data.data.main_attributes);
        const ca = duplicate(this.data.data.combat_attributes);

        let mrank =ma.rank;
        let crank =ca.rank;
        var dlg; // eventually build the roll dialog

        let r = new Dialog({
            title: game.i18n.localize("EW.rolltype.attributeroll"),
            content: dlg,
            buttons: {
             one: {
              icon: '<i class="fas fa-dice-six"></i>',
              label: "Roll",
              callback: () => { return; }
             },
             two: {
              icon: '<i class="fas fa-times"></i>',
              label: "Cancel",
              callback: () => { return; }
             }
            },
            default: "two",
            render: html => console.log("User triggered roll"),
            close: html => console.log("Roll Dialog Closed")
           });
           d.render(true);
        
    }

    assembleRollInfo(html) {
        var attrVal = 0;
        var comVal = 0;
        var cVal = 0;

        let attr = html.find("#pattr").val().toLowerCase();
        let combat = html.find("#cattr").val().toLowerCase();
        let bonus = html.find("#bonus").val();
        let penalty = html.find("#penalty").val();
        let careerName = html.find("#career").val();
        let bdNum = html.find("#bdice").val();
        let bdSuffix = "";
        let dice = "2d6";
       
       if (careerName != "none") {
            let careers = this.data.items.filter(function(item) {return item.type == "career"});
            // console.log("Career Items: ", careers);
            let thisCareer = careers.filter(function(item) { return item.name == careerName});

            let itemId = thisCareer[0]._id;
       
            cVal = this.getOwnedItem(itemId).data.data.rank;

       }

       bdNum == "None" ? dice = dice : dice = (Number(bdNum) + 2) + "d6kh2";
       let totalMods = Number(bonus) - Number(penalty);
       attr == "none" ? attrVal = 0 : attrVal = this.data.data.main_attributes[attr].rank;
       combat == "none" ? comVal = 0 : comVal = this.data.data.combat_attributes[combat].rank;
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
       return rollInfo;
    }

    showRollMessage(roll, tt, dlg){
        console.log("RollData", roll);
        console.log("Tooltip", tt);
        console.log("Dlg: ", dlg);
        var outcome = "";
        var outcomeClass = "";

        let keptDice = roll.terms[0].values;
        let total = roll.total;
        let mightyThreshold = 9 + Number(dlg.penalty);

        console.log("Roll total: ", total);
        console.log("Roll kept dice: ", keptDice)
        console.log("Might threshold: ", mightyThreshold );

        
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
            roll: roll,
            tooltip: new Handlebars.SafeString(tt),
            d: dlg,
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

}