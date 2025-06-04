import React, { useState } from 'react';
import { BASE_URL } from '../../config';
import { toast } from 'react-toastify'; // For displaying success/error messages
import { formatDate } from '../../utils/formatDate';
import { AiFillStar } from 'react-icons/ai';

const DoctorFeedback = ({ reviews, totalRating, averageRating, doctorId, refetchDoctorData }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  // Ensure reviews is an array before trying to map over it
  const validReviews = Array.isArray(reviews) ? reviews : [];

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!rating || !reviewText) {
      setLoading(false);
      return toast.error('Rating and review text are required!');
    }

    try {
      const res = await fetch(`${BASE_URL}/doctors/${doctorId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ rating, reviewText }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      setLoading(false);
      toast.success(result.message || 'Review submitted successfully!');
      setRating(0);
      setReviewText('');
      setShowFeedbackForm(false);
      if (refetchDoctorData) {
        refetchDoctorData(); // Refetch doctor details to show the new review
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Failed to submit review.');
      console.error('Feedback submission error:', err);
    }
  };

  return (
    <div>
      <div className="mb-[30px]">
        <h4 className="text-[20px] leading-[30px] font-bold text-headingColor mb-[20px]">
          All Reviews ({totalRating})
        </h4>
        {validReviews.length > 0 ? (
          validReviews.map((review, index) => (
            <div key={index} className="flex justify-between gap-10 mb-[20px] border-b border-gray-200 pb-4">
              <div className="flex gap-3">
                <figure className="w-10 h-10 rounded-full">
                  {/* Assuming review.user.photo exists */}
                  <img className="w-full h-full object-cover rounded-full" src={review.user?.photo || 'default-avatar.png'} alt="User" />
                </figure>
                <div>
                  <h5 className="text-[16px] leading-6 text-primaryColor font-bold">
                    {review.user?.name || 'Anonymous User'}
                  </h5>
                  <p className="text-[14px] leading-6 text-textColor">
                    {formatDate(review.createdAt)}
                  </p>
                  <p className="text__para mt-3 font-medium text-[15px]">
                    {review.reviewText}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(review.rating).keys()].map((_, i) => (
                  <AiFillStar key={i} color="#FFD700" />
                ))}
                {[...Array(5 - review.rating).keys()].map((_, i) => (
                  <AiFillStar key={i} color="#D3D3D3" /> /* Light grey for unselected stars */
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text__para">No reviews yet for this doctor.</p>
        )}
      </div>

      {/* TODO: Feedback Form will go here */}
      {!showFeedbackForm && (
        <div className="text-center">
          <button className="btn" onClick={() => setShowFeedbackForm(true)}>
            Give Feedback
          </button>
        </div>
      )}

      {showFeedbackForm && (
        <div className="mt-8">
          <form onSubmit={handleSubmitFeedback}>
            <div>
              <h3 className="text-headingColor text-[16px] leading-6 font-semibold mb-4 mt-0">
                How would you rate the experience?*
              </h3>
              <div>
                {[...Array(5).keys()].map((_, index) => {
                  index += 1;
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`${ 
                        index <= (hoverRating || rating)
                          ? 'text-yellowColor'
                          : 'text-gray-400'
                      } bg-transparent border-none outline-none text-[22px] cursor-pointer`}
                      onClick={() => setRating(index)}
                      onMouseEnter={() => setHoverRating(index)}
                      onMouseLeave={() => setHoverRating(rating)} // Reset hover to current rating
                      onDoubleClick={() => { // Optional: allow deselecting
                        setRating(0);
                        setHoverRating(0);
                      }}
                    >
                      <span>
                        <AiFillStar />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-[30px]">
              <h3 className="text-headingColor text-[16px] leading-6 font-semibold mb-4">
                Share your feedback or suggestions*
              </h3>
              <textarea
                className="border border-solid border-[#0066ff34] focus:outline outline-primaryColor w-full px-4 py-3 rounded-md"
                rows="5"
                placeholder="Write your message"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" disabled={loading} className="btn mt-4">
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DoctorFeedback;
