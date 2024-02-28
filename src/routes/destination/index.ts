import { Router } from "express";
import { count, desc, eq } from "drizzle-orm";
import db from "../../db";
import { destination, review, user } from "../../db/schema";
import { NotFoundError } from "../../utils/errors";
const router = Router();

router.get("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    throw new NotFoundError("Destination not found");
  }

  try {
    const destinationQuery = await db
      .select({
        id: destination.id,
        name: destination.name,
        country: destination.country,
        description: destination.description,
      })
      .from(destination)
      .where(eq(destination.id, id));

    if (destinationQuery.length === 0) {
      throw new NotFoundError("Destination not found");
    }

    const reviewsQuery = await db
      .select({
        id: review.id,
        comment: review.comment,
        timestamp: review.timestamp,
        user: {
          id: user.id,
          name: user.name,
        },
      })
      .from(review)
      .innerJoin(user, eq(review.userId, user.id))
      .where(eq(review.destinationId, id))
      .orderBy(desc(review.timestamp));

    res.status(200).json({ ...destinationQuery[0], reviewsQuery });
  } catch (error) {
    next(error);
  }
});

export default router;
