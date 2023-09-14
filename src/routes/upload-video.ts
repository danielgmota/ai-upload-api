import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import path from "node:path";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { prisma } from "../lib/prisma";

const LIMIT_FASTIFY_1MB = 1_048_576;
const pump = promisify(pipeline);

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: LIMIT_FASTIFY_1MB * 25, //25mb
    },
  });

  app.post("/videos", async (request, reply) => {
    const data = await request.file();

    if (!data) return reply.status(400).send({ error: "Missing file" });

    const extension = path.extname(data.fieldname);

    if (extension !== "mp3")
      return reply.status(400).send({ error: "Invalid file extension" });

    const fileBaseName = path.basename(data.fieldname, extension);
    const fileUploadName = `${fileBaseName}-${randomUUID}${extension}`;

    const uploadDestination = path.resolve(
      __dirname,
      "../../tmp",
      fileUploadName
    );

    await pump(data.file, fs.createWriteStream(uploadDestination));

    const video = await prisma.video.create({
      data: {
        name: data.fieldname,
        path: uploadDestination,
      },
    });

    return { video };
  });
}
