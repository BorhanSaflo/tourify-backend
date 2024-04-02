import { Router } from "express";
import db from "../../db";
import { destination, destinationTag, tag } from "../../db/schema";
import { NotFoundError } from "../../utils/errors";
import { eq, inArray, sql } from "drizzle-orm";
import { getDestinationImages } from "@/utils";

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
        description: destination.description,
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
      .limit(5)
      .execute();

    if (destinationsWithMostTags.length === 0) {
      throw new NotFoundError(
        "No destinations found matching the provided tags"
      );
    }

    const payload = await getDestinationImages(destinationsWithMostTags);

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
