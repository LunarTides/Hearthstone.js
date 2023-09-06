help:
	@echo "Usage: make COMMAND"
	@echo ""
	@echo "Commands:"
	@echo "  install: Installs npm dependencies"
	@echo "  help: Shows this help"
	@echo "  vanilla: Generates vanilla cards"
	@echo "  run: Runs the game"
	@echo ""

install:
	@echo "Trying to install using npm..."
	@node --version > /dev/null 2>&1 || (echo "Nodejs is not installed" && exit 1)
	@npm i

vanilla:
	@echo "Trying to generate vanilla cards..."
	@npm run generate

run:
	@ls dist/index.js > /dev/null 2>&1 || (echo "The game hasn't been built." && exit 1)
	@echo "Running..."
	@node .
	@echo "Running...Done"

build:
	@echo -e "Building...\c"
	@tsc
	@echo -e "\r\x1b[KBuilding...Done"

start:
	@echo -e "Building...\c"
	@tsc
	@echo -e "\r\x1b[KBuilding...Done"
	@node .
