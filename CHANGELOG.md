## v2.0.0-beta.2 (2023-10-03)

### Feat

- add back galakrond cards
- **cclib**: add blueprint validation. try to compile
- add traditional turn counter function
- **cclib**: generate card exports on create
- add watch in makefile

### Fix

- **uc**: actually replace regex. replace all game params
- **ccc**: use correct tribe instead of using _card

### Refactor

- split idscript. use idscript in src index
- **uc**: generate exports on completion
- add common function for fs functions
- use const instead of let
- rename galakrond cards to their class
- rename dry-run short command to '-n'
- hide player attack stat if no attack
- move trying to compile to `tryCompile`
- remove optional fields from blueprints
- **uc**: remove game parameter on upgrade
- remove all `game = globalThis.game`
- remove `game` parameter from ability
- put event manager into its own file
- **cclib**: make overridePath implicitly use dirname

## v2.0.0-beta.1 (2023-09-26)

### BREAKING CHANGE

- Removed the `triggerDeathrattle` parameter from `destroyWeapon`
- Renamed `addDeathrattle` to `addAbility`
- Renamed `maxMaxMana` to `maxMana`
- Renamed `maxMana` to `emptyMana`.

### Feat

- find vanilla card types in the propfinder
- add lodash and remove redundant functions
- add caching to getLatestCommit
- add wrapper functions for fs operations
- add tests to most of the cards. add assert
- add testcards script to unit test cards
- **game**: add test ability to cards
- **game**: add flag to temp disable output
- add support for both spellings of gray tags.
- add cli to do the runner's job through cmds
- automatically update .mts extensions to .ts
- **script**: add checking latest id in idscript
- **script**: check mismatched types in propfinder
- added a vanilla card property finder
- added commit hash to version command
- added function to get the version of the game
- added function to get latest commit hash
- added build number to config file
- added alpha branch option to config file
- Added commit hash and uname to log file
- Added `runCommand` function to run shell commands

### Fix

- **vcc**: swap durability and health for wpn / loc
- update the desc field in upgradecards
- ignore exports.ts file when reading cards folder
- fix some todos and move / refactor others
- **game**: fix bug with runCommandAsChildProcess
- **game**: check if game exists before respecting no_output
- add player to event value for takedamage
- fix a cc library bug that always crashes it
- **game**: fix openWithArgs to work with runCommand
- make upgradeCards delete the dist folder
- updated slice amount for ts files from 4 to 3
- made some vanilla card properties optional
- fix type docstring to not give an error
- **script**: added placeholders in check warning
- updated genvanilla scripts to run correct script
- **vcc**: removed unused ts-expect-error
- changed parameter to any type in `print_todo`
- More reliable way of getting os name on linux
- Shortened commit hash in log files
- Removed more child_process imports
- Added build info to version in package file
- Added console.clear to cls function

### Refactor

- add helper function to upgrade cards
- remove all deprecated functions
- sort card exports alphabetically
- **game**: rename desc to text in cards
- rename all snake case variables
- **game**: remove functions.validateClass
- **game**: make summonMinion not return card
- **dc**: use shouldExit instead of only "exit"
- **game**: make last return undefined
- change dirname to not include dist
- change name in exports to use hash of path
- replace all </> with proper closing tags
- use args.shift to get name instead
- refactor openWithArgs to only 1 arg
- add common helper function to runner
- update cc's to take debug and type args
- remove old code comment
- make runCommand possibly return error
- use optional chaining in cards
- change export to use name instead of hash
- change card extension from .mts to .ts
- changed how cards are registered
- made randList possibly return null
- move dc and cc to a new tools folder
- remove all ts-expect-error's
- change config file to a typescript file
- move searching cards folder to functions
- move inline comments above the code
- make getReadableCard a bit more readable
- remove useless imports in runner file
- **game**: change type-specific code playcard
- **ccc**: change running type-specific code
- changed where vanilla cards are stored
- remove card creator folders
- **cclib**: make getCardAbility more readable
- **cclib**: change parameter to use camelcase
- moved vc generator to scripts folder
- made getVersion start at 1 instead of 0
- renamed dev to beta in config file
- **game**: removed parameter from destroyWeapon
- **game**: renamed addDeathrattle
- **cclib**: refactored getCardAbility
- **cclib**: renamed function to ability
- Refactored dormant a bit

## v2.0.0-beta.0 (2023-09-19)

## v1.6.2 (2023-08-28)

## v1.6.1 (2023-08-21)

## v1.6.0 (2023-08-05)

## v1.5.1 (2023-06-09)

## v1.5.0 (2023-06-09)

## v1.4.0 (2023-05-14)

## v1.3.0 (2023-05-14)

## v1.2.0 (2023-05-14)

## v0.1.0 (2023-05-15)
