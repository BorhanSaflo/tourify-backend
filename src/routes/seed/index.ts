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
        description: "This is a sample description.",
      }))
    );

    const n = 5000;

    let userList = [];
    for (let i = 0; i < n; i++) {
      userList.push({
        name: `User${i + 1}`,
        email: `user${i + 1}@example.com`,
        passwordHash: "password",
      });
    }

    await db.insert(user).values(userList);

    const getRandomInt = (num = destinations.length) => {
      return Math.floor(Math.random() * num);
    };

    const ratings: any = [];
    for (let i = 0; i < n; i++) {
      const destinationId = getRandomInt() + 1;
      const userId = getRandomInt(1000) + 1;

      const existingRating = ratings.find(
        (rating: any) =>
          rating.destinationId === destinationId && rating.userId === userId
      );

      if (existingRating) continue;

      const like = Math.random() > 0.5;
      ratings.push({ destinationId, userId, like });
    }

    await db.insert(rating).values(ratings);

    const reviews: any = [];
    for (let i = 0; i < n; i++) {
      const destinationId = getRandomInt() + 1;
      const userId = getRandomInt(1000) + 1;

      const existingReview = reviews.find(
        (review: any) =>
          review.destinationId === destinationId && review.userId === userId
      );

      if (existingReview) continue;

      const comment = "This place is awesome!";
      reviews.push({ destinationId, userId, comment });
    }

    await db.insert(review).values(reviews);

    const views: any = [];
    for (let i = 0; i < n; i++) {
      const destinationId = getRandomInt() + 1;
      const userId = getRandomInt(1000) + 1;

      const existingView = views.find(
        (view: any) =>
          view.destinationId === destinationId && view.userId === userId
      );

      if (existingView) continue;

      views.push({ destinationId, userId });
    }

    await db.insert(view).values(views);

    res.send("Sample data created");
  } catch (error) {
    next(error);
  }
});

export default router;
