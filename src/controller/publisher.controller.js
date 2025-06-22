import {Author, Book} from "../model/index.js";

export const findPublishersByAuthor = async (req, res) => {
    try {
        const {author} = req.params;
        const authorRecord = await Author.findByPk(author);
        if (!authorRecord) {
            return res.status(404).json({error: "Author not found"});
        }
        const publishers = await Book.aggregate('publisher', 'DISTINCT', {
            plain: false,
            include: {
                model: Author,
                as: 'authors',
                where: {name: author},
                through: { attributes: [] }
            }
        });
        return res.json(publishers.map(p => p.DISTINCT));
    } catch (e) {
        console.error('Error finding publishers by author', e);
        return res.status(500).json({
            error: 'Failed to find publisher by author'
        })
    }
}