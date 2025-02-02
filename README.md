# Everywhen (Unofficial) Foundry VTT system

This is an unofficial Foundry VTT system for the *Everywhen* RPG from Filigree Forge, based on *Barbarians of Lemuria* written by Simon Washbourne.

The system takes a low-automation approach, with the focus on a character sheet to manage the basics, the unique initiative and damage tracking, and dice rolling. Targeting and automatic damage stuff is not currently implemented (may be a future wishlist item).

## Special Thanks

* Thanks to *johannes* for contributions, major features, and bugfixes! 
* Thanks to *Gyaile* for the French translation files!

# Using the System

## Actor Types
There are two types of Actors in the game: *character* and *vehicle*. 

### Characters
Characters can be toggled to "Tough" or "Rabble", but all of the individual characters (hero, rival, tough, and rabble) share a single sheet, which displays differing information based on type. Character sheets are live, with drag/drop enabled. 

**Note**: currently the "Armor Bonus" field on the miscellaneous details tab *includes* the bonus from equipped accessories, so take that into account if making an adjustment. Future iterations will fix that. 

### Vehicles
Vehicles have one type of sheet; a simple two-pane sheet with vehicle information. All vehicles show a shield track at this point; future updates will allow that to be toggled.

To set the vehicle's frame track, adjust the *Frame* stat in the left-hand pane. Frame tracks always have a minimum value of 5, however.

## Item Types
There are a number of item types:

* Trait: this type is used for boons and flaws
* Career: this type is used for careers; future updates will *probably* fold this into traits
* Power: this type is for arcane / faith / psionic powers, etc.
* Weapon
* Armor
* Equipment: this is for non-weapon / non-armor gear

## Setting Modifiers

For **Items**, bonuses and penalties are factored separately, so use positive numbers for each. 

## Editing Items
Click on the name of the item to open the item editor window. Note: since the only useful info for a Career is its name, they can be edited inline rather than popping up a window.  

# Rolling Dice

## Modifiers
**Note**: The general modifier field accepts both positive and negative numbers. 

## Attribute and General Rolls
Dice rolls can be triggered from the die icon on the character sheet, or by clicking on an attribute name or combat ability name. 

## Weapon and Armor Damage
Click on the weapon or armor image in inventory to roll weapon damage or armor protection, respectively. 

# System Settings

There are several optional settings available for the system - most of which I hope are self-explanatory (at least if you know Everywhen):

* Dice Type: pick the base dice rolled for tests - you can choose 2d6, 2d10, 2d12, and 3d6
* Use 1d6 for Initiative: overrides the above selection for initiative rolls only (useful for Barbarians of Lemuria and Honor+Intrigue)
* Attribute Initiative Bonus: select the _attribute_ that adds to initiative
* Combat Ability Initiative Bonus: select the _combat ability_ that adds to initiative
* Custom attributes for combat abilities: set which attribute is automatically selected when triggering a roll by clicking on a combat ability (e.g., if you set the "Custom Melee Attribute" to "Mind" then "Mind" will be pre-selected in the roll dialog when you click the "Melee" ability to make a dice roll). **Note**: this is currently not enabled for Initiative, due to potential confusion about the already existing "Initiative Bonus" settings listed above. Future updates should straighten that out.
* Enable Priority Roll Initiative: enables priority roll, instead of straight descending initiative order - see _Everywhen_, page 35. 
* Reroll Initiative Every Round: choose whether to reroll each round, or keep the same initiative order for the whole combat
* Resource tracks: depending on the setting/game you run, you can enable or disable certain resource tracks and pools, including **Resolve**, **Critical** tracks, and the different point pools (Hero Points, Arcana Points, etc.)
* Display Scale: you can hide scale indicators if you're not using the Scale rules for your particular game; this is just a cosmetic tweak for the sheet displays
* Enable Credit Rating: this hides currency info on the sheet (as the hint says) if credit rating is being used instead
* Rabble Lifeblood: here you can set Rabble default lifeblood amounts to whatever your setting or game calls for

## Custom Attribute/Ability Names

It is possible to customize the display names of the 4 main and combat abilities in Settings. This will affect the *displayed* name of the attributes used in the system - e.g., if you set the custom name for **Strength** to be **Power**, then it will display as "Power" in the character, roll, and item sheets.

Custom ability names is functional for characters only, not for vehicles. 

*Note*: there may be issues with non-English localized systems; if so, please report them!

# Todo

* Incorporating encumbrance / weight counting
* Weights and costs for weapons and armor (there, but not wired in yet)
* Localization fixes
* Refactoring and cleanup - ugly hacky code.
