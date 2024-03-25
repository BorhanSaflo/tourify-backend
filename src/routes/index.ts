import { Router } from "express";
import auth from "./auth";
import destinations from "./destinations";
import destination from "./destination";
import seed from "./seed";
import search from "./search";
import user from "./user";
const router = Router();

router.use("/auth", auth);
router.use("/destination", destination);
router.use("/destinations", destinations);
router.use("/seed", seed);
router.use("/search", search);
router.use("/user", user);

export default router;
