import { Router } from "express";
import db from "../../db";
import { destination, rating, user, view } from "../../db/schema";
import { CustomError } from "../../utils/errors";
const router = Router();

// sample data
router.put("/", async (req, res, next) => {
  try {
    const users = await db.select().from(user);
    if (users.length > 0) {
        throw new CustomError("Sample data already exists", 400);
    }

    // create users
    await db.insert(user).values([
      { name: "User1", email: "user1@test.com", password: "password" },
      { name: "User2", email: "user2@test.com", password: "password" },
      { name: "User3", email: "user3@test.com", password: "password" },
    ]);

    await db.insert(destination).values([
      {
        name: "Paris",
        country: "France",
        description: "The city of love",
      },
      {
        name: "Tokyo",
        country: "Japan",
        description: "The city of the future",
      },
      {
        name: "New York",
        country: "USA",
        description: "The city that never sleeps",
      },
      {
        name: "Sydney",
        country: "Australia",
        description: "The land down under",
      },
      {
        name: "London",
        country: "UK",
        description: "The city of the queen",
      },
    ]);

    await db.insert(view).values([
      { destinationId: 1, userId: 1 },
      { destinationId: 1, userId: 2 },
      { destinationId: 1, userId: 3 },
      { destinationId: 2, userId: 1 },
      { destinationId: 2, userId: 2 },
      { destinationId: 3, userId: 1 },
      { destinationId: 3, userId: 2 },
      { destinationId: 3, userId: 3 },
      { destinationId: 4, userId: 1 },
      { destinationId: 5, userId: 1 },
    ]);

    await db.insert(rating).values([
      { destinationId: 1, userId: 1, like: true },
      { destinationId: 1, userId: 2, like: true },
      { destinationId: 1, userId: 3, like: true },
      { destinationId: 2, userId: 1, like: true },
      { destinationId: 2, userId: 2, like: true },
      { destinationId: 3, userId: 1, like: true },
      { destinationId: 3, userId: 2, like: true },
      { destinationId: 3, userId: 3, like: true },
      { destinationId: 4, userId: 1, like: true },
      { destinationId: 5, userId: 1, like: true },
    ]);

    res.send("Sample data created");
  } catch (error) {
    next(error);
  }
});

export default router;
