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
                authorRecord = await Author.create({
                    name: author.name,
                    birthDate: new Date(author.birthDate)
                }, {transaction: t});
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

export const findBookByIsbn = async (req, res) => {
    try {
        const {isbn} = req.params;
        const book = await Book.findByPk(isbn, {
            include: [
                // {model: Author, as: 'authors'}
                {model: Author, as: 'authors', through: {attributes: []}}
            ]
        });
        if (book) {
            // const response = {
            //     isbn: book.isbn,
            //     title: book.title,
            //     publisher: book.publisher,
            //     authors: book.authors.map(author => ({
            //         name: author.name,
            //         birthDate: author.birthDate
            //     }))
            // }
            // return res.json(response);
            return res.json(book);
        } else {
            return res.status(404).json({
                error: `Book with ISBN ${isbn} not found`
            })
        }
    } catch (e) {
        console.error('Error finding book by ISBN', e);
        return res.status(500).json({
            error: 'Failed to find book'
        })
    }
}

export const removeBook = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {isbn} = req.params;
        const book = await Book.findByPk(isbn, {
            include: [
                {model: Author, as: 'authors', through: {attributes: []}}
            ],
            transaction: t
        });
        if (!book) {
            await t.rollback();
            return res.status(404).json({
                error: `Book with ISBN ${isbn} not found`
            })
        }
        await book.destroy({transaction: t});
        await t.commit();
        return res.json(book);
    } catch (e) {
        await t.rollback();
        console.error('Error removing book', e);
        return res.status(500).json({
            error: 'Failed to remove book'
        })
    }
}

export const updateBookTitle = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {isbn, title} = req.params;
        const book = await Book.findByPk(isbn, {
            include: [
                {model: Author, as: 'authors', through: {attributes: []}}
            ],
            transaction: t
        });
        if (!book) {
            await t.rollback();
            return res.status(404).json({
                error: `Book with ISBN ${isbn} not found`
            })
        }
        book.title = title;
        await book.save({transaction: t});
        await t.commit();
        return res.json(book);
    } catch (e) {
        await t.rollback();
        console.error('Error updating book', e);
        return res.status(500).json({
            error: 'Failed to update book'
        })
    }
}

export const findBooksByAuthor = async (req, res) => {
    try {
        const {author} = req.params;
        // const books = await Book.findAll({
        //     include: [
        //         {
        //             model: Author, as: 'authors',
        //             where: {name: author},
        //             through: {attributes: []}
        //         }
        //     ]
        // });
        // return res.json(book);
        const authorRecord = await Author.findByPk(author);
        if (!authorRecord) {
            return res.status(404).json({error: "Author not found"});
        }
        const books = await authorRecord.getBooks({
            include: [
                {model: Author, as: 'authors', through: {attributes: []}}
            ],
        })
        const response = books.map(book => ({
                isbn: book.isbn,
                title: book.title,
                publisher: book.publisher,
                authors: book.authors.map(author => ({
                    name: author.name,
                    birthDate: author.birthDate
                }))
            }
        ))
        return res.json(response);
    } catch (e) {
        console.error('Error finding books by author', e);
        return res.status(500).json({
            error: 'Failed to find books by author'
        })
    }
}

export const findBooksByPublisher = async (req, res) => {
    try {
        const {publisher} = req.params;
        if (!(await Publisher.findByPk(publisher))) {
            return res.status(404).json({error: "Publisher not found"});
        }
        const books = await Book.findAll({
            where: {publisher},
            include: [
                {
                    model: Author, as: 'authors',
                    through: {attributes: []}
                }
            ]
        });
        return res.json(books);
    } catch (e) {
        console.error('Error finding books by publisher', e);
        return res.status(500).json({
            error: 'Failed to find books by publisher'
        })
    }
}