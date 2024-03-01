import { Router } from "express";
import { count, desc, eq, gte } from "drizzle-orm";
import db from "../../db";
import { destination, rating, view } from "../../db/schema";
import { getImageUrl, getPlaceId } from "../../utils";
const router = Router();

const getDestinationImages = async (destinations: any[]) => {
  return await Promise.all(
    destinations.map(async (destination) => {
      const placeId = await getPlaceId(destination.id);
      if (!placeId) return destination;
      const thumbnail = await getImageUrl(placeId, 400, 400);
      return { ...destination, thumbnail };
    })
  );
};

router.get("/trending", async (req, res, next) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  try {
    // Most viewed destinations from the last week
    const trending = await db
      .select({
        id: destination.id,
        name: destination.name,
        country: destination.country,
        views: count(view.destinationId),
      })
      .from(view)
      .innerJoin(destination, eq(view.destinationId, destination.id))
      .where(gte(view.timestamp, oneWeekAgo))
      .groupBy(view.destinationId)
      .orderBy(desc(count(view.destinationId)), destination.id)
      .limit(10);

    const payload = await getDestinationImages(trending);

    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/most-viewed", async (req, res, next) => {
  try {
    const result = await db
      .select({
        id: destination.id,
        name: destination.name,
        views: count(view.destinationId),
      })
      .from(destination)
      .innerJoin(view, eq(destination.id, view.destinationId))
      .groupBy(destination.id)
      .orderBy(desc(count(view.destinationId)), destination.id)
      .limit(10);

    const payload = await getDestinationImages(result);

    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/most-liked", async (req, res, next) => {
  try {
    const result = await db
      .select({
        id: destination.id,
        name: destination.name,
        likes: count(rating.like),
      })
      .from(destination)
      .innerJoin(rating, eq(destination.id, rating.destinationId))
      .where(eq(rating.like, true))
      .groupBy(destination.id)
      .orderBy(desc(count(rating.like)), destination.id)
      .limit(10);

    const payload = await getDestinationImages(result);

    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
