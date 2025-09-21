# 火山引擎 API V4 签名 + 请求 node.js + axios 示例

```javascript
const axios = require("axios");
const crypto = require("crypto");

// 签名辅助函数
function hashSHA256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function hmacSHA256(key, data) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function signStringEncoder(source) {
  if (!source) return "";
  return encodeURIComponent(source)
    .replace(
      /[!'()*]/g,
      (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()
    )
    .replace(/%20/g, "%20"); // 保证和 Java 版一致
}

// 生成签名 key
function genSigningSecretKeyV4(secretKey, date, region, service) {
  const kDate = hmacSHA256(Buffer.from(secretKey, "utf-8"), date);
  const kRegion = hmacSHA256(kDate, region);
  const kService = hmacSHA256(kRegion, service);
  return hmacSHA256(kService, "request");
}

async function doRequest() {
  // 火山引擎密钥
  const ak = "AK*****";
  const sk = "******==";

  // 基础信息
  const region = "cn-north-1";
  const service = "cv";
  const schema = "https";
  const host = "visual.volcengineapi.com";
  const path = "/";
  const action = "CVProcess";
  const version = "2022-08-31";

  const date = new Date();
  const xDate = date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"; // yyyyMMddTHHmmssZ
  const shortXDate = xDate.substring(0, 8);

  // Body
  const body = {
    req_key: "xxx",
    image_urls: ["******"],
    prompt: "******",
  };
  const bodyStr = JSON.stringify(body);

  // 计算签名
  const xContentSha256 = hashSHA256(Buffer.from(bodyStr, "utf-8"));
  const contentType = "application/json";
  const signHeader = "host;x-date;x-content-sha256;content-type";

  // query 参数
  const query = {
    Action: action,
    Version: version,
  };
  const queryStr = Object.keys(query)
    .sort()
    .map((k) => `${signStringEncoder(k)}=${signStringEncoder(query[k])}`)
    .join("&");

  // CanonicalRequest
  const canonicalRequest =
    "POST" +
    "\n" +
    path +
    "\n" +
    queryStr +
    "\n" +
    `host:${host}\n` +
    `x-date:${xDate}\n` +
    `x-content-sha256:${xContentSha256}\n` +
    `content-type:${contentType}\n` +
    "\n" +
    signHeader +
    "\n" +
    xContentSha256;

  // StringToSign
  const hashCanonical = hashSHA256(Buffer.from(canonicalRequest, "utf-8"));
  const credentialScope = `${shortXDate}/${region}/${service}/request`;
  const stringToSign = `HMAC-SHA256\n${xDate}\n${credentialScope}\n${hashCanonical}`;

  // 计算最终签名
  const signKey = genSigningSecretKeyV4(sk, shortXDate, region, service);
  const signature = crypto
    .createHmac("sha256", signKey)
    .update(stringToSign)
    .digest("hex");

  const authorization = `HMAC-SHA256 Credential=${ak}/${credentialScope}, SignedHeaders=${signHeader}, Signature=${signature}`;

  // 发送请求
  const url = `${schema}://${host}${path}?${queryStr}`;
  try {
    const response = await axios.post(url, bodyStr, {
      headers: {
        Host: host,
        "X-Date": xDate,
        "X-Content-Sha256": xContentSha256,
        "Content-Type": contentType,
        Authorization: authorization,
      },
    });

    console.log(response.status, response.data);
  } catch (error) {
    if (error.response) {
      console.error("Error:", error.response.status, error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

doRequest();
```

## 封装 `signRequest`

```javascript
const axios = require("axios");
const crypto = require("crypto");

function hashSHA256(content) {
return crypto.createHash("sha256").update(content).digest("hex");
}

function hmacSHA256(key, data) {
return crypto.createHmac("sha256", key).update(data).digest();
}

function signStringEncoder(source) {
if (!source) return "";
return encodeURIComponent(source)
.replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase())
.replace(/%20/g, "%20"); // 和 Java 逻辑一致
}

function genSigningSecretKeyV4(secretKey, date, region, service) {
const kDate = hmacSHA256(Buffer.from(secretKey, "utf-8"), date);
const kRegion = hmacSHA256(kDate, region);
const kService = hmacSHA256(kRegion, service);
return hmacSHA256(kService, "request");
}

/\*\*

- 通用签名请求方法
- @param {Object} options
- @param {string} options.ak 火山引擎 AccessKey
- @param {string} options.sk 火山引擎 SecretKey
- @param {string} options.region 区域 (默认 cn-north-1)
- @param {string} options.service 服务名 (默认 cv)
- @param {string} options.host 请求域名
- @param {string} options.path 请求路径 (默认 "/")
- @param {string} options.action API Action
- @param {string} options.version API Version
- @param {string} [options.method] 请求方法 (默认 POST)
- @param {Object} [options.body] 请求体 (POST 用)
- @param {Object} [options.query] 额外 Query 参数
  \*/
  async function signRequest({
  ak,
  sk,
  region = "cn-north-1",
  service = "cv",
  host,
  path = "/",
  action,
  version,
  method = "POST",
  body = {},
  query = {},
  }) {
  const schema = "https";
  const date = new Date();

// 格式化时间
const xDate = date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"; // yyyyMMddTHHmmssZ
const shortXDate = xDate.substring(0, 8);

const bodyStr = method === "GET" ? "" : JSON.stringify(body);
const xContentSha256 = hashSHA256(Buffer.from(bodyStr, "utf-8"));
const contentType = "application/json";
const signHeader = "host;x-date;x-content-sha256;content-type";

// query 参数 (带 Action/Version)
const realQuery = {
...query,
Action: action,
Version: version,
};
const queryStr = Object.keys(realQuery)
.sort()
.map(k => `${signStringEncoder(k)}=${signStringEncoder(realQuery[k])}`)
.join("&");

// CanonicalRequest
const canonicalRequest =
`${method}\n${path}\n${queryStr}\n` +
`host:${host}\n` +
`x-date:${xDate}\n` +
`x-content-sha256:${xContentSha256}\n` +
`content-type:${contentType}\n\n` +
`${signHeader}\n` +
xContentSha256;

// StringToSign
const hashCanonical = hashSHA256(Buffer.from(canonicalRequest, "utf-8"));
const credentialScope = `${shortXDate}/${region}/${service}/request`;
const stringToSign = `HMAC-SHA256\n${xDate}\n${credentialScope}\n${hashCanonical}`;

// 签名
const signKey = genSigningSecretKeyV4(sk, shortXDate, region, service);
const signature = crypto
.createHmac("sha256", signKey)
.update(stringToSign)
.digest("hex");

const authorization =
`HMAC-SHA256 Credential=${ak}/${credentialScope}, SignedHeaders=${signHeader}, Signature=${signature}`;

const url = `${schema}://${host}${path}?${queryStr}`;

try {
const response = await axios({
url,
method,
data: bodyStr,
headers: {
Host: host,
"X-Date": xDate,
"X-Content-Sha256": xContentSha256,
"Content-Type": contentType,
Authorization: authorization,
},
});

    return response.data;

} catch (err) {
if (err.response) {
throw new Error(
`HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`
);
}
throw err;
}
}

// ================== 使用示例 ==================
(async () => {
try {
const data = await signRequest({
ak: "AK**\***",
sk: "**\*\***==",
host: "visual.volcengineapi.com",
action: "CVProcess",
version: "2022-08-31",
body: {
req_key: "xxx",
image_urls: ["******"],
prompt: "**\*\***",
},
});
console.log("Response:", data);
} catch (e) {
console.error("Error:", e.message);
}
})();

```
