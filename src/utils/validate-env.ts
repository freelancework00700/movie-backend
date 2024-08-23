import { cleanEnv } from "envalid";
import { port, str } from "envalid/dist/validators";

export default cleanEnv(process.env, {
    // Server Environment
    NODE_ENV: str(),

    // API Port
    PORT: port(),

    // Database Configuration
    MYSQL_HOST: str(),
    MYSQL_USER: str(),
    MYSQL_PASSWORD: str(),
    MYSQL_PORT: port(),

    SECRET_KEY: str()
});