const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
  }

  let accessToken = jwt.sign(
      { username: username },
      'fingerprint_customer', 
      { expiresIn: '1h' }
  );

  return res.status(200).json({ message: "Login successful", token: accessToken });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.query;
  const username = req.user.username; 
  if (!review) {
      return res.status(400).json({ message: "Review is required" });
  }

  if (!books[isbn]) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }

  if (!books[isbn].reviews) {
      books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/modified successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username; 
  if (!books[isbn]) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: `No review found for user ${username}` });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
