import express from "express";
import multerProvider from "multer";
import { decodeBarcode } from "./decodeBarcode.js";

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

export default router;
