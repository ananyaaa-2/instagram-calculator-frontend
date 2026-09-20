const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

const API_BASE = "https://api.instagramapi.dev/v1";

const apiHeaders = {
  Authorization: `Bearer ${process.env.INSTAGRAM_API_KEY}`,
};

// ============================================
// CACHE
// ============================================

// Cache 10 minutes ke liye
const CACHE_TIME = 10 * 60 * 1000;

const profileCache = new Map();
const postsCache = new Map();


// ============================================
// HOME
// ============================================

app.get("/", (req, res) => {
  res.json({
    message: "Instagram Engagement Calculator Backend is running!",
  });
});


// ============================================
// PROFILE
// ============================================

app.get("/api/instagram/:username", async (req, res) => {
  try {
    const username = req.params.username.trim().toLowerCase();

    // Check cache
    const cached = profileCache.get(username);

    if (cached && Date.now() - cached.time < CACHE_TIME) {
      console.log(`Using cached profile: ${username}`);
      return res.json(cached.data);
    }

    console.log(`Fetching profile from API: ${username}`);

    const response = await fetch(
      `${API_BASE}/profile?handle=${encodeURIComponent(username)}`,
      {
        headers: apiHeaders,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Profile API Error:", data);
      return res.status(response.status).json(data);
    }

    // Save in cache
    profileCache.set(username, {
      data: data,
      time: Date.now(),
    });

    res.json(data);

  } catch (error) {
    console.error("Profile Error:", error);

    res.status(500).json({
      error: {
        message: "Unable to fetch Instagram profile.",
      },
    });
  }
});


// ============================================
// POSTS WITH CURSOR PAGINATION + CACHE
// ============================================

app.get("/api/instagram/:username/posts", async (req, res) => {
  try {
    const username = req.params.username.trim().toLowerCase();
    const cursor = req.query.cursor || "";

    // Username + cursor = unique cache key
    const cacheKey = `${username}_${cursor}`;

    // Check cache
    const cached = postsCache.get(cacheKey);

    if (cached && Date.now() - cached.time < CACHE_TIME) {
      console.log(`Using cached posts: ${username}`);

      return res.json(cached.data);
    }

    let url =
      `${API_BASE}/profile/posts?handle=${encodeURIComponent(username)}`;

    // Cursor only for Load More
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    }

    console.log(
      cursor
        ? `Fetching next posts page from API: ${username}`
        : `Fetching first posts page from API: ${username}`
    );

    const response = await fetch(url, {
      headers: apiHeaders,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Posts API Error:", data);

      return res.status(response.status).json(data);
    }


    // ========================================
    // POSTS
    // ========================================

    const items =
      data?.data?.items ||
      data?.items ||
      data?.data?.posts ||
      data?.posts ||
      [];


    // ========================================
    // NEXT CURSOR
    // ========================================

    const nextCursor =
      data?.data?.next_cursor ||
      data?.data?.pagination?.next_cursor ||
      data?.pagination?.next_cursor ||
      data?.next_cursor ||
      data?.cursor ||
      null;


    // ========================================
    // RESPONSE
    // ========================================

    const result = {
      success: true,

      username,

      items: Array.isArray(items)
        ? items
        : [],

      next_cursor: nextCursor,

      has_more: Boolean(nextCursor),
    };


    // ========================================
    // SAVE TO CACHE
    // ========================================

    postsCache.set(cacheKey, {
      data: result,
      time: Date.now(),
    });


    res.json(result);

  } catch (error) {
    console.error("Posts Error:", error);

    res.status(500).json({
      error: {
        message: "Unable to fetch Instagram posts.",
      },
    });
  }
});


// ============================================
// SERVER
// ============================================

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});