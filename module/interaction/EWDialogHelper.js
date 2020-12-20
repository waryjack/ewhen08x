/**
 * Handles dialog creation, to get it out of repeated uses in EWActor
 * 
 */
import { EWRoll } from "../roll/EWRoll.js"; 
import { EWActor } from "../actor/EWActor.js";

export class EWDialogHelper {

    static generateRollDialog(template, data) {

        let isDamage = template == CONFIG.ewhen.DIALOG_TYPE.DAMAGE ? true : false;

        console.warn("Template: ", template);
        console.warn("IsDamage: ", isDamage);
        
        renderTemplate(template, data).then((dlg) => {
            new Dialog({
                title:game.i18n.localize("EW.rolltype.basicroll"), // figure this out at some point...not localized right
                content: dlg,
                buttons: {
                    roll: {
                     icon: '<i class="fas fa-check"></i>',
                     label: "Continue",
                     callback: (html) => {
                      //  console.log("passed html: ", html); 
                        let rdata = {
                            html: html,
                            actor: data.actor,
                            isDamage: isDamage,
                            item: data.item
                        };
                        let ewroll = new EWRoll(rdata);
                        ewroll.rollDice();
                        ewroll.rollObj.getTooltip().then((tt) => ewroll.createChatMessage(tt, isDamage));
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

    static async generateUpdateDialog(template, data) {

        renderTemplate(template, data).then((dlg)=>{ 
            new Dialog({
             title: game.i18n.localize(data.resname),
             content: dlg,
             buttons: {
                 ok: {
                     icon: '<i class="fas fa-check"></i>',
                     label: "Update",
                     callback: (html) => {data.actor.updateResource(data.res, html);}
                 },
                 cancel: {
                     icon: '<i class="fas fa-times"></i>',
                     label: "Cancel",
                     callback: () => { return; }
                 }
             },
             default: "ok"
             }).render(true);
         });
    }

}