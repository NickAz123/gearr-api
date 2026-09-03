import * as Joi from "joi";

/**
 * Fails fast at boot if the environment is incomplete. The Express version read
 * `process.env` lazily at module load, so a missing DB_HOST only surfaced on the
 * first query.
 */
export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid("development", "production", "test")
        .default("development"),
    PORT: Joi.number().port().default(9000),

    SECRET_KEY: Joi.string().min(1).required(),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().port().default(5432),
    DB_NAME: Joi.string().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().allow("").required(),

    REDIS_URL: Joi.string().uri().default("redis://localhost:6379"),
    SESSION_TTL_SECONDS: Joi.number().default(86400),
    SESSION_COOKIE_SECURE: Joi.boolean().default(false),
});
