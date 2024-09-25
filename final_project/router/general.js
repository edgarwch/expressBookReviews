const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    res.status(201).json({ message: "User registered successfully" });
});

public_users.get('/', async (req, res) => {
    try {
        const booksData = await axios.get('http://localhost:5000/internal/books');
        res.status(200).send(JSON.stringify(booksData.data, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books", error: error.message });
    }
});

public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author.toLowerCase();
        const booksData = await axios.get(`http://localhost:5000/internal/books/author/${author}`);
        if (booksData.data.length > 0) {
            res.status(200).send(JSON.stringify(booksData.data, null, 4));
        } else {
            res.status(404).json({ message: `No books found by author ${author}` });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books by author", error: error.message });
    }
});

public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title.toLowerCase();
        const booksData = await axios.get(`http://localhost:5000/internal/books/title/${title}`);
        if (booksData.data.length > 0) {
            res.status(200).send(JSON.stringify(booksData.data, null, 4));
        } else {
            res.status(404).json({ message: `No books found with title ${title}` });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books by title", error: error.message });
    }
});

public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const bookData = await axios.get(`http://localhost:5000/internal/books/isbn/${isbn}`);
        if (bookData.data) {
            res.status(200).send(JSON.stringify(bookData.data, null, 4));
        } else {
            res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch book details", error: error.message });
    }
});

module.exports.general = public_users;
