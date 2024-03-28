import { Router } from "express";
import db from "../../db";
import { destination, destinationTag, tag } from "../../db/schema";
import { NotFoundError } from "../../utils/errors";
import { eq, inArray, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const tagsQuery = req.query.tags as string;
    const tags = tagsQuery.split(",").map((tag) => tag.trim().toLowerCase());

    if (!tags || tags.length === 0) {
      throw new NotFoundError("Tags not found or empty");
    }

    const destinationsWithMostTags = await db
      .select({
        id: destination.id,
        name: destination.name,
        country: destination.country,
        tagCount: sql`COUNT(${destinationTag.tagId})`,
      })
      .from(destination)
      .innerJoin(
        destinationTag,
        eq(destination.id, destinationTag.destinationId)
      )
      .innerJoin(tag, eq(destinationTag.tagId, tag.id))
      .where(
        inArray(
          sql`LOWER(${tag.name})`,
          tags.map((tag) => tag.toLowerCase())
        )
      )
      .groupBy(destination.id)
      .orderBy(sql`COUNT(${destinationTag.tagId}) DESC`)
      .execute();

    if (destinationsWithMostTags.length === 0) {
      throw new NotFoundError(
        "No destinations found matching the provided tags"
      );
    }

    res.json(destinationsWithMostTags);
  } catch (error) {
    next(error);
  }
});

export default router;
