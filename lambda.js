import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import https from "https";

const dynamo = DynamoDBDocument.from(new DynamoDB());
const TableName = "zaid";
const barcodeApiUrl = (barcode) =>
  `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

const currencies = ["INR", "USD", "GBP", "CAD"];
const currencyConverterApiUrl =
  "https://f44dxfgsya.execute-api.eu-west-2.amazonaws.com/default/convert";

function httpRequest(url, method = "GET", data = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = https.request(url, options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        resolve(responseData);
      });
    });
    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

export const handler = async (event) => {
  let body;
  let statusCode = "200";
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  };

  try {
    switch (event.httpMethod) {
      case "DELETE":
        body = await dynamo.delete(JSON.parse(event.body));
        break;
      case "GET":
        body = await dynamo.scan({ TableName });

        break;
      case "POST":
        const parsedBody = JSON.parse(event.body);
        let barcodeInfo = await httpRequest(barcodeApiUrl(parsedBody.barcode));
        barcodeInfo = JSON.parse(barcodeInfo);

        const promises = currencies.map((currency) => {
          return httpRequest(currencyConverterApiUrl, "POST", {
            source_currency: "EUR",
            amount: parsedBody.price,
            target_currency: currency,
          });
        });

        const currencyConversionresults = await Promise.all(promises);

        const currencyData = {};

        currencyConversionresults.forEach((entry) => {
          const obj = JSON.parse(entry);
          currencyData[obj.target_currency] = obj.converted_amount;
        });

        body = await dynamo.put({
          TableName,
          Item: {
            ...parsedBody,
            ...currencyData,
            ingredients:
              (
                barcodeInfo.product?.ingredients_text_en ||
                barcodeInfo.product?.ingredients_text
              )?.split(", ") || [],
            image:
              barcodeInfo.product?.image_url ||
              barcodeInfo.product?.image_front_url ||
              null,
            name:
              barcodeInfo.product?.product_name ||
              barcodeInfo.product?.product_name_en ||
              barcodeInfo.product?.generic_name_en ||
              null,
            brand: barcodeInfo.product?.brands || null,
            quantity: barcodeInfo.product?.quantity || null,
            expiry: barcodeInfo.product?.expiration_date || null,
            nutrient: barcodeInfo.product?.nutrient_levels || null,
          },
        });

        break;
      case "PUT":
        body = await dynamo.update(JSON.parse(event.body));
        break;
      default:
        throw new Error(`Unsupported method`);
    }
  } catch (err) {
    statusCode = "400";
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
