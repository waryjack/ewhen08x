import { EWRoll } from "../roll/EWRoll.js";

export class EWActor extends Actor {

  mainAttributes = {
      STRENGTH: "strength",
      AGILITY: "agility",
      MIND: "mind",
      APPEAL: "appeal",
  }

  combatAttributes = {
      MELEE: "melee",
      RANGED: "ranged",
      DEFENSE: "defense",
      INITIATIVE: "initiative"
  }
  // @override
  prepareBaseData(){
        super.prepareBaseData();
   
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

       
        data.resources.lifeblood.max = Number(str) + 10;
       
        data.resources.resolve.max = Number(mnd) + 10;
       
        if (data.resources.lifeblood.value == 0 
            && data.resources.lifeblood.fatigue == 0
             && data.resources.lifeblood.regular == 0 
             && data.resources.lifeblood.lasting == 0) {
            
                data.resources.lifeblood.value = data.resources.lifeblood.max;
        }
        if (data.resources.resolve.value == 0 
            && data.resources.resolve.fatigue == 0
             && data.resources.resolve.regular == 0 
             && data.resources.resolve.lasting == 0) {
            
                data.resources.resolve.value = data.resources.resolve.max;
        }

    }

    _prepareVehicleData(actorData) {
        // Stub
    }

   basicRoll() {
        const pri = duplicate(this.data.data.main_attributes);
        const com = duplicate(this.data.data.combat_attributes);
        const car = this.items.filter(function(item) {return item.type == "career"});

        // console.log("Careers", car);

        let dialogData = {
            primary: pri,
            combat: com,
            careers: car,
            attr: "",
            isCombat: false
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
                            actor: this,
                            isDamage: false,
                            item: null
                        };
                        let ewroll = new EWRoll(rdata);
                        ewroll.rollDice();
                        ewroll.rollObj.getTooltip().then((tt) => ewroll.createChatMessage(tt));
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

                       // console.log("Submitted (reg, fat, last): ", regDmg, fatDmg, lastDmg);
                       // console.log("ResData (current,reg,fat,last): ", resData.current, resData.regular, resData.fatigue, resData.lasting);

                        resData.regular = regDmg;
                        resData.fatigue = fatDmg;
                        resData.lasting = lastDmg;
                        resData.critical = Math.min(critDmg, 5);
                        let totalDmg = regDmg + fatDmg + lastDmg;
                        let currentLb = resData.max - totalDmg;
                        resData.value = currentLb;

                        // console.log("ResData after math (current,reg,fat,last): ", resData.current, resData.regular, resData.fatigue, resData.lasting);


                        if(totalDmg > resData.max) { 
                            ui.notifications.error(game.i18n.localize("EW.warnings.damageoverrun")); 
                        } else {  
                        
                            actorData.data.resources[res] = resData;

                         //  console.log("Actor Data post-update: ", actorData);
             
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

    rollAttribute(attr, attr2, isCombat, optStr){
        
        const ma = duplicate(this.data.data.main_attributes);
        const ca = duplicate(this.data.data.combat_attributes);
        const cr = duplicate(this.data.items.filter(function(item) {return item.type == "career"}));
       
        var item = null;
        var itemImg = "";
        var itemName = "";
        var isWeapon = false;

        if(optStr != "") {
            item = this.actor.getOwnedItem(optStr);
            itemImg = item.img;
            itemName = item.name;
            isWeapon = true;
        }

        let dialogData = {
            primary: ma,
            combat: ca,
            careers: cr,
            attr: attr,
            attr2: attr2,
            isCombat: isCombat,
            isWeapon: isWeapon,
            itemImg: itemImg,
            itemName: itemName,
          
        }
      
        renderTemplate('systems/ewhen/templates/roll/EWBasicRoll.hbs', dialogData).then((dlg) => {
            new Dialog({
                title:game.i18n.localize("EW.rolltype.basicroll"),
                content: dlg,
                buttons: {
                    roll: {
                     icon: '<i class="fas fa-check"></i>',
                     label: "Roll",
                     callback: (html) => {
                      
                        let rdata = {
                            html: html,
                            actor: this,
                            isDamage: false,
                            item: null
                        };
                       let ewroll = new EWRoll(rdata);
                       ewroll.rollDice();
                       ewroll.rollObj.getTooltip().then((tt) => ewroll.createChatMessage(tt));
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

    rollWeaponDamage(weapon) {

        let weaponData = weapon.data.data;

        var baseExpr;
        var addAttr = "none";
        var half;
        var miscMod = 0;
        var attRank = 0;

      

        let weaponDamage = weaponData.damage;
        let wName = weapon.name;
        let wImg = weapon.img;
        let range = weaponData.range;
      
        baseExpr = weaponDamage.dice;
        addAttr = weaponDamage.add_attribute;
        half = weaponDamage.half_attribute;
        miscMod = weaponDamage.mod;

        if (addAttr != "none") {
            attRank = this.data.data.main_attributes[addAttr].rank;
        } else {
            attRank = 0
        }

        let attMod = half ? Math.floor(attRank) : attRank;

        let finalExpr = baseExpr + "+" + attMod + "+" + miscMod;

        let dialogData = {
            wname: wName,
            wimg: wImg,
            range: range,
            baseExpr: baseExpr,
            attName: addAttr,
            half:half,
            attMod: attMod,
            miscMod: miscMod,
            finalExpr: finalExpr
        }


        renderTemplate('systems/ewhen/templates/roll/EWDamageRoll.hbs', dialogData).then((dlg) => {
            new Dialog({
                title:game.i18n.localize("EW.rolltype.damageroll"),
                content: dlg,
                buttons: {
                    roll: {
                     icon: '<i class="fas fa-check"></i>',
                     label: "Roll",
                     callback: (html) => {
                      
                        let rdata = {
                            html: html,
                            actor: this,
                            isDamage: true,
                            item: weapon
                        };
                      let ewroll = new EWRoll(rdata);
                      ewroll.rollDice();
                      ewroll.rollObj.getTooltip().then((tt) => ewroll.createDamageMessage(tt));
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

    getAttribute(attribute){
        var attSet;
        Object.values(this.mainAttributes).includes(attribute) ? attSet="main_attributes" : attSet = "combat_attributes";
        return this.data.data[attSet][attribute];
    }

    getLifeblood() {
        return this.data.data.resources.lifeblood;
    }

    getResolve() {
        return this.data.data.resources.resolve;
    }

    getHeroPoints() {
        return this.data.data.resources.hero_points;
    }

    getArcanaPoints() {
        return this.data.data.resources.arcana_points;
    }

    getFaithPoints() {
        return this.data.data.resources.faith_points;
    }

    getPsiPoints() {
        return this.data.data.resources.psi_points;
    }

    get isTough() {
        return this.data.data.isTough;
    }

    get isRabble() {
        return this.data.data.isRabble;
    }

    get isCreature() {
        return this.data.data.isCreature;
    }

    get isEntity() {
        return this.data.data.isEntity;
    }

    get isNPC() {
        return this.data.data.isNPC;
    }

    get size() {
        return this.data.data.size;
    }
}

