function testFunction() {
    const fs = require("fs");

    const content = "Some content!";

    fs.appendFile("/workspace/Gecko/test.txt", content, err => {
        if (err) {
          console.error(err);
        }
        // file written successfully
      });
}

module.exports = {
    testFunction: testFunction
};