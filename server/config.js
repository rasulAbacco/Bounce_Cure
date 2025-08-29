import dotenv from "dotenv";
dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET || "supersecretkey",
    dbUrl: process.env.DATABASE_URL,
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS
};
