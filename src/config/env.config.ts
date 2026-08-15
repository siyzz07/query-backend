
export let envConfig = {
    SUPER_ADMIN_KEY: process.env.SUPER_ADMIN_KEY,
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT
}

export default envConfig