import express from "express";
import multerProvider from "multer";
import { decodeBarcode } from "./decodeBarcode.js";
import { s3Upload } from "./s3Upload.js";

const multer = multerProvider();
const router = express.Router();

router.use(async (req, res, next) => {
  res.respond = (code, message, data) =>
    res.status(code).send({
      code,
      message,
      ...data,
    });

  next();
});

router.post("/decode-barcode", multer.single("file"), decodeBarcode);
router.post("/s3", multer.single("file"), s3Upload);

export default router;
