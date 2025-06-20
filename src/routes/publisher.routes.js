import express from "express";
import {findPublishersByAuthor} from "../controller/publisher.controller.js";

const router = express.Router();

router.get("/publishers/author/:author", findPublishersByAuthor);

export default router;