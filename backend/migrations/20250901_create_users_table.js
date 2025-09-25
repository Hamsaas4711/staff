exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("code").notNullable().unique(); // college code or 'admin'
    table.string("password").notNullable();
    table.string("role").notNullable().defaultTo("college"); // 'college' or 'admin'
    table.string("token"); // token storage
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("users");
};
