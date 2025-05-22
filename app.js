const express = require("express");
const bodyParser = require("body-parser");
const connection = require("./db");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Startseite
app.get("/", (req, res) => {
  const sql = `
    SELECT r.id, r.title, r.image, l.likes, l.dislikes, 
           (l.likes / (l.likes + l.dislikes)) AS like_ratio
    FROM recipes r
    JOIN likes l ON r.id = l.recipe_id 
    ORDER BY like_ratio DESC;
  `;
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.render("index", { recipes: results });
  });
});

// Rezeptseiten
app.get("/recipe/:id", (req, res) => {
  const recipeId = req.params.id;
  const sql = `
    SELECT r.*, l.likes, l.dislikes
    FROM recipes r
    JOIN likes l ON r.id = l.recipe_id
    WHERE r.id = ?;
  `;
  connection.query(sql, [recipeId], (err, results) => {
    if (err) throw err;
    const recipe = results[0];
    const totalVotes = recipe.likes + recipe.dislikes;
    const likePercentage =
      totalVotes > 0 ? (recipe.likes / totalVotes) * 100 : 0;
    res.render("recipe", { recipe, likePercentage });
  });
});

// Likes
app.post("/like", (req, res) => {
  const { recipe_id } = req.body;
  const sql = "UPDATE likes SET likes = likes + 1 WHERE recipe_id = ?";
  connection.query(sql, [recipe_id], (err, result) => {
    if (err) throw err;
    res.send("Like added");
  });
});

// Dislikes
app.post("/dislike", (req, res) => {
  const { recipe_id } = req.body;
  const sql = "UPDATE likes SET dislikes = dislikes + 1 WHERE recipe_id = ?";
  connection.query(sql, [recipe_id], (err, result) => {
    if (err) throw err;
    res.send("Dislike added");
  });
});

// Kommentare anzeigen
app.get("/api/comments/:id", (req, res) => {
  const recipeId = req.params.id;
  const query = `
    SELECT * FROM comments WHERE recipe_id = ? ORDER BY created_at DESC;
  `;
  connection.query(query, [recipeId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Kommentare hinzufügen
app.post("/api/comments", (req, res) => {
  const { recipe_id, comment } = req.body;
  let zufallszahl = Number(Math.random() * 1000000);
  const query = `
    INSERT INTO comments (comment_id, recipe_id, comment, created_at) VALUES (?, ?, ?, NOW());
  `;

  connection.query(query, [zufallszahl, recipe_id, comment], (err, result) => {
    if (err) throw err;
    res.json({ id: result.insertId, recipe_id, comment });
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
