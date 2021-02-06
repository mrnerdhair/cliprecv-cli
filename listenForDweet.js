import https from "https";

export default function listenForDweet(thing) {
    return new Promise((resolve, reject) => {
        const req = https.get("https://dweet.io/listen/for/dweets/from/" + thing, (res) => {
            res.on("data", (data) => {
                resolve(JSON.parse(JSON.parse(data.subarray(data.indexOf(0x0a) + 1, data.length - 2).toString("utf8"))));
            });
        });
        req.on("error", reject);
    });
}

