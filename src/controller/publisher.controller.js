import {Author} from "../model/index.js";

export const findPublishersByAuthor = async (req, res) => {
    try {
        const {author} = req.params;
        const authorRecord = await Author.findByPk(author);
        if (!authorRecord) {
            return res.status(404).json({error: "Author not found"});
        }
        // TODO distinct by field publisher
        const books = await authorRecord.getBooks();
        const publishers = [...new Set(books.map(book => book.publisher))];
        return res.json(publishers);
    } catch (e) {
        console.error('Error finding publishers by author', e);
        return res.status(500).json({
            error: 'Failed to find publisher by author'
        })
    }
}