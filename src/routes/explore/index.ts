import { Router } from "express";
import db from "../../db";
import { destination, destinationTag, tag } from "../../db/schema";
import { NotFoundError } from "../../utils/errors";
import { count, desc, eq, inArray, sql } from "drizzle-orm";
import { getDestinationImages } from "@/utils";
import { authenticateUser } from "@/middlewares/authenticate-user";

const router = Router();

router.get("/", authenticateUser, async (req, res, next) => {
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
      .leftJoin(
        destinationTag,
        eq(destination.id, destinationTag.destinationId)
      )
      .leftJoin(tag, eq(destinationTag.tagId, tag.id))
      .where(inArray(sql`LOWER(tag.name)`, tags))
      .groupBy(destination.id)
      .orderBy(desc(count(tag.id)))
      .limit(5);

    if (destinationsWithMostTags.length === 0) {
      throw new NotFoundError(
        "No destinations found matching the provided tags"
      );
    }

    const payload = await getDestinationImages(destinationsWithMostTags);

    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
