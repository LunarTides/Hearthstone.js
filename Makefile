setup:
	@echo "Trying to install using npm..."
	@npm i

vanilla:
	@echo "Trying to generate vanilla cards..."
	@npm run generate

run:
	@echo "Running the game..."
	@node .