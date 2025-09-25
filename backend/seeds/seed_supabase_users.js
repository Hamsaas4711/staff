const bcrypt = require("bcrypt");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("users").del();

  const salt = await bcrypt.genSalt(10);

  const users = [
    {
      code: "admin",
      password: await bcrypt.hash("admin123", salt),
      role: "admin",
      token: null,
    },
    {
      code: "100",
      password: await bcrypt.hash("dte123", salt),
      role: "college",
      token: null,
    },
    {
      code: "101",
      password: await bcrypt.hash("college123", salt),
      role: "college",
      token: null,
    },
  ];

  await knex("users").insert(users);
};
