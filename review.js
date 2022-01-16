const csvParser = require("csv-parser");
const axios = require("axios");
const pressAnyKey = require("press-any-key");
const fs = require("fs");
require("dotenv").config({ path: ".env" });

fs.createReadStream("responses.csv")
  .pipe(csvParser())
  .on("data", async (row) => {
    try {
      for (let i = 1; i <= 6; i++) {
        if (row[`Company Name ${i}`]) {
          companyNames.push(row[`Company Name ${i}`]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  })
  .on("end", () => {
    console.log("Done");
    processCompany(companyNames);
  });
