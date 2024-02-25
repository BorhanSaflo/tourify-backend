import { Router } from "express";
import { eq } from "drizzle-orm";
import db from "../../db";
import { destination } from "../../db/schema";
import { NotFoundError } from "../../utils/errors";
const router = Router();

router.get("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    throw new NotFoundError("Destination not found");
  }

  try {
    const result = await db
      .select({
        name: destination.name,
        country: destination.country,
        description: destination.description,
      })
      .from(destination)
      .where(eq(destination.id, id));

    res.status(200).json(result[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
