import {Author, Book} from "../model/index.js";
import {sequelize} from "../config/database.js";

export const findPublishersByAuthor = async (req, res) => {
    try {
        const {author} = req.params;
        const authorRecord = await Author.findByPk(author);
        if (!authorRecord) {
            return res.status(404).json({error: "Author not found"});
        }
        const publishers = await sequelize.query(`
            SELECT DISTINCT b.publisher
            FROM books b
                     JOIN books_authors ba ON b.isbn = ba.isbn
                     JOIN authors a ON a.name = ba.authorName
            WHERE a.name = :name
        `, {
            replacements: {name: author},
            type: sequelize.QueryTypes.SELECT
        });
        return res.json(publishers.map(p => p.publisher));
    } catch (e) {
        console.error('Error finding publishers by author', e);
        return res.status(500).json({
            error: 'Failed to find publisher by author'
        })
    }
}