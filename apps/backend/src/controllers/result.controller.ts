import type { Request, Response } from "express";
import { listQuerySchema,idParamSchema } from "@speako/common/common";
import { prisma } from "@speako/db/client";

const DEFAULT_LIMIT = 10;

// GET /results?limit=10&cursor=<drillId>
export async function getResults(req: Request, res: Response) {
  try {
    const userId = req.userId;
    // Prisma treats `userId: undefined` as "no filter", so never let it through.
    if (!userId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid query.",
      });
      return;
    }

    const { limit = DEFAULT_LIMIT, cursor } = parsed.data;

    const rows = await prisma.drill.findMany({
      where: {
        userId,
        result: {
          isNot: null,
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      // Fetch one extra row to detect whether another page exists.
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      select: {
        id: true,
        mode: true,
        prompt: true,
        durationSec: true,
        createdAt: true,

        result: {
          select: {
            id: true,
            scores: true,
            createdAt: true,
          },
        },
      },
    });

    const hasMore = rows.length > limit;
    const results = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? (results[results.length - 1]?.id ?? null) : null;

    res.setHeader("Cache-Control", "private, no-store");
    res.status(200).json({ results, nextCursor });
  } catch (error) {
    console.error("getResults failed", error);
    res.status(500).json({ message: "Cannot display results" });
  }
}

// GET /results/:id  (:id is the Drill ID)
export async function getResultsById(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success) {
      // Same response as "not found" so IDs can't be probed.
      res.status(404).json({ message: "Speaking result not found." });
      return;
    }

    const result = await prisma.drill.findFirst({
      where: {
        id: parsed.data.id,
        userId,
        result: {
          isNot: null,
        },
      },
      select: {
        id: true,
        mode: true,
        prompt: true,
        durationSec: true,
        createdAt: true,

        result: {
          select: {
            id: true,
            transcript: true,
            scores: true,
            metrics: true,
            tips: true,
            fillerEvents: true,
            createdAt: true,
          },
        },
      },
    });

    if (!result) {
      res.status(404).json({ message: "Speaking result not found." });
      return;
    }

    res.setHeader("Cache-Control", "private, no-store");
    res.status(200).json({ result });
  } catch (error) {
    console.error("getResultsById failed", error);
    res.status(500).json({ message: "Cannot display results" });
  }
}