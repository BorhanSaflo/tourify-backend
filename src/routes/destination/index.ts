import { NextFunction, Request, Response, Router } from "express";
import { and, count, desc, eq } from "drizzle-orm";
import db from "../../db";
import {
  destination,
  rating,
  review,
  savedDestination,
  user,
  view,
} from "../../db/schema";
import { NotFoundError } from "../../utils/errors";
import { getImageUrls, getPlaceId, takeUniqueOrThrow } from "../../utils";
import { authenticateUser } from "@/middlewares/authenticate-user";
const router = Router();

router.get("/:id", authenticateUser, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) throw new NotFoundError("Invalid destination ID");

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

    const [likes, dislikes, views] = await Promise.all([
      db
        .select({
          likes: count(rating.id),
        })
        .from(rating)
        .where(and(eq(rating.destinationId, id), eq(rating.like, true)))
        .then(takeUniqueOrThrow),
      db
        .select({
          dislikes: count(rating.id),
        })
        .from(rating)
        .where(and(eq(rating.destinationId, id), eq(rating.like, false)))
        .then(takeUniqueOrThrow),
      db
        .select({
          views: count(view.id),
        })
        .from(view)
        .where(eq(view.destinationId, id))
        .then(takeUniqueOrThrow),
    ]);

    res.status(200).json({
      ...destinationResult,
      ...views,
      ...likes,
      ...dislikes,
      images,
      reviewsQuery,
    });
  } catch (error) {
    next(error);
  }
});

async function handleRating(
  req: Request,
  res: Response,
  next: NextFunction,
  like: boolean
) {
  try {
    const destinationId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (isNaN(destinationId)) throw new NotFoundError("Invalid destination ID");

    const destinationQuery = await db
      .select()
      .from(destination)
      .where(eq(destination.id, destinationId));

    if (destinationQuery.length === 0)
      throw new NotFoundError("Destination not found.");

    const existingRating = await db
      .select()
      .from(rating)
      .where(
        and(eq(rating.destinationId, destinationId), eq(rating.userId, userId))
      );

    if (existingRating.length > 0) {
      // Toggle like or dislike based on the current state and the action
      const shouldDelete =
        (existingRating[0].like && like) || (!existingRating[0].like && !like);
      if (shouldDelete) {
        await db
          .delete(rating)
          .where(
            and(
              eq(rating.destinationId, destinationId),
              eq(rating.userId, userId)
            )
          );

        res.status(200).json({
          message: `Your ${
            like ? "like" : "dislike"
          } has been removed successfully.`,
        });
        return;
      } else {
        await db
          .update(rating)
          .set({ like })
          .where(
            and(
              eq(rating.destinationId, destinationId),
              eq(rating.userId, userId)
            )
          );

        res.status(200).json({
          message: `You have successfully ${
            like ? "liked" : "disliked"
          } this destination.`,
        });
        return;
      }
    }

    await db.insert(rating).values({
      destinationId,
      userId,
      like,
    });

    res.status(200).json({
      message: `You have successfully ${
        like ? "liked" : "disliked"
      } this destination.`,
    });
  } catch (error) {
    next(error);
  }
}

router.post("/:id/like", authenticateUser, (req, res, next) =>
  handleRating(req, res, next, true)
);

router.post("/:id/dislike", authenticateUser, (req, res, next) =>
  handleRating(req, res, next, false)
);

router.post("/:id/save", authenticateUser, async (req, res, next) => {
  try {
    const destinationId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (isNaN(destinationId)) throw new NotFoundError("Invalid destination ID");

    const savedDestinations = await db
      .select()
      .from(savedDestination)
      .where(
        and(
          eq(savedDestination.destinationId, destinationId),
          eq(savedDestination.userId, userId)
        )
      );

    if (savedDestinations.length > 0) {
      await db
        .delete(savedDestination)
        .where(
          and(
            eq(savedDestination.destinationId, destinationId),
            eq(savedDestination.userId, userId)
          )
        );
      res
        .status(200)
        .json({ message: "You have successfully unsaved this destination." });
      return;
    }

    await db.insert(savedDestination).values({
      destinationId,
      userId,
    });

    res
      .status(200)
      .json({ message: "You have successfully saved this destination." });
  } catch (error) {
    next(error);
  }
});

export default router;
