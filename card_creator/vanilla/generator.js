let axios = require("axios");
let fs = require("fs");

axios.get("https://api.hearthstonejson.com/v1/latest/enUS/cards.json")
    .then(res => {
        fs.writeFile(".ignore.cards.json", JSON.stringify(res.data), err => {
            if (err) throw err;
        });
        console.log(res.data);
    });
