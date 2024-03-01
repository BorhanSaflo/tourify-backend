import { Router } from "express";
import db from "../../db";
import { destination, rating, review, user, view } from "../../db/schema";
import fs from "fs";
import { sql } from "drizzle-orm";
const router = Router();

// sample data
router.put("/", async (req, res, next) => {
  try {
    const users = await db.select().from(user);

    if (users.length > 0) {
      // delete all data
      await db.delete(view);
      await db.delete(rating);
      await db.delete(review);
      await db.delete(destination);
      await db.delete(user);

      // reset autoincrement
      db.run(sql`DELETE FROM sqlite_sequence`);
      console.log("All data deleted");
    }

    type Destination = {
      city: string;
      country: string;
    };

    const destinations: Destination[] = JSON.parse(
      fs.readFileSync("src/routes/seed/destinations.json", "utf-8")
    );

    await db.insert(destination).values(
      destinations.map((destination) => ({
        name: destination.city,
        country: destination.country,
      }))
    );

    let userList = [];
    for (let i = 0; i < 100; i++) {
      userList.push({
        name: `User${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: "password",
      });
    }

    await db.insert(user).values(userList);
    const n = 100

    const ratings = [];
    for (let i = 0; i < n; i++) {
      const destinationId = i + 1;
      const userId = i + 1;
      const like = Math.random() > 0.5;
      ratings.push({ destinationId, userId, like });
    }

    await db.insert(rating).values(ratings);

    const reviews = [];
    for (let i = 0; i < n; i++) {
      const destinationId = i + 1;
      const userId = i + 1;
      const comment = "This place is awesome!";
      reviews.push({ destinationId, userId, comment });
    }

    await db.insert(review).values(reviews);

    const views = [];
    for (let i = 0; i < n; i++) {
      const destinationId = i + 1;
      const userId = i + 1;
      views.push({ destinationId, userId });
    }

    await db.insert(view).values(views);

    res.send("Sample data created");
  } catch (error) {
    next(error);
  }
});

export default router;
