require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.speedyport;
const bind_ip = process.env.bind_ip;

const helmet = require("helmet");

class Heartbeat {
    startBeating() {
        //These are tailored to my setup. If you're starting elsewhere,
        //see the docs: https://helmetjs.github.io/
        app.use(helmet.contentSecurityPolicy());
        app.use(helmet.dnsPrefetchControl());
        app.use(helmet.hidePoweredBy());
        app.use(helmet.ieNoOpen());
        app.use(helmet.permittedCrossDomainPolicies());
        app.use(helmet.referrerPolicy());
        app.use(helmet.xssFilter());

        app.get(process.env.HEARTBEAT_PATH, (req, res) => {
            res.set("Cache-control", "public, max-age=86400");
            res.send("🐢");
        });

        app.listen(port, bind_ip, () => {
            console.log(
                `Heartbeat beating on http://${bind_ip}:${port}${process.env.HEARTBEAT_PATH}`
            );
        });
    }
}

module.exports = {
    Heartbeat,
};
