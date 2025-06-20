import Book from "./book.model.js";
import Publisher from "./publisher.model.js";
import Author from "./author.model.js";
import {sequelize} from "../config/database.js";
import {DataTypes} from "sequelize";

// Define the junction table
const BooksAuthors = sequelize.define('BooksAuthors', {
    isbn: {
        type: DataTypes.STRING,
        references: {
            model: Book,
            key: 'isbn'
        }
    },
    authorName: {
        type: DataTypes.STRING,
        references: {
            model: Author,
            key: 'name'
        }
    }
}, {
    tableName: 'books_authors',
    timestamps: false,
})

// Book and Author: Many-To-Many relationship
Book.belongsToMany(Author, {
    through: BooksAuthors,
    foreignKey: 'isbn',
    otherKey: 'authorName',
    as: 'authors'
})

Author.belongsToMany(Book, {
    through: BooksAuthors,
    foreignKey: 'authorName',
    otherKey: 'isbn',
    as: 'books'
})


// Book and Publisher: Many-To-One relationship
Book.belongsTo(Publisher, {
    foreignKey: 'publisher',
    targetKey: 'publisherName',
    as: 'publisherDetails'
})

Publisher.hasMany(Book, {
    foreignKey: 'publisher',
    sourceKey: 'publisherName',
    as: 'books'
})

const syncModels = async () => {
    try {
        await sequelize.sync({alter: true});
        console.log("Models have been synced successfully.");
    } catch (e) {
        console.error("Unable to sync models:", e);
    }
}

export {Book, Author, Publisher, syncModels};