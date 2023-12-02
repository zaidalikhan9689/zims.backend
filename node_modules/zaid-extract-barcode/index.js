import CloudmersiveBarcodeapiClient from "cloudmersive-barcodeapi-client";

export default async function extractBarcode(imageBuffer, apiKey) {
  var defaultClient = CloudmersiveBarcodeapiClient.ApiClient.instance;

  var Apikey = defaultClient.authentications["Apikey"];
  Apikey.apiKey = apiKey;

  var apiInstance = new CloudmersiveBarcodeapiClient.BarcodeScanApi();

  return new Promise((resolve, reject) => {
    //! Callback function
    const callback = (error, data, response) => {
      if (error) {
        reject(error);
      } else {
        if (data.Successful) resolve(data);
        else reject(new Error("Unable to detect Barcode"));
      }
    };

    //! Call the API method
    apiInstance.barcodeScanImage(imageBuffer, callback);
  });
}
