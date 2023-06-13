# Finds how many lines of code is in the program. Currently ~25k
git ls-files | xargs -d '\n' wc -l | grep 'total' | grep --color=never -o '[0-9]*'