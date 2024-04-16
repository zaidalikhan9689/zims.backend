import extractBarcode from "extract-barcode";

export async function decodeBarcode({ body, file }, { respond }) {
  try {
    const data = await extractBarcode(
      file.buffer,
      "89824212-06bf-430d-8cb6-20cb3a20627d"
    );
    return respond(200, "Success", { data });
  } catch (error) {
    return respond(500, error.message);
  }
}
