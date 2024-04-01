import { Router } from "express";
import { count, desc, eq, gte } from "drizzle-orm";
import db from "../../db";
import { destination, rating, view } from "../../db/schema";
import { getDestinationImages } from "../../utils";
import { authenticateUser } from "@/middlewares/authenticate-user";
import { NotFoundError } from "@/utils/errors";
const router = Router();

router.get("/featured", authenticateUser, async (req, res, next) => {
  try {
    const destinationCountQuery = await db
      .select({
        count: count(destination.id),
      })
      .from(destination);

    if (destinationCountQuery.length === 0) {
      throw new NotFoundError("No destinations found");
    }

    const destinationCount = destinationCountQuery[0].count;

    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const seed = (day + month + year) % destinationCount;

    const result = await db
      .select({
        id: destination.id,
        name: destination.name,
        country: destination.country,
      })
      .from(destination)
      .limit(1)
      .offset(seed);

    const payload = await getDestinationImages(result);

    res.status(200).json(payload[0]);
  } catch (error) {
    next(error);
  }
});

router.get("/trending", authenticateUser, async (req, res, next) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  try {
    // Most viewed destinations from the last week
    const trending = await db
      .select({
        id: destination.id,
        name: destination.name,
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

router.get("/most-viewed", authenticateUser, async (req, res, next) => {
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

router.get("/most-liked", authenticateUser, async (req, res, next) => {
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
