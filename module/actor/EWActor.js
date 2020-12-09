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

        var str = data.attributes.strength.rank;
        var mnd = data.attributes.strength.rank;

        console.log("Stat pulls: ", str, mnd);
        data.resources.lifeblood = Number(str) + 10;
        data.resources.resolve = Number(mnd) + 10;

    }

    _prepareVehicleData(actorData) {
        // Stub
    }

}