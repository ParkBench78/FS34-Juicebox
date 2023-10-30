const express = require("express");
const postsRouter = express.Router();

const { requireUser } = require("./utils");
// const postContainer = document.getElementById("all-posts-container");

const {
  createPost,
  getAllPosts,
  updatePost,
  deletePostById,
  getPostById,
} = require("../db");

postsRouter.get("/", async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter((post) => {
      // the post is active, doesn't matter who it belongs to
      if (post.active) {
        return true;
      }

      // the post is not active, but it belogs to the current user
      if (req.user && post.author.id === req.user.id) {
        return true;
      }

      // none of the above are true
      return false;
    });

    res.send({
      posts,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.post("/", requireUser, async (req, res, next) => {
  const { title, content = "", tags } = req.body;

  const postData = {};

  try {
    postData.authorId = req.user.id;
    postData.title = title;
    postData.content = content;
    postData.tags = tags;

    const post = await createPost(postData);

    if (post) {
      res.send(post);
    } else {
      next({
        name: "PostCreationError",
        message: "There was an error creating your post. Please try again.",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost });
    } else {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot update a post that is not yours",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});
//Delete post by id
postsRouter.delete("/:postId", requireUser, async (req, res, next) => {
  // res.send({ message: "under construction" });
  try {
    const { postId } = req.params;
    const post = await deletePostById(postId);
    if (!post) {
      next({
        name: "NotFound",
        message: `No post by ID ${postId}`,
      });
    } else if (req.user.id !== updatePost.creatorId) {
      res.status(403);
      next({
        name: "WrongUserError",
        message:
          "You must be the same user who created this post to perform this action",
      });
    } else {
      const deletePost = await destroyPost(postId);
      res.send({ success: true, ...deletePost });

      res.send(post);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = postsRouter;
