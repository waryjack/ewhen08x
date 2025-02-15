// Imports
import EWBaseActor from "./baseactor.mjs"

// Hero 

export default class EWHero extends EWBaseActor {
    

async _addPool() {
    const content = renderTemplate(EWBaseActor.ADD_POOL_TEMPLATE);
    const prompt = await foundry.applications.api.DialogV2.wait({
        window: { title: "EW.prompts.addpool"},
        content: content,
        classes: ["ew-dialog"],
        buttons: [{
            action:"save",
            label:"EW.buttons.add",
            default:true,
            callback: (event, button, dialog) => { return button.form.elements }
        },
            {
                action: "cancel",
                label: "EW.buttons.cancel"
        }],
        submit: result => {
            console.log("Roll dialog result: ", result);
            if (result === "cancel") return;
            return result;
        }
    });

    if(this.system.pools.includes(prompt.newname.value)) {
        ui.notifications.warn(game.i18n.localize("EW.warnings.duplicatePoolName")+ " " + prompt.newname.value);
        return;
    }

    let toAddKey = `system.pools.${prompt.newname.value}`
    let toAddObj = {
        [toAddKey]: {
            min:prompt.newmin.value, 
            max:prompt.newmax.value, 
            current:prompt.newcurrent.value, 
            id:foundry.utils.randomID(16)
        }
    }
    await this.update(toAddObj)
  }

  async _deletePool(pool, p_id) {
    const proceed = await foundry.applications.api.DialogV2.confirm({
        window: { title: "EW.prompts.delpool" },
        content: game.i18n.localize("EW.prompts.delwarning") + pool + game.i18n.localize("EW.prompts.delpool"),
        modal: true
      });

    if (proceed) {
        let toDelete = "";
        console.log(this.system.pools);
        Object.entries(this.system.pools).forEach(([key, value]) => {
            console.log("key",key, "value", value);
            if (key === pool && value.id === p_id) {
                toDelete = key;
            }
        });
        console.log("todelete: ", toDelete);

        let deleteKey = `system.pools.-=${toDelete}`;
        let delObj = {
            [deleteKey]:null
        }
   
        await this.update(delObj);
    } else {
        console.log("Cancelled");
    }
  }
}