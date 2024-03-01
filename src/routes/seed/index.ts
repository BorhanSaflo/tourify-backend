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

    // create users
    await db.insert(user).values([
      { name: "User1", email: "user1@test.com", password: "password" },
      { name: "User2", email: "user2@test.com", password: "password" },
      { name: "User3", email: "user3@test.com", password: "password" },
      { name: "User4", email: "user4@test.com", password: "password" },
      { name: "User5", email: "user5@test.com", password: "password" },
    ]);

    type Destination = {
      city: string;
      country: string;
    };

    const destinations: Destination[] = JSON.parse(
      fs.readFileSync("src/routes/seed/destinations.json", "utf-8")
    );

    // create 20 random users
    let userList = [];
    for (let i = 0; i < 20; i++) {
      userList.push({
        name: `User${i + 6}`,
        email: `user${i + 1}`,
        password: "password",
      });
    }

    await db.insert(user).values(userList);

    for (let i = 0; i < destinations.length; i++) {
      const d = destinations[i];
      const result = await db.insert(destination).values({
        name: d.city,
        country: d.country,
        description: "This is a great place",
      });

      //select a random number of users
      const random = Math.floor(Math.random() * 20) + 1;

      for (let j = 0; j < random; j++) {
        const userId = Math.floor(Math.random() * 25) + 1;
        const like = Math.random() > 0.5;
        await db.insert(rating).values({
          destinationId: i + 1,
          userId,
          like,
        });

        //create reviews
        if (like) {
          await db.insert(review).values({
            destinationId: i + 1,
            userId,
            comment: "I love it",
          });
        } else {
          await db.insert(review).values({
            destinationId: i + 1,
            userId,
            comment: "I hate it",
          });
        }

        // create views
        await db.insert(view).values({
          destinationId: i + 1,
          userId,
        });
      }
    }

    res.send("Sample data created");
  } catch (error) {
    next(error);
  }
});

export default router;
