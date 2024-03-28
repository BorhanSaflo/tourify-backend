import { Router } from "express";

import { authenticateUser } from "@/middlewares/authenticate-user";
import db from "@/db";
import { destination, savedDestination } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    const { id } = req.user;
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
      .where(eq(savedDestination.userId, id));

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

export default router;
