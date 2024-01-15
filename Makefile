help:
    @echo "Usage: make COMMAND"
    @echo ""
    @echo "Commands:"
    @echo "  install: Installs dependencies"
    @echo "  help: Shows this help"
    @echo "  vanilla: Generates vanilla cards"
    @echo "  run: Runs the game"
    @echo "  clean: Remove all automatically generated files"
    @echo ""

install:
    @echo "Trying to install using bun..."
    @bun --version > /dev/null 2>&1 || (echo "Bun is not installed" && exit 1)
    @bun install

vanilla:
    @echo "Trying to generate vanilla cards..."
    @bun run script:vanilla:generate

run:
    @echo "Running..."
    @bun .
    @echo "Running...Done"

clean:
    @rm -rf ./node_modules/
    @rm -rf ./vanillacards.json

