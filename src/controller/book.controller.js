import {sequelize} from "../config/database.js";
import {Author, Book, Publisher} from "../model/index.js";

export const addBook = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {isbn, title, publisher, authors} = req.body;
        const existingBook = await Book.findByPk(isbn);
        if (existingBook) {
            await t.rollback();
            return res.status(409).json({
                error: `Book with ISBN ${isbn} already exists`
            })
        }
        // Create or find the publisher
        let publisherRecord = await Publisher.findByPk(publisher);
        if (!publisherRecord) {
            publisherRecord = await Publisher.create({publisherName: publisher}, {transaction: t});
        }
        // Process authors
        const authorRecords = [];
        for (const author of authors) {
            let authorRecord = await Author.findByPk(author.name);
            if (!authorRecord) {
                authorRecord = await Author.create({name: author.name, birthDate: new Date(author.birthDate)}, {transaction: t});
            }
            authorRecords.push(authorRecord);
        }
        // Create the book without association
        const book = await Book.create({isbn, title, publisher}, {transaction: t});

        // Associate authors
        await book.setAuthors(authorRecords, {transaction: t});

        await t.commit();
        return res.sendStatus(201);
    } catch (e) {
        await t.rollback();
        console.error('Error adding book:', e);
        return res.status(500).json({
            error: 'Failed to add book'
        })
    }
}