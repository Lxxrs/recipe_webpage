document.addEventListener("DOMContentLoaded", () => {
  const recipeId = window.location.pathname.split("/")[2];

  // Load comments
  fetch(`/api/comments/${recipeId}`)
    .then((response) => response.json())
    .then((comments) => {
      const commentsContainer = document.getElementById("comments-container");
      commentsContainer.innerHTML = ""; // Clear existing comments
      comments.forEach((comment) => {
        const p = document.createElement("p");
        p.textContent = comment.comment;
        commentsContainer.appendChild(p);
      });
    });

  // Set up comment form
  const form = document.getElementById("comment-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const commentInput = document.getElementById("comment-input");
    const commentText = commentInput.value;

    fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipe_id: recipeId, comment: commentText }),
    })
      .then((response) => response.json())
      .then((newComment) => {
        const p = document.createElement("p");
        p.textContent = newComment.comment;
        document.getElementById("comments-container").appendChild(p);
        commentInput.value = "";
        location.reload(); // Reload the page to update the comments
      })
      .catch((error) => console.error("Error:", error));
  });

  // Like button
  document.getElementById("like-button").addEventListener("click", () => {
    fetch("/like", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipe_id: recipeId }),
    })
      .then((response) => response.text())
      .then((message) => {
        console.log(message);
        location.reload(); // Reload the page to update the like count
      })
      .catch((error) => console.error("Error:", error));
  });

  // Dislike button
  document.getElementById("dislike-button").addEventListener("click", () => {
    fetch("/dislike", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipe_id: recipeId }),
    })
      .then((response) => response.text())
      .then((message) => {
        console.log(message);
        location.reload(); // Reload the page to update the dislike count
      })
      .catch((error) => console.error("Error:", error));
  });
});
