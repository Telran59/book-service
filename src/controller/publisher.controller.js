import {sequelize} from "../config/database.js";
import {Author, Book} from "../model/index.js";

export const findPublishersByAuthor = async (req, res) => {
    try {
        const {author} = req.params;
        const authorRecord = await Author.findByPk(author);
        if (!authorRecord) {
            return res.status(404).json({error: "Author not found"});
        }
        const books = await Book.findAll({
            include: {
                model: Author, as: 'authors',
                where: {name: author},
                through: {attributes: []}
            },
            attributes: [[sequelize.col('publisher'), 'publisher']],
            group: ['publisher'],
            raw: true,
        });
        const publishers = books.map(book => book.publisher);
        return res.json(publishers);
    } catch (e) {
        console.error('Error finding publishers by author', e);
        return res.status(500).json({
            error: 'Failed to find publisher by author'
        })
    }
}