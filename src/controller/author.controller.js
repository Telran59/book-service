import {sequelize} from "../config/database.js";
import {Author, Book} from "../model/index.js";

export const findBookAuthors = async (req, res) => {
    try {
        const {isbn} = req.params;
        const book = await Book.findByPk(isbn);
        if (!book) {
            return res.status(404).json({error: "Book not found"});
        }
        const authors = await book.getAuthors();
        const response = authors.map(author => ({
            name: author.name,
            birthDate: author.birthDate
        }))
        return res.json(response);
    } catch (e) {
        console.error('Error finding book authors', e);
        return res.status(500).json({
            error: 'Failed to find book authors'
        })
    }
}

export const removeAuthor = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { author } = req.params;
        const authorRecord = await Author.findByPk(author, { transaction: t });

        if (!authorRecord) {
            await t.rollback();
            return res.status(404).json({ error: 'Author not found' });
        }

        const authorBooks = await authorRecord.getBooks({ transaction: t });

        if (authorBooks.length > 0) {
            await t.rollback();
            return res.status(400).json({
                error: 'Cannot delete author with existing books',
                message: 'This author has associated books.'
            });
        }

        const response = {
            name: authorRecord.name,
            birthDate: authorRecord.birthDate
        };

        await authorRecord.destroy({ transaction: t });

        await t.commit();
        return res.json(response);
    } catch (error) {
        await t.rollback();
        console.error('Error removing author:', error);
        return res.status(500).json({ error: 'Failed to remove author' });
    }
};