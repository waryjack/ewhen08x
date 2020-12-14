export const preloadHandlebarsTemplates = async function() {
    return loadTemplates([
  
      // Shared Partials
      "systems/ewhen/templates/partials/EraSelect.hbs",
      "systems/ewhen/templates/partials/AttributeSelect.hbs",
      
  
      // Actor Sheet Partials
      "systems/ewhen/templates/partials/MainAttributes.hbs",
      "systems/ewhen/templates/partials/CombatAttributes.hbs",
      "systems/ewhen/templates/partials/CareerList.hbs",
      "systems/ewhen/templates/partials/HealthTracks.hbs",
      "systems/ewhen/templates/partials/BoonList.hbs",
      "systems/ewhen/templates/partials/FlawList.hbs",
      "systems/ewhen/templates/partials/PowerList.hbs",
      "systems/ewhen/templates/partials/WeaponList.hbs"
  
      // Item Sheet Partials
      
      // Roll Sheet Partials
    ]);
  };
  