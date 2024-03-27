import { Router } from "express";
import db from "../../db";
import { destination } from "../../db/schema";
import { NotFoundError } from "../../utils/errors";
import { like } from "drizzle-orm";
import { getDestinationImages } from "../../utils";
const router = Router();

router.get("/:query", async (req, res, next) => {
  const { query } = req.params;

  try {
    if (!query) throw new NotFoundError("No query provided");

    const result = await db
      .select({
        id: destination.id,
        name: destination.name,
        country: destination.country,
        description: destination.description,
      })
      .from(destination)
      .where(like(destination.name, `%${query}%`))
      .limit(10);

    if (result.length === 0) res.status(200).json([]);

    const payload = await getDestinationImages(result);

    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
