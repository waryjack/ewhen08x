/**
 * Handles dialog creation, to get it out of repeated uses in EWActor
 * 
 */
import { EWRoll } from "../roll/EWRoll.js"; 
import { EWActor } from "../actor/EWActor.js";

export class EWDialogHelper {

    static async generateRollDialog(template, data) {

        let isDamage = template == CONFIG.ewhen.DIALOG_TYPE.DAMAGE ? true : false;

     //   console.warn("Template: ", template);
      //  console.warn("IsDamage: ", isDamage);
        
        renderTemplate(template, data).then((dlg) => {
            new foundry.applications.api.DialogV2({
                window: { title: "EW.rolltype.basicroll" },
                content: dlg,
                classes: ["ew-dialog"],
                buttons: [{
                            action: "roll",
                            label: "Roll",
                            default: true,
                            callback: (event, button, dialog) => {
                                return button.form.elements;
                                console.log("Callback: ", button.form.elements)
                                console.log("Attribute: ", button.form.elements.pattr.value);
                                console.log("Combat: ", button.form.elements.cattr.value);
                                console.log("Career: ", button.form.elements.career.value)
                            
                            }
                        }, 
                        {
                            action: "close",
                            label: "Close"
                        }],
                
                submit: result => {
                    console.log("Dialog V2 Result: ", result);
                    if (result === "close") return;

                    let rdata = {
                        html:result,
                        actor:data.actor,
                        isDamage:isDamage,
                        item: data.item
                    }

                    let ewroll = new EWRoll(rdata);
                    ewroll.rollDice().then(()=>
                    {
                        ewroll.rollObj.getTooltip().then((tt) => ewroll.createChatMessage(tt, isDamage));
                    });

                }
            }).render({force:true});




        });

    }

    static async generateUpdateDialog(template, data) {

        renderTemplate(template, data).then((dlg)=>{ 
            new foundry.applications.api.DialogV2({
             window: { title:game.i18n.localize(data.resname) },
             content: dlg,
             buttons: [
                {
                    action: "update",
                    label:"Update",
                    default: true,
                    callback: (event, button, dialog) => {
                        return button.form.elements;
                    }
                },
                {
                    action: "close",
                    label: "Cancel",
                    callback: () => { return; }
                }],
             submit: result => {
                    if (result === "close") return;
                    data.actor.updateResource(data.res, result);
                 }
             }).render({force:true});
         });
    }

    static async generateVehicleUpdateDialog(template, data) {

       // console.warn("vehicle update dialogData: ", data); 

        renderTemplate(template, data).then((dlg)=>{ 
            new foundry.applications.api.DialogV2({
             title: game.i18n.localize(data.resname),
             content: dlg,
             buttons: [
                 {
                    action:"update",
                    label: "Update",
                    icon: '<i class="fas fa-check"></i>',
                    callback: (event, button, dialog) => {
                         // console.warn('clicked submit');
                         return button.form.elements;
                    }
                 },
                 {
                     action:"cancel",
                     icon: '<i class="fas fa-times"></i>',
                     label: "Cancel",
                     callback: () => { return; }
                 }],
             submit: result => {
                if (result === "cancel") return;

                if(data.res == "frame") {
                    data.actor.updateFrame(result);
               } else {
                   data.actor.updateShield(result);
               }
             }
             }).render(true);
         });
    }

}