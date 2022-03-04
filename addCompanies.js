const csvParser = require("csv-parser");
const axios = require("axios");
const pressAnyKey = require("press-any-key");
const fs = require("fs");
require("dotenv").config({ path: ".env" });

const addCompany = async (company) => {
  const res = await axios.post("http://localhost:3000/api/company/addCompany", {
    name: company.name,
    website: `https://${company.domain}`,
    logo: company.logo,
  });
  console.log(res.data);
};

const findCompany = async (name) => {
  const companies = await axios.get(
    `https://autocomplete.clearbit.com/v1/companies/suggest?query=${name}`,
    { headers: { Authorization: `Bearer ${process.env.CLEARBIT_API_KEY}` } }
  );
  return companies.data[0];
};

const processCompany = async (companyNames) => {
  const companyNotFound = [];
  for (let i = 0; i < companyNames.length; i++) {
    try {
      let company = await findCompany(companyNames[i]);
      await addCompany(company);
    } catch (err) {
      console.error(err);
      console.log("i", i);
      console.log(companyNames[i]);
      companyNotFound.push(companyNames[i]);
      await pressAnyKey();
    }
  }
  fs.writeFileSync("notfound.json", JSON.stringify(companyNotFound, null, 2));
};
const companyNames = [];
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

// Ltd
// INc
