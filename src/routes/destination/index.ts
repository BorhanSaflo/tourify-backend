import { Router } from "express";
import { count, desc, eq } from "drizzle-orm";
import db from "../../db";
import { destination, review, user, view } from "../../db/schema";
import { NotFoundError } from "../../utils/errors";
import { getImageUrls, getPlaceId, takeUniqueOrThrow } from "../../utils";
import { authenticateUser } from "@/middlewares/authenticate-user";
const router = Router();

router.get("/:id", authenticateUser, async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) throw new NotFoundError("Destination not found");

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

    if (destinationQuery.length === 0)
      throw new NotFoundError("Destination not found");

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

    let images: string[] = [];
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

    if (placeId) images = await getImageUrls(placeId);

    const likesAndDislikes = await db
      .select({
        likes: count(review.id),
        dislikes: count(review.id),
      })
      .from(review)
      .where(eq(review.destinationId, id))
      .then(takeUniqueOrThrow);

    const views = await db
      .select({
        views: count(review.id),
      })
      .from(view)
      .where(eq(view.destinationId, id))
      .then(takeUniqueOrThrow);

    res
      .status(200)
      .json({
        ...destinationResult,
        ...likesAndDislikes,
        ...views,
        images,
        reviewsQuery,
      });
  } catch (error) {
    next(error);
  }
});

export default router;
