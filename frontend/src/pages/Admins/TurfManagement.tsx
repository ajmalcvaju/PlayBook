import { useState, useEffect } from "react";
import apiClient from "../../apiClient";

type Turf = {
  _id: string;
  turfName: string;
  isApproved: boolean;
  email: string;
  mobileNumber: string;
  bookingsCount: number;
  isBlocked: boolean;
  reports: string[];
};
interface Review {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
  };
  turfId: string;
  comment: string;
  rating: number;
}
interface TurfReview {
  _id: string;
  firstName: string;
  lastName: string;
  comment: string;
  rating: number;
}

const TurfManagement = () => {

  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [review, setReview] = useState<Review[]>([]);
  const [reportCounts, setReportCounts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [turfReviews, setTurfReviews] = useState<TurfReview[]>([]);
  const turfsPerPage = 8;
  const [currentPages, setCurrentPages] = useState(1);
  const reviewsPerPage = 8;
  const [reviewDeleteModal, setReviewDeleteModal] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState("");
  const totalPages = Math.ceil(turfReviews.length / reviewsPerPage);
  const currentReviews = turfReviews.slice(
    (currentPages - 1) * reviewsPerPage,
    currentPages * reviewsPerPage
  );
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPages(page);
    }
  };
  useEffect(() => {
    const fetchReviews = async (): Promise<void> => {
      try {
        const response = await apiClient.get<any[]>("/admin/reviews");
        if (response.status === 200) {
          setReview(response.data);
        } else {
          throw new Error("Failed to fetch reviews");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, []);
  const getReviewsByTurfId = (reviews=review, turfId: string) => {
    const turfReviews= reviews
      .filter((review) => review.turfId === turfId)
      .map((review) => {
        const { userId: { firstName, lastName }, comment, rating, _id } = review;
        return { _id, firstName, lastName, comment, rating };
      });
      setTurfReviews(turfReviews)
      setReviewModal(true)
  };
  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const response = await apiClient.get("/admin/get-turfs");
        if (response.status === 200) {
          console.log(response.data);
          const { turfs, bookings, reports } = response.data;

          const turfsWithBookings = turfs.map((turf:Turf) => {
            const booking = bookings.find((b:any) => b.turfId === turf._id);
            return {
              ...turf,
              bookingsCount: booking ? booking.count : 0,
            };
          });
          const turfsWithReports = turfsWithBookings.map((turf:Turf) => {
            const relevantReports = reports.filter(
              (r:any) => r.turfId === turf._id
            );
            return {
              ...turf,
              reports:
                relevantReports.length > 0
                  ? relevantReports.map((r:any) => r.issue)
                  : [],
            };
          });
          console.log(turfsWithReports);
          setTurfs(turfsWithReports);
        } else {
          throw new Error("Failed to fetch turfs");
        }
      } catch (error) {
        console.error("Error fetching turfs:", error);
        // setError('Failed to load turfs');
      }
    };
    fetchTurfs();
  }, []);

  const handleApproveOrBlockClick = (turf: Turf) => {
    setSelectedTurf(turf);
    setShowModal(true);
  };

  
  const handleConfirmAction = () => {
    if (selectedTurf) {
      const id = selectedTurf._id;
      let body = {};
      if (selectedTurf.isApproved) {
        body = { id: id, block: 0 };
      } else {
        body = { id: id, block: 1 };
      }
      apiClient.patch('/admin/block-turf', body)
        .then((res) => {
          console.log(res)
          setTurfs((prevTurfs) =>
            prevTurfs.map((turf) =>
              turf._id === id ? { ...turf, isApproved: !turf.isApproved } : turf
            )
          );
          setShowModal(false);
        })
        .catch((err) => {
          console.error("Error handling turf action:", err);

        });
    }
  };  
  

  const handleCancelAction = () => {
    setShowModal(false);
  };

  const filteredTurfs = turfs.filter(
    (turf) =>
      turf.turfName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      turf.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      turf.mobileNumber.includes(searchQuery)
  );

  // Paginate turfs
  const indexOfLastTurf = currentPage * turfsPerPage;
  const indexOfFirstTurf = indexOfLastTurf - turfsPerPage;
  const currentTurfs = filteredTurfs.slice(indexOfFirstTurf, indexOfLastTurf);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const handleShowReports = (reports:any) => {
    const reportCounts = reports.reduce((acc:any, report:any) => {
      acc[report] = (acc[report] || 0) + 1; // Increment the count for the report
      return acc;
    }, {});
    console.log(reportCounts);
    setReportCounts(reportCounts);
    setIsModalOpen(true);
  };
  const onClose = () => {
    setIsModalOpen(false);
  };
 const deleteReview = async (reviewId: string) => {
    try {
      const response = await apiClient.delete(`/admin/delete-review/${reviewId}`);
      if (response.status === 200) {
        setTurfReviews((prevReviews) =>
          prevReviews.filter((review) => review._id !== reviewId)
        );
      } else {
        throw new Error("Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
 }}
  return (
    <>
    {reviewDeleteModal && (
       <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-75 flex justify-center items-center">
       <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
         <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h2>
         <p className="text-gray-700 mb-4">Are you sure you want to delete this review?</p>
         <div className="flex justify-between">
           <button
             onClick={() => setReviewDeleteModal(false)}
             className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
           >
             Cancel
           </button>
           <button
             onClick={() => {deleteReview(deleteReviewId)
                setReviewDeleteModal(false)}}
             className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
           >
             Delete
           </button>
         </div>
       </div>
     </div>
    )}
    {reviewModal && (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center">
      <div className="bg-gray-100 text-gray-800 p-6 rounded-lg shadow-xl w-3/5 h-3/4 relative flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-center border-b border-gray-300 pb-2">
          Turf Reviews
        </h2>
    
        <div className="flex-1 overflow-auto">
          <table className="table-auto w-full border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-gray-300 to-gray-200 text-gray-700">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Comment</th>
                <th className="px-4 py-2 text-left">Rating</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentReviews.map((review, index) => (
                <tr
                  key={review._id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-200" : "bg-gray-100"
                  } hover:bg-gray-300`}
                >
                  <td className="px-4 py-2">{review.firstName} {review.lastName}</td>
                  <td className="px-4 py-2">{review.comment}</td>
                  <td className="px-4 py-2">{review.rating}</td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                      onClick={() => {
                        setDeleteReviewId(review._id)
                        setReviewDeleteModal(true)}}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    
        {/* Pagination Controls */}
        <div className="mt-4 flex justify-between items-center">
          <button
            className={`${
              currentPage === 1
                ? "bg-gray-400 text-gray-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } px-4 py-2 rounded`}
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Previous
          </button>
          <p className="text-gray-600">
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
          <button
            className={`${
              currentPage === totalPages
                ? "bg-gray-400 text-gray-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } px-4 py-2 rounded`}
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
    
        <button
          className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          onClick={() => setReviewModal(false)}
        >
          ✕
        </button>
      </div>
    </div>
    
    
    )}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={onClose}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <h2 className="text-xl text-center font-semibold text-gray-800 mb-4">
              Report Summary
            </h2>
            <ul className="space-y-2 text-center">
              {Object.entries(reportCounts).length === 0 ? (
                <li className="text-gray-700 text-center">No Reportings</li>
              ) : (
                Object.entries(reportCounts).map(([report, count]) => (
                  <li key={report} className="text-gray-700">
                    <span className="font-medium">{report}:</span>{" "}
                    <span className="font-semibold">{count as React.ReactNode}</span>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-6 text-right flex justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-gray-950 p-4 min-h-screen">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-200">Turf Management</h1>
          <input
            type="text"
            className="px-4 w-1/3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 focus:outline-none focus:ring focus:ring-yellow-500"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800 text-xs uppercase text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Turf No
                </th>
                <th scope="col" className="px-6 py-3">
                  Turf Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Mobile Number
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Count of Booking
                </th> */}
                <th scope="col" className="px-6 py-3">
                  Reviews
                </th>
                <th scope="col" className="px-6 py-3">
                  Reports
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTurfs.length > 0 ? (
                currentTurfs.map((turf, index) => (
                  <tr
                    className="bg-gray-900 border-b border-gray-700 hover:bg-gray-800"
                    key={turf._id}
                  >
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{turf.turfName}</td>
                    <td className="px-6 py-4">{turf.email}</td>
                    <td className="px-6 py-4">{turf.mobileNumber}</td>
                    {/* <td className="px-6 py-4">{turf.bookingsCount}</td> */}
                    <td className="px-6 py-4">
                      <button
                        className="bg-teal-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition duration-200"
                        onClick={() => getReviewsByTurfId(review,turf._id)}
                      >
                        Reviews
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={() => handleShowReports(turf.reports)}
                      >
                        View Reports
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className={`${
                          turf.isApproved
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        } text-white font-bold py-2 px-4 rounded-lg`}
                        onClick={() => handleApproveOrBlockClick(turf)}
                      >
                        {turf.isApproved ? "Block" : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-6">
                    No Turf found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          {Array.from(
            { length: Math.ceil(filteredTurfs.length / turfsPerPage) },
            (_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`mx-1 px-3 py-2 rounded-lg font-bold ${
                  currentPage === index + 1
                    ? "bg-yellow-500"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {index + 1}
              </button>
            )
          )}
        </div>

        {/* Confirmation Modal */}
        {showModal && selectedTurf && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-400 p-8 rounded-xl shadow-xl transform transition-all duration-500 scale-100 hover:scale-105">
              <h2 className="text-2xl text-center font-bold text-white mb-6">
                Are you sure?
              </h2>
              <p className="text-lg text-gray-200 mb-6">
                Are you sure you want to{" "}
                {selectedTurf.isApproved ? "block" : "approve"}{" "}
                <span className="font-semibold text-yellow-400">
                  {selectedTurf.turfName}
                </span>
                ?
              </p>
              <div className="flex justify-center space-x-6">
                <button
                  className="bg-yellow-300 hover:bg-gray-500 text-black font-semibold py-2 px-6 rounded-lg transform transition-all duration-300"
                  onClick={handleCancelAction}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transform transition-all duration-300"
                  onClick={handleConfirmAction}
                >
                  {selectedTurf.isApproved ? "Block" : "Approve"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TurfManagement;
