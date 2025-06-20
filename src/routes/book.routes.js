import express from "express";
import {
    addBook,
    findBookByIsbn,
    findBooksByAuthor, findBooksByPublisher,
    removeBook,
    updateBookTitle
} from "../controller/book.controller.js";

const router = express.Router();

router.post("/book", addBook);
router.get("/book/:isbn", findBookByIsbn);
router.delete("/book/:isbn", removeBook);
router.patch("/book/:isbn/title/:title", updateBookTitle);
router.get("/books/author/:author", findBooksByAuthor);
router.get("/books/publisher/:publisher", findBooksByPublisher);

export default router;