const crypto = require("crypto");

const partnerCode = process.env.PARTNER_CODE;
const accessKey = process.env.ACCESS_KEY;
const secretkey = process.env.SECRET_KEY;
const requestId = partnerCode + new Date().getTime() + "1";
const orderId = requestId;
const redirectUrl = process.env.REDIRECT_URL;
const ipnUrl = process.env.IPN_URL;
const requestType = "captureWallet";
const extraData = "";

const Momo = (orderInfo, amount) => {
  const rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;

  const signature = crypto
    .createHmac("sha256", secretkey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: "en",
  });

  const https = require("https");
  const options = {
    hostname: "test-payment.momo.vn",
    port: 443,
    path: "/v2/gateway/api/create",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding("utf8");
      res.on("data", (body) => {
        resolve(JSON.parse(body));
      });
    });

    req.on("error", (e) => {
      console.log(`problem with request: ${e.message}`);
      reject(e.message);
    });

    req.write(requestBody);
    req.end();
  });
};

module.exports = { Momo };
