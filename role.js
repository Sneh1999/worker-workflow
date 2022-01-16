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
const companyNotFound = [];
const findCompanyAPI = async (name) => {
  const companies = await axios.get(
    `https://autocomplete.clearbit.com/v1/companies/suggest?query=${name}`,
    { headers: { Authorization: `Bearer ${process.env.CLEARBIT_API_KEY}` } }
  );
  return companies.data[0];
};
const findCompany = async (companyName) => {
  let company = await findCompanyAPI(companyName);
  const params = new URLSearchParams([["name", company.name]]);
  const res = await axios.get("http://localhost:3000/api/getCompanyName", {
    params,
  });
  return res.data.companies[0].id;
};

// const addRoles = async (companyId, title_name) => {
//   await axios.post("http://localhost:3000/api/role/addRole", {
//     title_name: title_name,
//     company_id: companyId,
//   });
// };

const getRole = async (position, company_id) => {
  const params = new URLSearchParams([
    ["title_name", position],
    ["company_id", company_id],
  ]);
  const res = await axios.get("http://localhost:3000/api/role/getRole", {
    params,
  });
  return res.data.roles[0].id;
};

const addReview = async (company) => {
  await axios.post("http://localhost:3000/api/review/addReview", company);
};
const processCompany = async (companies) => {
  for (let i = 0; i < companies.length; i++) {
    try {
      const companyId = await findCompany(companies[i].name);
      // await addRoles(companyId, companies[i].position);
      const roleId = await getRole(companies[i].position, companyId);
      companies[i].role_id = parseInt(roleId);
      //   await pressAnyKey();
      await addReview(companies[i]);
    } catch (err) {
      if (err.response && err.response.status != 500) {
        console.error(err);
        console.log("i", i);
        console.log(companies[i].name);
        companyNotFound.push(companies[i].name);
        await pressAnyKey();
      }
    }
  }
  fs.writeFileSync("notfound.json", JSON.stringify(companyNotFound, null, 2));
};

let companies = [];
fs.createReadStream("responses.csv")
  .pipe(csvParser())
  .on("data", async (row) => {
    try {
      for (let i = 1; i <= 6; i++) {
        if (
          row[`Company Name ${i}`] &&
          !row[`Company Name ${i}`].includes("NF")
        ) {
          companies.push({
            name: row[`Company Name ${i}`],
            position: row[`Position ${i}`] ? row[`Position ${i}`] : "",
            year_worked: row[`What term was your co-op ${i}`]
              ? row[`What term was your co-op ${i}`]
              : 2020,
            salary: row[`Salary (per hour) ${i}`]
              ? parseFloat(row[`Salary (per hour) ${i}`])
              : 0,
            work_experience_rating: row[`Job Experience ${i}`]
              ? parseInt(row[`Job Experience ${i}`] / 2)
              : 0,
            work_experience:
              row[`Tell us more about your job experience at the company ${i}`],
            interview_experience_rating: row[`Interview Experience ${i}`]
              ? parseInt(row[`Interview Experience ${i}`] / 2)
              : 0,
            interview_experience: row[`Tell us more about your Interview ${i}`],
            duration: 4,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  })
  .on("end", () => {
    console.log("Done");
    processCompany(companies);
  });
