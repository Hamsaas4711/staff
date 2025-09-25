require("dotenv").config();
const app = require("./app");

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
