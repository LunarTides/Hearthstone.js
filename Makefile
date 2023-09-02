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
	@chmod +x setup.sh
	@chmod +x run.sh
	@./setup.sh

vanilla:
	@echo "Trying to generate vanilla cards..."
	@npm run generate

run:
	@./run.sh