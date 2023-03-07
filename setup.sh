node --version

if [ $? -eq 0 ]
then 
    npm i
else
    echo "nodejs is not installed"
    echo "go to http://nodejs.org/download/ and download the latest version"
    read -p "Press any key to continue..."
    exit 1
fi

deck_creator/setup.sh
card_creator/setup.sh
