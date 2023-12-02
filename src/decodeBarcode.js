import extractBarcode from "zaid-extract-barcode";

export async function decodeBarcode({ body, file }, { respond }) {
  try {
    const data = await extractBarcode(
      file.buffer,
      "744bc19a-4175-4a31-8146-03b02a730cd5"
    );
    return respond(200, "Success", { data });
  } catch (error) {
    return respond(500, error.message);
  }
}
