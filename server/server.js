// server/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import verificationRoutes from "./routes/verificationRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

/* Middlewares */
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* Routes */
app.use("/verification", verificationRoutes);

/* Start */
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
