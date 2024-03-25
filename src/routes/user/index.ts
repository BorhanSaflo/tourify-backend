import { Router } from "express";

import { authenticateUser } from "@/middlewares/authenticate-user";

const router = Router();

router.get("/info", authenticateUser, async (req, res, next) => {
  try {
    const { id, email, name } = req.user;
    
    res.status(200).send({
      data: {
        id,
        email,
        name,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
