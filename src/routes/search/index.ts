import { Router } from "express";
import db from "../../db";
import { destination } from "../../db/schema";
import { NotFoundError } from "../../utils/errors";
import { like } from "drizzle-orm";
const router = Router();

router.get("/search", async (req, res, next) => {
  const { query } = req.query;

  try {
    if (!query) throw new NotFoundError("No query provided");

    const result = await db
      .select({
        name: destination.name,
        country: destination.country,
        description: destination.description,
      })
      .from(destination)
      .where(like(destination.name, `%${query}%`))
      .limit(10);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
