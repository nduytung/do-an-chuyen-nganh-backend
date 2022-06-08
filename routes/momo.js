var partnerCode = process.env.PARTNER_CODE;
var accessKey = process.env.ACCESS_KEY;
var secretkey = process.env.SECRET_KEY;
var requestId = partnerCode + new Date().getTime() + "1";
var orderId = requestId;
var orderInfo = "Project pay with MoMo";
var redirectUrl = process.env.REDIRECT_URL;
var ipnUrl = process.env.IPN_URL;
// var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
var amount = "50000";
var requestType = "captureWallet";
var extraData = ""; //pass empty value if your merchant does not have stores

//before sign HMAC SHA256 with format
//accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
var rawSignature =
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
//puts raw signature
//   console.log("--------------------RAW SIGNATURE----------------");
//   console.log(rawSignature);
//signature
const crypto = require("crypto");
var signature = crypto
  .createHmac("sha256", secretkey)
  .update(rawSignature)
  .digest("hex");
//   console.log("--------------------SIGNATURE----------------");
//   console.log(signature);

//json object send to MoMo endpoint
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

const Momo = () => {
  //Create the HTTPS objects
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
    //Send the request and get the response
    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      res.setEncoding("utf8");
      res.on("data", (body) => {
        resolve(JSON.parse(body));
      });
    });

    req.on("error", (e) => {
      console.log(`problem with request: ${e.message}`);
      reject(e.message);
    });

    // write data to request body
    req.write(requestBody);
    req.end();
  });
};

module.exports = { Momo };
