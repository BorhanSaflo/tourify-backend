import { Router } from "express";
import db from "../../db";
import {
  destination,
  rating,
  review,
  tag,
  user,
  view,
  destinationTag,
} from "../../db/schema";
import fs from "fs";
import { sql } from "drizzle-orm";
const router = Router();

// sample data
router.put("/", async (req, res, next) => {
  try {
    const usersTable = await db.select().from(user);

    if (usersTable.length > 0) {
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
      description: string;
      tags: string[];
    };

    const destinations: Destination[] = JSON.parse(
      fs.readFileSync("src/routes/seed/destinations.json", "utf-8")
    );
    await db.insert(destination).values(
      destinations.map((destination) => ({
        name: destination.city,
        country: destination.country,
        description: destination.description,
        timestamp: new Date(
          new Date().getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
      }))
    );

    const tags = [
      "Tropical",
      "Warm",
      "Cold",
      "Shopping",
      "Sports",
      "Dinning",
      "Low",
      "Medium",
      "High",
      "Car",
      "Bus",
      "Train",
      "Museums",
      "Parks",
      "Beaches",
    ];

    await db.insert(tag).values(tags.map((name) => ({ name })));

    const destinationTags: any = [];
    for (let i = 0; i < destinations.length; i++) {
      const destinationId = i + 1;
      const destination = destinations[i];
      const destinationTagsNames = destination.tags;

      // check if each tag exists
      for (let j = 0; j < destinationTagsNames.length; j++) {
        const tagId = tags.findIndex((tag) => tag === destinationTagsNames[j]);

        if (tagId === -1) continue;

        destinationTags.push({ destinationId, tagId: tagId + 1 });
      }
    }

    await db.insert(destinationTag).values(destinationTags);

    const usersData: any = JSON.parse(
      fs.readFileSync("src/routes/seed/users.json", "utf-8")
    );

    const users = usersData.map((user: any) => ({
      name: user.name,
      email: `${user.name.replace(" ", "").toLowerCase()}@gmail.com`,
      passwordHash: "password",
    }));

    await db.insert(user).values(users);

    const n = 3000;

    const getRandomInt = (num = destinations.length) => {
      return Math.floor(Math.random() * num);
    };

    const reviewsData: any = JSON.parse(
      fs.readFileSync("src/routes/seed/reviews.json", "utf-8")
    );

    const reviews: any = [];
    for (let i = 0; i < n; i++) {
      const destinationId = getRandomInt() + 1;
      const userId = getRandomInt(users.length) + 1;

      const existingReview = reviews.find(
        (review: any) =>
          review.destinationId === destinationId && review.userId === userId
      );

      if (existingReview) continue;

      const comment = reviewsData[getRandomInt(reviewsData.length)].review;
      //random timestamp in the last 30 days
      const timestamp = new Date(
        new Date().getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000
      );
      reviews.push({ destinationId, userId, comment, timestamp });
    }

    await db.insert(review).values(reviews);

    const ratings: any = [];
    for (let i = 0; i < n; i++) {
      const destinationId = getRandomInt() + 1;
      const userId = getRandomInt(users.length) + 1;

      const existingRating = ratings.find(
        (rating: any) =>
          rating.destinationId === destinationId && rating.userId === userId
      );

      if (existingRating) continue;

      const like = Math.random() > 0.5;
      ratings.push({ destinationId, userId, like });
    }

    await db.insert(rating).values(ratings);

    const views: any = [];
    for (let i = 0; i < n; i++) {
      const destinationId = getRandomInt() + 1;
      const userId = getRandomInt(users.length) + 1;

      const existingView = views.find(
        (view: any) =>
          view.destinationId === destinationId && view.userId === userId
      );

      if (existingView) continue;

      views.push({
        destinationId,
        userId,
        timestamp: new Date(
          new Date().getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
      });
    }

    await db.insert(view).values(views);

    res.send("Sample data created");
  } catch (error) {
    next(error);
  }
});

export default router;
