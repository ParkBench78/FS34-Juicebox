const postContainer = document.getElementById("all-posts-container");
// const newPlayerFormContainer = document.getElementById("new-post-form");
const APIURL = "http://localhost:3000/api/posts";

async function fetchAllPosts() {
  try {
    const response = await fetch(APIURL);
    const results = await response.json();
    console.log(results.posts);

    return results.posts;
  } catch (err) {
    console.error("Uh oh, trouble fetching posts!", err);
  }
}

const renderAllPosts = async (posts) => {
  try {
    postContainer.innerHTML = "";
    posts.forEach((post) => {
      if (post.active) {
        const postElement = document.createElement("div");
        // postElement.classList.add("post");
        postElement.classList.add("post");
        postElement.innerHTML = `
  
          <h2>Title: ${post.title}</h2>
          <p>Author: ${post.author.name}</p>
          <p>Content: ${post.content}</p>
          <br/>
          <br/>
          `;
        postContainer.appendChild(postElement);
      }
    });
  } catch (err) {
    console.error("Uh oh, trouble rendering posts!", err);
  }
};

const init = async () => {
  const posts = await fetchAllPosts();
  await renderAllPosts(posts);
};

init();
