# To-Do

1. Refactor EWRoll into attribute, combat, item roll classes - clearer code
2. Relocate most type-specific methods to the data models, use the DocumentSheet and Documents to relay information.
3. After refactoring EWRoll, consider using it to clean up the EWCombat implementation - make priority initiative work better!
4. Shift various point pools (e.g. arcana, faith) to items rather than settings options. Hero Points are the only thing to stay. Redesign sheet to accommodate if needed.
5. Ensure all sheet functionality is live. Current issues:
    * Updating resources (lifeblood, shield, etc)
    * Rolling careers, items
6. Add back tabbed sheet, if possible.
7. Drag/drop implementation on actor sheets.
8. Encumbrance, weights, etc.
9. DataModel for system settings (to help with migrations)