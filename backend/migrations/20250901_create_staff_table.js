exports.up = function (knex) {
  return knex.schema.createTable("staff", (table) => {
    table.increments("id").primary();
    table.string("college_code").notNullable().index();
    table.string("college_name");
    table.string("district");
    table.string("taluk");
    table.string("designation");
    table.string("group");
    table.string("branch");
    table.integer("sanctioned").defaultTo(0);
    table.integer("working").defaultTo(0);
    table.integer("vacant").defaultTo(0);
    table.integer("no_of_deputed").defaultTo(0);
    table.string("deputed_college_code");
    table.text("remarks");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("staff");
};
