import { Router } from "express";
import db from "../../db";
import { destination } from "../../db/schema";
import { NotFoundError } from "../../utils/errors";
import { like } from "drizzle-orm";
const router = Router();

router.get("/", async (req, res, next) => {
    try {

    const { tags } = req.body;

    if (!tags) {
        throw new NotFoundError("Tags not found");
    }
    
    // search for destinations with that have all the tags
    // TODO: implement
    const destinations: any = []
        

    res.json({ destinations });

  } catch (error) {
    next(error);
  }
});

export default router;
