import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { createReadStream } from "fs";

export async function createTranscription(app: FastifyInstance) {
  app.get("/videos/:videoid/transcription", async (req) => {
    const paramSchema = z.object({
      videoId: z.string().uuid(),
    });

    const { videoId } = paramSchema.parse(req.params);

    const bodySchema = z.object({
      prompt: z.string().uuid(),
    });

    const { prompt } = bodySchema.parse(req.body);

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    });

    const videoPath = video.path;

    // const audioReadStream = createReadStream(videoPath);

    return { videoId, prompt, videoPath };
  });
}
