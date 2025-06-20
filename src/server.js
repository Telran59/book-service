import dotenv from "dotenv";
import express from "express";
import {dbConnection} from "./config/database.js";
import {syncModels} from "./model/index.js";
import bookRoutes from "./routes/book.routes.js";
import authorRoutes from "./routes/author.routes.js";
import publisherRoutes from "./routes/publisher.routes.js";

dotenv.config()

const app = express()
const port = process.env.PORT || 8080

app.use(express.json())

dbConnection()
syncModels()
app.use(bookRoutes)
app.use(authorRoutes)
app.use(publisherRoutes)

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({error: 'Something went wrong!'})
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})