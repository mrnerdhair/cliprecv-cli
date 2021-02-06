
import nacl from "tweetnacl";
import qrcode from "qrcode-terminal";
import clipboardy from "clipboardy";
import Debug from "debug";

import listenForDweet from "./listenForDweet.js";
import * as hex from "./hex.js";

const debug = Debug("cliprecv");

const startNewRecvSession = async () => {
    const kp = nacl.box.keyPair();
    debug(JSON.stringify({pk: hex.to(kp.publicKey)}));

    const qrcodeString = JSON.stringify({pk: hex.to(kp.publicKey)});
    qrcode.generate(qrcodeString);

    const dweet = await listenForDweet(hex.to(kp.publicKey));
    debug(dweet);

    const b = {
        c: Buffer.from([]),
        n: Buffer.from([]),
        pk: Buffer.from([]),
    };
    try {
        b.c = hex.from(dweet.content.c);
        b.n = hex.from(dweet.content.n);
        b.pk = hex.from(dweet.content.pk);
    } catch (e) { debug(e); }
    debug(b);

    try {
        let mRaw = nacl.box.open(b.c, b.n, b.pk, kp.secretKey);
        if (mRaw === null) {
            throw new Error("unboxing failed, likely due to an authentication error.");
        }
        debug(mRaw);

        const mBuf = Buffer.from(mRaw).toString("utf8");
        debug(mBuf);

        let m = JSON.parse(mBuf);
        debug(m);

        if (typeof m !== "string") {
            m = JSON.stringify(m, undefined, "  ");
        }
        debug(m);

        m = m.replace(/\r?\n/g, "\r\n");
        debug(m);

        clipboardy.writeSync(m);
        debug("clipboard set");
    } catch (e) {
        debug(e);
    }
};

await startNewRecvSession();
process.exit(0);
