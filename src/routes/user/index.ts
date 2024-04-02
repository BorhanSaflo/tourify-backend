import { Router } from "express";

import { authenticateUser } from "@/middlewares/authenticate-user";
import db from "@/db";
import { destination, rating, savedDestination } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getDestinationImages } from "@/utils";

const router = Router();

router.get("/info", authenticateUser, async (req, res, next) => {
  try {
    const { id, email, name } = req.user;

    res.status(200).send({
      data: {
        id,
        email,
        name,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/saved", authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const savedDestinations = await db
      .select({
        id: savedDestination.destinationId,
        name: destination.name,
      })
      .from(savedDestination)
      .innerJoin(
        destination,
        eq(savedDestination.destinationId, destination.id)
      )
      .where(eq(savedDestination.userId, userId));

    if (savedDestinations.length === 0) {
      return res.status(200).send({
        data: [],
      });
    }

    const payload = await getDestinationImages(savedDestinations);

    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/liked", authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const likedDestinations = await db
      .select({
        id: destination.id,
        name: destination.name,
      })
      .from(destination)
      .innerJoin(rating, eq(rating.destinationId, destination.id))
      .where(and(eq(rating.userId, userId), eq(rating.like, true)));

    if (likedDestinations.length === 0) {
      return res.status(200).send({
        data: [],
      });
    }

    const payload = await getDestinationImages(likedDestinations);

    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
});

router.get("/disliked", authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const dislikedDestinations = await db
      .select({
        id: destination.id,
        name: destination.name,
      })
      .from(destination)
      .innerJoin(rating, eq(rating.destinationId, destination.id))
      .where(and(eq(rating.userId, userId), eq(rating.like, false)));

    if (dislikedDestinations.length === 0) {
      return res.status(200).send({
        data: [],
      });
    }

    const payload = await getDestinationImages(dislikedDestinations);

    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
