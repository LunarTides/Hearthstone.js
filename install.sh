#!/bin/bash

# Write the runtime to a temp file.
# This changes your workdirectory to the Hearthstone.js folder, and runs it.
# It then changes your workdirectory back. This allows for relative filesystem, and git operations.
echo """#!/bin/bash
OLD_PATH=\$(pwd)

cd $(dirname "$(realpath "$0")")
bun . \$@

cd \$OLD_PATH""" > /tmp/hs.sh

# Install the runtime. Requires root permissions.
sudo install /tmp/hs.sh /usr/local/bin/hs
rm /tmp/hs.sh
