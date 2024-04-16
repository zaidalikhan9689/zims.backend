import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function s3Upload({ body, file }, { respond }) {
  const key = crypto.randomUUID();
  const params = {
    Bucket: "zaid-project-media",
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ContentDisposition: `inline; filename="${file.originalname}"`,
  };

  try {
    const client = new S3Client({// authenctaication 
      credentials: {
        accessKeyId: "AKIA6GBMFDZOSVGSVVS6",
        secretAccessKey: "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",
      },
      region: "ap-south-1",
    });

    const putObjectCommand = new PutObjectCommand(params);// create command to upload file using prams line 5
    client.send(putObjectCommand);

    return respond(200, "Success", {
      url: `https://zaid-project-media.s3.ap-south-1.amazonaws.com/${key}`,
      key,
      mimetype: file.mimetype,
      size: file.size,
    });
  } catch (error) {
    return respond(500, error.message);
  }
}
