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
        // data.resources.lifeblood.current = data.resources.lifeblood.max - data.resources.lifeblood.fatigue - data.resources.lifeblood.lasting;
        // data.resources.resolve.current = data.resources.resolve.max - data.resources.resolve.fatigue - data.resources.resolve.lasting;

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
                     callback: () => { console.log("Clicked Roll"); return; }
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

}