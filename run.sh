echo -e "Building...\c"
tsc
echo -e "\r\x1b[KBuilding...Done"
echo -e "Running...\c"
node .
echo -e "\r\x1b[KRunning...Done"
