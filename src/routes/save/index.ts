import { Router } from "express";
import db from "../../db";
import { savedDestination } from "../../db/schema";
import { NotFoundError } from "../../utils/errors";
import { authenticateUser } from "@/middlewares/authenticate-user";
import { and, eq } from "drizzle-orm";
const router = Router();

router.post("/:destinationID", authenticateUser, async (req, res, next) => {
  try {
    const { destinationID } = req.params;
    if (!destinationID) throw new NotFoundError("No destination ID provided");
    if (isNaN(parseInt(destinationID)))
      throw new NotFoundError("Invalid destination ID");

    const { id } = req.user;

    const savedDestinations = await db
      .select()
      .from(savedDestination)
      .where(
        and(
          eq(savedDestination.destinationId, parseInt(destinationID)),
          eq(savedDestination.userId, id)
        )
      );

    if (savedDestinations.length > 0) {
      await db
        .delete(savedDestination)
        .where(
          and(
            eq(savedDestination.destinationId, parseInt(destinationID)),
            eq(savedDestination.userId, id)
          )
        );
      res.status(200).json({ message: "Unsaved" });
      return;
    }

    await db.insert(savedDestination).values({
      destinationId: parseInt(destinationID),
      userId: id,
    });

    res.status(200).json({ message: "Saved" });
  } catch (error) {
    next(error);
  }
});

export default router;
