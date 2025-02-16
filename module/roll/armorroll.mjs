import EWBaseRoll from "./baseroll.mjs";

export default class EWArmorRoll extends EWBaseRoll {
  
    constructor(formula, data={}, options={}){
        super(formula, data, options);
        foundry.utils.mergeObject(this.options, this.constructor.DEFAULT_OPTIONS, {
            insertKeys: true,
            insertValues: true,
            overwrite: false
          });

          //rebuild after gathering the information using resetFormula
    }

}