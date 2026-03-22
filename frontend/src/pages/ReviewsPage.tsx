import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  deleteMyWrittenReview,
  fetchMyReceivedReviews,
  fetchMyWrittenReviews,
  replyToReceivedReview,
  updateMyWrittenReview,
  type UserReview,
} from "../utils/api";

type ReviewsMode = "all" | "written" | "received";

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const renderStars = (rating: number) => "\u2605".repeat(rating) + "\u2606".repeat(5 - rating);

const ReviewsPage = ({ mode = "all" }: { mode?: ReviewsMode }) => {
  const [writtenReviews, setWrittenReviews] = useState<UserReview[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editingRating, setEditingRating] = useState(5);
  const [editingComment, setEditingComment] = useState("");
  const [busyReviewId, setBusyReviewId] = useState<number | null>(null);
  const [replyDraftByReviewId, setReplyDraftByReviewId] = useState<Record<number, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [written, received] = await Promise.all([
          fetchMyWrittenReviews(),
          fetchMyReceivedReviews(),
        ]);
        setWrittenReviews(written);
        setReceivedReviews(received);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleStartEdit = (review: UserReview) => {
    setEditingReviewId(review.id);
    setEditingRating(review.rating);
    setEditingComment(review.comment ?? "");
    setNotice("");
    setError("");
  };

  const handleSaveEdit = async (reviewId: number) => {
    try {
      setBusyReviewId(reviewId);
      setError("");
      setNotice("");
      const updated = await updateMyWrittenReview(reviewId, {
        rating: editingRating,
        comment: editingComment,
      });
      setWrittenReviews((current) =>
        current.map((review) => (review.id === reviewId ? updated : review))
      );
      setEditingReviewId(null);
      setNotice("Review updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update review");
    } finally {
      setBusyReviewId(null);
    }
  };

  const handleDelete = async (reviewId: number) => {
    const confirmed = window.confirm("Delete this review permanently?");
    if (!confirmed) {
      return;
    }

    try {
      setBusyReviewId(reviewId);
      setError("");
      setNotice("");
      await deleteMyWrittenReview(reviewId);
      setWrittenReviews((current) => current.filter((review) => review.id !== reviewId));
      if (editingReviewId === reviewId) {
        setEditingReviewId(null);
      }
      setNotice("Review deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review");
    } finally {
      setBusyReviewId(null);
    }
  };

  const handleReply = async (reviewId: number) => {
    const reply = (replyDraftByReviewId[reviewId] ?? "").trim();
    if (!reply) {
      setError("Please write a reply before submitting.");
      return;
    }

    try {
      setBusyReviewId(reviewId);
      setError("");
      setNotice("");
      const updated = await replyToReceivedReview(reviewId, reply);
      setReceivedReviews((current) =>
        current.map((review) => (review.id === reviewId ? updated : review))
      );
      setReplyDraftByReviewId((current) => ({ ...current, [reviewId]: "" }));
      setNotice("Reply posted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setBusyReviewId(null);
    }
  };

  const renderWrittenSection = () => (
    <section className="overview-market-section">
      <div className="overview-market-head">
        <h3>Reviews You Wrote</h3>
        <p>Update stars, comment text, or remove reviews from completed orders.</p>
      </div>

      {writtenReviews.length === 0 ? (
        <div className="dashboard-placeholder compact-placeholder">
          <h2>No written reviews yet</h2>
          <p>You can leave reviews from completed buyer orders.</p>
        </div>
      ) : (
        <div className="profile-reviews-grid">
          {writtenReviews.map((review) => (
            <article key={review.id} className="profile-review-card">
              <div className="profile-review-head">
                <div>
                  <strong>
                    For seller{" "}
                    {review.reviewee ? (
                      <Link to={`/profile/${review.reviewee.id}`} className="profile-inline-link">
                        {review.reviewee.name}
                      </Link>
                    ) : (
                      "Unknown"
                    )}
                  </strong>
                  <p className="service-seller">
                    Service{" "}
                    <Link to={`/service/${review.order.service.id}`} className="profile-inline-link">
                      {review.order.service.title}
                    </Link>
                  </p>
                </div>
                <span>{formatDate(review.createdAt)}</span>
              </div>

              {editingReviewId === review.id ? (
                <div className="order-review-form">
                  <label className="create-field">
                    <span>Rating</span>
                    <select
                      value={editingRating}
                      onChange={(event) => setEditingRating(Number(event.target.value))}
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Very Good</option>
                      <option value={3}>3 - Good</option>
                      <option value={2}>2 - Fair</option>
                      <option value={1}>1 - Poor</option>
                    </select>
                  </label>
                  <label className="create-field">
                    <span>Comment</span>
                    <textarea
                      rows={3}
                      value={editingComment}
                      onChange={(event) => setEditingComment(event.target.value)}
                    />
                  </label>
                  <div className="manage-actions-row">
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={busyReviewId === review.id}
                      onClick={() => handleSaveEdit(review.id)}
                    >
                      {busyReviewId === review.id ? "Saving..." : "Save Review"}
                    </button>
                    <button type="button" className="btn-outline" onClick={() => setEditingReviewId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="profile-review-stars">{renderStars(review.rating)}</p>
                  <p className="service-seller">{review.comment || "No written comment provided."}</p>
                  <div className="manage-actions-row">
                    <button type="button" className="btn-outline" onClick={() => handleStartEdit(review)}>
                      Edit Review
                    </button>
                    <button
                      type="button"
                      className="btn-outline danger-button"
                      disabled={busyReviewId === review.id}
                      onClick={() => handleDelete(review.id)}
                    >
                      {busyReviewId === review.id ? "Deleting..." : "Delete Review"}
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );

  const renderReceivedSection = () => (
    <section className="overview-market-section">
      <div className="overview-market-head">
        <h3>Reviews You Received</h3>
        <p>Post seller replies that appear publicly on your profile review cards.</p>
      </div>

      {receivedReviews.length === 0 ? (
        <div className="dashboard-placeholder compact-placeholder">
          <h2>No received reviews yet</h2>
          <p>Reviews from buyers will appear here after completed orders.</p>
        </div>
      ) : (
        <div className="profile-reviews-grid">
          {receivedReviews.map((review) => (
            <article key={review.id} className="profile-review-card">
              <div className="profile-review-head">
                <div>
                  <strong>
                    By{" "}
                    <Link to={`/profile/${review.reviewer.id}`} className="profile-inline-link">
                      {review.reviewer.name}
                    </Link>
                  </strong>
                  <p className="service-seller">
                    Service{" "}
                    <Link to={`/service/${review.order.service.id}`} className="profile-inline-link">
                      {review.order.service.title}
                    </Link>
                  </p>
                </div>
                <span>{formatDate(review.createdAt)}</span>
              </div>

              <p className="profile-review-stars">{renderStars(review.rating)}</p>
              <p className="service-seller">{review.comment || "No written comment provided."}</p>

              {review.sellerReply && (
                <div className="review-seller-reply">
                  <p className="review-seller-reply-head">
                    <span className="review-seller-tag">Seller</span>
                    <strong>You replied</strong>
                    {review.sellerReplyAt && <span>{formatDate(review.sellerReplyAt)}</span>}
                  </p>
                  <p>{review.sellerReply}</p>
                </div>
              )}

              <div className="order-review-form">
                <label className="create-field">
                  <span>{review.sellerReply ? "Update your reply" : "Reply as seller"}</span>
                  <textarea
                    rows={3}
                    value={replyDraftByReviewId[review.id] ?? ""}
                    placeholder="Thank the buyer and add a short professional response..."
                    onChange={(event) =>
                      setReplyDraftByReviewId((current) => ({
                        ...current,
                        [review.id]: event.target.value,
                      }))
                    }
                  />
                </label>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={busyReviewId === review.id}
                  onClick={() => handleReply(review.id)}
                >
                  {busyReviewId === review.id ? "Posting..." : review.sellerReply ? "Update Reply" : "Post Reply"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );

  if (loading) {
    return <div className="dashboard-placeholder">Loading reviews...</div>;
  }

  return (
    <div className="reviews-shell">
      <section className="reviews-hero-card reviews-center-hero">
        <div>
          <p className="overview-kicker">Review Center</p>
          <h2>{mode === "written" ? "Written Reviews" : mode === "received" ? "Received Reviews" : "Reviews Overview"}</h2>
          <p>
            {mode === "written"
              ? "Manage the reviews you wrote from one focused buyer view."
              : mode === "received"
                ? "Handle seller replies and reputation management from a dedicated received-reviews view."
                : "Keep the feedback you wrote separate from the feedback you received so the review system stays easier to follow as activity grows."}
          </p>
        </div>
        <div className="reviews-summary-grid">
          <article>
            <strong>{writtenReviews.length}</strong>
            <span>Written by You</span>
          </article>
          <article>
            <strong>{receivedReviews.length}</strong>
            <span>Received as Seller</span>
          </article>
        </div>
        <div className="orders-role-switcher reviews-route-switcher">
          <NavLink to="/dashboard/reviews" end className={({ isActive }) => `orders-role-tab ${isActive ? "active" : ""}`}>
            <span>Overview</span>
            <strong>Overview</strong>
          </NavLink>
          <NavLink to="/dashboard/reviews/written" className={({ isActive }) => `orders-role-tab ${isActive ? "active" : ""}`}>
            <span>Writing</span>
            <strong>Written Reviews</strong>
          </NavLink>
          <NavLink to="/dashboard/reviews/received" className={({ isActive }) => `orders-role-tab ${isActive ? "active" : ""}`}>
            <span>Seller Side</span>
            <strong>Received Reviews</strong>
          </NavLink>
        </div>
      </section>

      {error && <p className="form-status form-status-error">{error}</p>}
      {notice && <p className="form-status form-status-success">{notice}</p>}

      {mode === "all" && (
        <section className="orders-overview-grid">
          <article className="orders-overview-card orders-overview-card-buyer">
            <div className="orders-overview-head">
              <div>
                <p className="overview-kicker">Written Reviews</p>
                <h3>Feedback you gave</h3>
                <p>Edit ratings and comments you left on completed buyer orders without mixing them with seller-side review management.</p>
              </div>
            </div>
            <div className="orders-overview-stats">
              <article><strong>{writtenReviews.length}</strong><span>Total Written</span></article>
              <article><strong>{writtenReviews.filter((review) => review.rating >= 4).length}</strong><span>4+ and Above</span></article>
              <article><strong>{writtenReviews.filter((review) => !!review.comment?.trim()).length}</strong><span>With Comments</span></article>
              <article><strong>{writtenReviews.filter((review) => !review.comment?.trim()).length}</strong><span>Ratings Only</span></article>
            </div>
          </article>

          <article className="orders-overview-card orders-overview-card-seller">
            <div className="orders-overview-head">
              <div>
                <p className="overview-kicker">Received Reviews</p>
                <h3>Feedback on your services</h3>
                <p>Reply as a seller and keep public reputation management separate from the reviews you personally wrote for others.</p>
              </div>
            </div>
            <div className="orders-overview-stats">
              <article><strong>{receivedReviews.length}</strong><span>Total Received</span></article>
              <article><strong>{receivedReviews.filter((review) => review.rating >= 4).length}</strong><span>Positive Reviews</span></article>
              <article><strong>{receivedReviews.filter((review) => !!review.sellerReply?.trim()).length}</strong><span>Replied</span></article>
              <article><strong>{receivedReviews.filter((review) => !review.sellerReply?.trim()).length}</strong><span>Awaiting Reply</span></article>
            </div>
          </article>
        </section>
      )}

      {mode === "written" && renderWrittenSection()}
      {mode === "received" && renderReceivedSection()}
    </div>
  );
};

export default ReviewsPage;
