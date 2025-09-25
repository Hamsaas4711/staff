const bcrypt = require("bcrypt");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("staff").del();
  await knex("users").del();

  const salt = await bcrypt.genSalt(10);

  const users = [
    {
      code: "admin",
      password: await bcrypt.hash("admin123", salt),
      role: "admin",
    },
    {
      code: "100",
      password: await bcrypt.hash("dte123", salt),
      role: "college",
    },
    {
      code: "101",
      password: await bcrypt.hash("college123", salt),
      role: "college",
    },
  ];

  await knex("users").insert(users);

  const staff = [
    {
      college_code: "100",
      college_name: "DIRECTORATE OF TECHNICAL EDUCATION, BANGALORE",
      district: "Bangalore Urban",
      taluk: "Bangalore North",
      designation: "DATA ENTRY ASSISTANT",
      group: "C",
      branch: "DATA ENTRY ASSISTANT",
      sanctioned: 13,
      working: 10,
      vacant: 3,
      no_of_deputed: 0,
      deputed_college_code: null,
      remarks: "Sample record 1",
    },
    {
      college_code: "101",
      college_name: "INST OF TEXTILE TECHNOLOGY, BANGALORE",
      district: "Bangalore Urban",
      taluk: "Bangalore South",
      designation: "LECTURER",
      group: "B",
      branch: "TEXTILE TECHNOLOGY",
      sanctioned: 5,
      working: 5,
      vacant: 0,
      no_of_deputed: 0,
      deputed_college_code: null,
      remarks: "Sample record 2",
    },
  ];

  await knex("staff").insert(staff);
};
