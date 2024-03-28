import { Router } from "express";
import db from "../../db";
import { destination, rating, review, tag, user, view, destinationTag } from "../../db/schema";
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
      await db.delete(tag);
      await db.delete(destinationTag);

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

    // Q1: type of climate: Tropical, Warm, Cold
    // Q2: What type of activties: Shopping, sports, Dinning
    // Q3: WHat is your budget range: Low, Medium, High

    const tags = ["Tropical", "Warm", "Cold", "Shopping", "Sports", "Dinning", "Low", "Medium", "High"];

    await db.insert(tag).values(tags.map((name) => ({ name })));

    // create destination tags
    const destinationTags: any = [];
// choose random tags for each destination
    for (let i = 0; i < destinations.length; i++) {
      const destinationId = i + 1;
      const tagIds: any = [];

      for (let j = 0; j < 3; j++) {
        const tagId = getRandomInt(tags.length) + 1;

        if (tagIds.includes(tagId)) continue;

        tagIds.push(tagId);
      }

      destinationTags.push(
        ...tagIds.map((tagId: any) => ({ destinationId, tagId }))
      );
    }

    await db.insert(destinationTag).values(destinationTags);

    res.send("Sample data created");
  } catch (error) {
    next(error);
  }
});

export default router;
