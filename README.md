# Everywhen (Unofficial) Foundry VTT system

## Special Thanks

* Thanks to *johannes* for contributions and bugfixes! 
* Thanks to *Gyaile* for the French translation files!

## This is the version for Foundry VTT 0.8.6 and higher.

This is an unofficial Foundry VTT 0.8.6+ system for the *Everywhen* RPG from Filigree Forge, based on *Barbarians of Lemuria* written by Simon Washbourne.

The system takes a low-automation approach, with the focus on a character sheet to manage the basics, the unique initiative and damage tracking, and dice rolling. Targeting and automatic damage stuff is not currently implemented (may be a future wishlist item).

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
Dice rolls can be triggered from the die icon on the character sheet, or by clicking on an attribute or combat attribute. 

## Weapon and Armor Damage
Click on the weapon or armor image in inventory to roll weapon damage or armor protection, respectively. 

# System Settings

There are several optional settings available for the system - most of which I hope are self-explanatory (at least if you know Everywhen):

* Initiative mode: choose from several options for initiative, based on different variants of the basic Everywhen system. Not all possibilities are included.
* Resource tracks: depending on the setting/game you run, you can enable or disable certain resource tracks and pools, including **Resolve**, **Critical** tracks, and the different point pools (Hero Points, Arcana Points, etc.)
* Display Scale: you can hide scale indicators if you're not using the Scale rules for your particular game; this is just a cosmetic tweak for the sheet displays
* Enable Credit Rating: this hides currency info on the sheet (as the hint says) if credit rating is being used instead
* Rabble Lifeblood: here you can set Rabble default lifeblood amounts to whatever your setting or game calls for

## Custom Attribute/Ability Names

It is possible to customize the display names of the 4 main and combat abilities in Settings. This will affect the *displayed* name of the attributes used in the system - e.g., if you set the custom name for **Strength** to be **Power**, then it will display as "Power" in the character and item sheets.

Custom ability names is functional for characters only, not for vehicles. 

*Note*: there may be issues with non-English localized systems; if so, please report them!

# Todo

* Incorporating encumbrance / weight counting
* Weights and costs for weapons and armor (there, but not wired in yet)
* Localization fixes
* Refactoring and cleanup - ugly hacky code.