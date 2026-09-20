import { useState } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [analyticsPosts, setAnalyticsPosts] = useState([]);

  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "https://instagram-calculator-backend.onrender.com";

  // ============================================
  // HELPERS
  // ============================================

  const getNumber = (...values) => {
    for (const value of values) {
      if (value !== undefined && value !== null && value !== "") {
        const number = Number(value);

        if (!Number.isNaN(number)) {
          return number;
        }
      }
    }

    return 0;
  };

  const formatNumber = (number) => {
    if (
      number === undefined ||
      number === null ||
      Number.isNaN(Number(number))
    ) {
      return "0";
    }

    return Number(number).toLocaleString();
  };

  // ============================================
  // PROFILE DATA
  // ============================================

  const getFollowers = (data) => {
    return getNumber(
      data?.followers,
      data?.follower_count,
      data?.followers_count,

      data?.data?.followers,
      data?.data?.follower_count,
      data?.data?.followers_count,

      data?.user?.followers,
      data?.user?.follower_count,
      data?.user?.followers_count,

      data?.data?.user?.followers,
      data?.data?.user?.follower_count,
      data?.data?.user?.followers_count
    );
  };

  const getProfilePostsCount = (data) => {
    return getNumber(
      data?.posts,
      data?.posts_count,
      data?.post_count,
      data?.media_count,

      data?.data?.posts,
      data?.data?.posts_count,
      data?.data?.post_count,
      data?.data?.media_count,

      data?.user?.posts,
      data?.user?.posts_count,
      data?.user?.post_count,
      data?.user?.media_count,

      data?.data?.user?.posts,
      data?.data?.user?.posts_count,
      data?.data?.user?.post_count,
      data?.data?.user?.media_count
    );
  };

  const getProfileBio = (data) => {
    return (
      data?.biography ||
      data?.bio ||
      data?.description ||
      data?.data?.biography ||
      data?.data?.bio ||
      data?.data?.description ||
      data?.user?.biography ||
      data?.user?.bio ||
      ""
    );
  };

  const getProfileName = (data) => {
    return (
      data?.full_name ||
      data?.name ||
      data?.data?.full_name ||
      data?.data?.name ||
      data?.user?.full_name ||
      data?.user?.name ||
      ""
    );
  };

  // ============================================
  // POST DATA
  // ============================================

  const getPostImage = (post) => {
    return (
      post?.image ||
      post?.image_url ||
      post?.thumbnail ||
      post?.thumbnail_url ||
      post?.display_url ||
      post?.displayUrl ||
      post?.media_url ||
      post?.mediaUrl ||
      post?.cover ||
      post?.cover_url ||
      post?.image_versions2?.candidates?.[0]?.url ||
      post?.data?.image ||
      post?.data?.image_url ||
      post?.data?.thumbnail ||
      post?.data?.thumbnail_url ||
      post?.data?.display_url ||
      post?.data?.displayUrl ||
      post?.data?.media_url ||
      post?.data?.image_versions2?.candidates?.[0]?.url ||
      null
    );
  };

  const getPostUrl = (post) => {
    return (
      post?.url ||
      post?.permalink ||
      post?.web_url ||
      post?.post_url ||
      post?.link ||
      post?.data?.url ||
      post?.data?.permalink ||
      null
    );
  };

  const getCaption = (post) => {
    return (
      post?.caption ||
      post?.text ||
      post?.description ||
      post?.data?.caption ||
      post?.data?.text ||
      ""
    );
  };

  const getPostType = (post) => {
    const type =
      post?.type ||
      post?.media_type ||
      post?.product_type ||
      post?.data?.type ||
      "POST";

    return String(type).toUpperCase();
  };

  // ============================================
  // LIKES
  // ============================================

  const getLikes = (post) => {
    return getNumber(
      post?.like_count,
      post?.likes,
      post?.likes_count,
      post?.edge_media_preview_like?.count,

      post?.data?.like_count,
      post?.data?.likes,
      post?.data?.likes_count,
      post?.data?.edge_media_preview_like?.count
    );
  };

  // ============================================
  // COMMENTS
  // ============================================

  const getComments = (post) => {
    return getNumber(
      post?.comment_count,
      post?.comments,
      post?.comments_count,
      post?.edge_media_to_comment?.count,

      post?.data?.comment_count,
      post?.data?.comments,
      post?.data?.comments_count,
      post?.data?.edge_media_to_comment?.count
    );
  };

  // ============================================
  // VIEWS / PLAYS
  // ============================================

  const getViews = (post) => {
    return getNumber(
      post?.view_count,
      post?.views,
      post?.play_count,
      post?.plays,
      post?.video_view_count,

      post?.data?.view_count,
      post?.data?.views,
      post?.data?.play_count,
      post?.data?.video_view_count
    );
  };

  // ============================================
  // SAVED
  // ============================================

  const getSaved = (post) => {
    return getNumber(
      post?.saved,
      post?.save_count,
      post?.saves,
      post?.saved_count,

      post?.data?.saved,
      post?.data?.save_count,
      post?.data?.saves,
      post?.data?.saved_count
    );
  };

  // ============================================
  // REPOSTS
  // ============================================

  const getReposts = (post) => {
    return getNumber(
      post?.reposts,
      post?.repost_count,
      post?.reposts_count,
      post?.share_count,

      post?.data?.reposts,
      post?.data?.repost_count,
      post?.data?.reposts_count,
      post?.data?.share_count
    );
  };

  // ============================================
  // POST DATE
  // ============================================

  const getPostDate = (post) => {
    return (
      post?.taken_at ||
      post?.taken_at_timestamp ||
      post?.timestamp ||
      post?.created_at ||
      post?.createdAt ||
      post?.data?.taken_at ||
      post?.data?.timestamp ||
      post?.data?.created_at ||
      null
    );
  };

  const getTimeAgo = (post) => {
    const value = getPostDate(post);

    if (!value) {
      return "Recently";
    }

    let date;

    if (typeof value === "number") {
      date = new Date(value < 10000000000 ? value * 1000 : value);
    } else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    const difference = Math.max(0, Date.now() - date.getTime());

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    if (hours > 0) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    return "Just now";
  };

  // ============================================
  // POST ENGAGEMENT
  // ============================================

  const getPostEngagement = (post) => {
    const followers = getFollowers(profile);

    const likes = getLikes(post);
    const comments = getComments(post);

    if (!followers) {
      return 0;
    }

    return ((likes + comments) / followers) * 100;
  };

  // ============================================
  // MEDIAN
  // ============================================

  const getMedian = (values) => {
    if (!values.length) {
      return 0;
    }

    const sorted = [...values].sort((a, b) => a - b);

    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
  };

  // ============================================
  // STATISTICS
  // ============================================

  const calculateStatistics = () => {
    const followers = getFollowers(profile);

    if (!analyticsPosts.length) {
      return {
        followers,
        totalPosts: getProfilePostsCount(profile),
        averageLikes: 0,
        averageComments: 0,
        averageViews: 0,
        engagementRate: 0,
      };
    }

    const likes = analyticsPosts.map((post) => getLikes(post));

    const comments = analyticsPosts.map((post) => getComments(post));

    const views = analyticsPosts.map((post) => getViews(post));

    const totalLikes = likes.reduce(
      (sum, value) => sum + value,
      0
    );

    const averageLikes = totalLikes / likes.length;

    const totalComments = comments.reduce(
      (sum, value) => sum + value,
      0
    );

    const averageComments =
      totalComments / comments.length;

    const validViews = views.filter(
      (value) => value > 0
    );

    const totalViews = validViews.reduce(
      (sum, value) => sum + value,
      0
    );

    const averageViews =
      validViews.length > 0
        ? totalViews / validViews.length
        : 0;

    const medianLikes = getMedian(likes);
    const medianComments = getMedian(comments);

    const engagementRate =
      followers > 0
        ? ((medianLikes + medianComments) / followers) * 100
        : 0;

    return {
      followers,
      totalPosts: getProfilePostsCount(profile),
      averageLikes,
      averageComments,
      averageViews,
      engagementRate,
    };
  };

  // ============================================
  // SEARCH
  // ============================================

  const handleSearch = async (e) => {
    e.preventDefault();

    const cleanUsername = username
      .trim()
      .replace(/^@+/, "");

    if (!cleanUsername) {
      setError("Please enter an Instagram username.");
      return;
    }

    setLoading(true);
    setError("");
    setProfile(null);
    setPosts([]);
    setAnalyticsPosts([]);
    setNextCursor(null);

    try {
      // PROFILE
      const profileResponse = await fetch(
        `${API_URL}/api/instagram/${encodeURIComponent(
          cleanUsername
        )}`
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileData?.error?.message ||
            profileData?.message ||
            "Unable to fetch Instagram profile."
        );
      }

      const profileResult =
        profileData?.data ||
        profileData?.profile ||
        profileData;

      setProfile(profileResult);

      // FIRST POSTS PAGE
      const postsResponse = await fetch(
        `${API_URL}/api/instagram/${encodeURIComponent(
          cleanUsername
        )}/posts`
      );

      const postsData = await postsResponse.json();

      if (!postsResponse.ok) {
        throw new Error(
          postsData?.error?.message ||
            postsData?.message ||
            "Unable to fetch Instagram posts."
        );
      }

      const items =
        postsData?.items ||
        postsData?.data?.items ||
        postsData?.posts ||
        postsData?.data?.posts ||
        [];

      const firstPosts = Array.isArray(items)
        ? items
        : [];

      setPosts(firstPosts);

      // Metrics use only first page
      setAnalyticsPosts(firstPosts);

      // Cursor
      setNextCursor(
        postsData?.next_cursor ||
          postsData?.data?.next_cursor ||
          postsData?.pagination?.next_cursor ||
          postsData?.data?.pagination?.next_cursor ||
          null
      );
    } catch (error) {
      console.error("Instagram API Error:", error);

      setError(
        error?.message ||
          "Unable to fetch Instagram data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOAD MORE
  // ============================================

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) {
      return;
    }

    const cleanUsername = username
      .trim()
      .replace(/^@+/, "");

    if (!cleanUsername) {
      return;
    }

    setLoadingMore(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/instagram/${encodeURIComponent(
          cleanUsername
        )}/posts?cursor=${encodeURIComponent(
          nextCursor
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            "Unable to load more posts."
        );
      }

      const newItems =
        data?.items ||
        data?.data?.items ||
        data?.posts ||
        data?.data?.posts ||
        [];

      const validNewPosts = Array.isArray(newItems)
        ? newItems
        : [];

      // Only displayed posts change
      setPosts((previousPosts) => [
        ...previousPosts,
        ...validNewPosts,
      ]);

      // analyticsPosts intentionally NOT changed

      setNextCursor(
        data?.next_cursor ||
          data?.data?.next_cursor ||
          data?.pagination?.next_cursor ||
          data?.data?.pagination?.next_cursor ||
          null
      );
    } catch (error) {
      console.error("Load More Error:", error);

      setError(
        error?.message ||
          "Unable to load more posts."
      );
    } finally {
      setLoadingMore(false);
    }
  };

  // ============================================
  // CALCULATED DATA
  // ============================================

  const statistics = calculateStatistics();

  const profileImage =
    profile?.profile_pic_url ||
    profile?.profile_picture ||
    profile?.profile_pic ||
    profile?.avatar ||
    profile?.profile_image ||
    profile?.profile_image_url ||
    profile?.data?.profile_pic_url ||
    profile?.data?.profile_picture ||
    profile?.data?.avatar ||
    profile?.data?.profile_image ||
    profile?.user?.profile_pic_url ||
    profile?.user?.profile_picture ||
    null;

  const displayUsername =
    profile?.username ||
    profile?.user_name ||
    profile?.handle ||
    profile?.data?.username ||
    profile?.data?.user_name ||
    username.replace(/^@+/, "");

  const profileName =
    getProfileName(profile) || displayUsername;

  const profileBio = getProfileBio(profile);

  const profilePostsCount =
    getProfilePostsCount(profile);

  // ============================================
  // UI
  // ============================================

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            Insta<span>Analytics</span>
          </div>
        </div>
      </header>

      <main>

        {/* PAGE TITLE */}
        <section className="page-header">
          <div className="container">
            <h1>Instagram Engagement Calculator</h1>

            <p>
              Analyze an Instagram profile and
              calculate its engagement rate.
            </p>
          </div>
        </section>

        {/* SEARCH */}
        <section className="search-section container">
          <form
            className="search-box"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="@username"
              value={username}
              disabled={loading}
              onChange={(e) =>
                setUsername(e.target.value)
              }
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "Calculate"}
            </button>
          </form>
        </section>

        {/* ERROR */}
        {error && (
          <div className="container">
            <div className="error">
              {error}
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="loading">
            <div className="loader"></div>

            <p>
              Fetching Instagram data...
            </p>
          </div>
        )}

        {/* RESULTS */}
        {profile && !loading && (
          <>
            {/* PROFILE */}
            <section className="container profile-section">
              <div className="profile-card-new">

                <div className="profile-main">

                  {profileImage ? (
                    <img
                      className="profile-image-new"
                      src={profileImage}
                      alt={displayUsername}
                    />
                  ) : (
                    <div className="profile-placeholder-new">
                      {displayUsername
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="profile-details">

                    <h2>{profileName}</h2>

                    <p className="profile-username">
                      @{displayUsername}
                    </p>

                    {profileBio && (
                      <p className="profile-bio">
                        {profileBio}
                      </p>
                    )}

                  </div>

                </div>

                <div className="profile-counts">

                  <div className="profile-count">

                    <strong>
                      {statistics.followers >= 1000000
                        ? `${(
                            statistics.followers /
                            1000000
                          ).toFixed(1)}M`
                        : statistics.followers >= 1000
                        ? `${(
                            statistics.followers /
                            1000
                          ).toFixed(1)}k`
                        : formatNumber(
                            statistics.followers
                          )}
                    </strong>

                    <span>Followers</span>

                  </div>

                  <div className="profile-count-divider"></div>

                  <div className="profile-count">

                    <strong>
                      {formatNumber(
                        profilePostsCount
                      )}
                    </strong>

                    <span>Posts</span>

                  </div>

                </div>

              </div>
            </section>

            {/* KEY PERFORMANCE METRICS */}
            <section className="container metrics-section">

              <div className="metrics-header">
                <h2>Key Performance Metrics</h2>
              </div>

              <div className="metrics-grid">

                {/* ENGAGEMENT RATE */}
                <div className="metric-card metric-er">

                  <div className="metric-label">

                    <span className="metric-icon">
                      ↗
                    </span>

                    <span>
                      Engagement Rate
                    </span>

                    <span className="info-icon">
                      ⓘ
                    </span>

                  </div>

                  <strong className="metric-value">
                    {statistics.engagementRate.toFixed(2)}%
                  </strong>

                  <span className="metric-subtitle">
                    Based on available posts
                  </span>

                </div>

                {/* LIKES */}
                <div className="metric-card">

                  <div className="metric-label">

                    <span className="metric-icon pink">
                      ♡
                    </span>

                    <span>Avg Likes</span>

                  </div>

                  <strong className="metric-number">
                    {formatNumber(
                      Math.round(
                        statistics.averageLikes
                      )
                    )}
                  </strong>

                  <span className="metric-subtitle">
                    Per post
                  </span>

                </div>

                {/* COMMENTS */}
                <div className="metric-card">

                  <div className="metric-label">

                    <span className="metric-icon blue">
                      ♡
                    </span>

                    <span>Avg Comments</span>

                  </div>

                  <strong className="metric-number">
                    {formatNumber(
                      Math.round(
                        statistics.averageComments
                      )
                    )}
                  </strong>

                  <span className="metric-subtitle">
                    Per post
                  </span>

                </div>

                {/* PLAYS */}
                <div className="metric-card">

                  <div className="metric-label">

                    <span className="metric-icon green">
                      ▷
                    </span>

                    <span>Avg Plays</span>

                  </div>

                  <strong className="metric-number">
                    {formatNumber(
                      Math.round(
                        statistics.averageViews
                      )
                    )}
                  </strong>

                  <span className="metric-subtitle">
                    Video posts only
                  </span>

                </div>

              </div>

            </section>

            {/* BENCHMARK */}
            <section className="container benchmark-section">

              <div className="benchmark-card">

                <h2>
                  Engagement Rate Benchmark
                </h2>

                <p className="benchmark-description">
                  Engagement rate based on the
                  available Instagram posts.
                </p>

                <div className="benchmark-content">

                  <div className="benchmark-rate">

                    <strong>
                      {statistics.engagementRate.toFixed(2)}%
                    </strong>

                    <span>
                      Current Engagement Rate
                    </span>

                  </div>

                  <div className="benchmark-bar">

                    <div
                      className="benchmark-progress"
                      style={{
                        width: `${Math.min(
                          statistics.engagementRate * 10,
                          100
                        )}%`,
                      }}
                    ></div>

                  </div>

                  <div className="benchmark-scale">
                    <span>0%</span>
                    <span>2%</span>
                    <span>4%</span>
                    <span>6%</span>
                    <span>8%+</span>
                  </div>

                </div>

              </div>

            </section>

            {/* POSTS */}
            {posts.length > 0 && (
              <section className="posts-section container">

                <div className="posts-header">

                  <div>
                    <h2>Instagram Posts</h2>

                    <p>
                      Recent posts from this
                      Instagram profile
                    </p>
                  </div>

                  <span>
                    {posts.length} posts found
                  </span>

                </div>

                <div className="posts-grid">

                  {posts.map((post, index) => {

                    const image =
                      getPostImage(post);

                    const likes =
                      getLikes(post);

                    const comments =
                      getComments(post);

                    const views =
                      getViews(post);

                    const saved =
                      getSaved(post);

                    const reposts =
                      getReposts(post);

                    const caption =
                      getCaption(post);

                    const postUrl =
                      getPostUrl(post);

                    const postType =
                      getPostType(post);

                    const timeAgo =
                      getTimeAgo(post);

                    const postER =
                      getPostEngagement(post);

                    return (
                      <article
                        className="post-card"
                        key={
                          post?.id ||
                          post?.shortcode ||
                          post?.url ||
                          index
                        }
                      >

                        <div className="post-image-box">

                          {image ? (
                            <img
                              src={image}
                              alt={`Instagram post ${
                                index + 1
                              }`}
                              className="post-image"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="image-placeholder">
                              Instagram Post
                            </div>
                          )}

                          <span className="type-badge">
                            {postType === "VIDEO" ||
                            postType === "REEL" ||
                            views > 0
                              ? "Video"
                              : "Post"}
                          </span>

                        </div>

                        {views > 0 && (
                          <div className="plays-row">

                            <span className="plays-badge">
                              ▶{" "}
                              {formatNumber(
                                views
                              )}{" "}
                              plays
                            </span>

                          </div>
                        )}

                        <div className="post-content">

                          <div className="post-top-row">

                            <span className="post-time">
                              {timeAgo}
                            </span>

                            <span className="post-er">
                              {postER.toFixed(2)}% ER
                            </span>

                          </div>

                          <div className="post-engagement">

                            <span className="engagement-item like">
                              ♡
                              <b>
                                {formatNumber(
                                  likes
                                )}
                              </b>
                            </span>

                            <span className="engagement-item comment">
                              ♡
                              <b>
                                {formatNumber(
                                  comments
                                )}
                              </b>
                            </span>

                            <span className="engagement-item saved">
                              🔖
                              <b>
                                {formatNumber(
                                  saved
                                )}
                              </b>
                            </span>

                            <span className="engagement-item repost">
                              🔁
                              <b>
                                {formatNumber(
                                  reposts
                                )}
                              </b>
                            </span>

                          </div>

                          {caption && (
                            <p className="post-caption">

                              {caption.length > 150
                                ? `${caption.substring(
                                    0,
                                    150
                                  )}...`
                                : caption}

                            </p>
                          )}

                          {postUrl && (
                            <a
                              href={postUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="post-link"
                            >
                              View on Instagram
                              <span>↗</span>
                            </a>
                          )}

                        </div>

                      </article>
                    );
                  })}

                </div>

                {/* LOAD MORE */}
                {nextCursor && (
                  <div className="load-more-wrapper">

                    <button
                      className="load-more"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore
                        ? "Loading..."
                        : "Load More"}
                    </button>

                  </div>
                )}

              </section>
            )}

            {/* NO POSTS */}
            {posts.length === 0 && !error && (
              <section className="container no-posts">

                <h2>No posts available</h2>

                <p>
                  The profile was found, but
                  the Instagram API did not
                  return any post data.
                </p>

              </section>
            )}
          </>
        )}

      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          Instagram Engagement Calculator
        </p>
      </footer>

    </div>
  );
}

export default App;