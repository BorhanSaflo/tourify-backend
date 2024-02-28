import { Router } from "express";
import { count, desc, eq } from "drizzle-orm";
import db from "../../db";
import { destination, review, user } from "../../db/schema";
import { NotFoundError } from "../../utils/errors";
import { getImageUrl, getPlaceId } from "../../utils";
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
        googlePlaceId: destination.googlePlaceId,
      })
      .from(destination)
      .where(eq(destination.id, id));

    if (destinationQuery.length === 0) {
      throw new NotFoundError("Destination not found");
    }

    const destinationResult = destinationQuery[0];

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

    let imageUrl = null;
    let placeId = destinationResult.googlePlaceId;

    if (!placeId) {
      placeId = await getPlaceId(id);
      if (placeId) {
        await db
          .update(destination)
          .set({ googlePlaceId: placeId })
          .where(eq(destination.id, id));
      }
    }

    if (placeId) imageUrl = await getImageUrl(placeId);

    res.status(200).json({ ...destinationResult, imageUrl, reviewsQuery });
  } catch (error) {
    next(error);
  }
});

export default router;
