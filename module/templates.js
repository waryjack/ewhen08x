export const preloadHandlebarsTemplates = async function() {
    return loadTemplates([
  
      // Shared Partials
      "systems/ewhen/templates/partials/DiffList.hbs",
      
  
      // Actor Sheet Partials
      "systems/ewhen/templates/partials/MainAttributes.hbs",
      "systems/ewhen/templates/partials/CombatAttributes.hbs",
      "systems/ewhen/templates/partials/CareerList.hbs",
      "systems/ewhen/templates/partials/HealthTracks.hbs",
      "systems/ewhen/templates/partials/BoonList.hbs",
      "systems/ewhen/templates/partials/FlawList.hbs",
      "systems/ewhen/templates/partials/PowerList.hbs",
      "systems/ewhen/templates/partials/WeaponList.hbs",
      "systems/ewhen/templates/partials/EquipmentList.hbs",
      "systems/ewhen/templates/partials/ArmorList.hbs",
      "systems/ewhen/templates/partials/VehicleSpecs.hbs",
      "systems/ewhen/templates/partials/PointPools.hbs",
      "systems/ewhen/templates/partials/Resources.hbs",
  
      // Item Sheet Partials
      "systems/ewhen/templates/partials/EraSelect.hbs",
      "systems/ewhen/templates/partials/AttributeSelect.hbs"
      // Roll Sheet Partials
    ]);
  };
  