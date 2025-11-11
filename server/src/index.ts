import { serve } from "./server";

function env(name: string) {
    const value = Bun.env[name];

    if (value === undefined) {
        throw Error(`Missing required env variable '${name}'`);
    }

    return value;
}

const config = {
    http: {
        port: parseInt(env("PORT"))
    },

    database: {
        endpoint: env("ENDPOINT")
    },

    public: {
        directory: Bun.env["PUBLIC_DIR"]
    }
};

const logs: { time: Date, message: any[] }[] = [];
const log = (...message: any[]) => {
    logs.push({ time: new Date(), message });
    console.log(...message);
};

serve({
    config: {
        port: config.http.port,
        endpoint: config.database.endpoint,
        publicDir: config.public.directory ?? ""
    },

    dependencies: {
        log
    }
});