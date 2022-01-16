const csvParser = require("csv-parser");
const axios = require("axios");
const pressAnyKey = require("press-any-key");
const fs = require("fs");
require("dotenv").config({ path: ".env" });
// Company Name
// Position
// Salary
// Year
// Term
// Interview Experience
// Tell us more about interview
// Job Experience
// Tell us moe about job experience
// Did you have a mentor
// Did you work on a project

const reviews = [];

const addCompany = async (company) => {
  const res = await axios.post("http://localhost:3000/api/company/addCompany", {
    name: company.name,
    city: company.city,
    country: company.country,
    website: `https://${company.domain}`,
    description: company.description,
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
      if (company) {
        company.description = "N/A";
        company.city = "N/A";
        company.country = "N/A";
      }
      console.log(company);
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
const companyNamesJson = JSON.parse(fs.readFileSync("notfound.json"));
processCompany(companyNamesJson);
// fs.createReadStream("responses.csv")
//   .pipe(csvParser())
//   .on("data", async (row) => {
//     try {
//       for (let i = 1; i <= 6; i++) {
//         if (row[`Company Name ${i}`]) {
//           companyNames.push(row[`Company Name ${i}`]);
//         }
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   })
//   .on("end", () => {
//     console.log("Done");
//     processCompany(companyNames);
//   });

// Ltd
// INc
