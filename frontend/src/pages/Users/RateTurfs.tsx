"use client";

import { X } from "lucide-react";
import { useState } from "react";

export default function MovieRating() {
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tags = [
    "DirectionWorks",
    "Entertaining",
    "Interesting",
    "NiceStory",
    "Timepass",
    "CoolMusic",
    "OneTimeWatch",
    "Fun",
    "QuiteNice",
  ];

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div
    className="max-w-sm mx-auto bg-gradient-to-r from-white to-gray-50 p-6 md:p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105"
    style={{ width: "90%", height: "auto" }}
    role="dialog"
    aria-labelledby="modal-title"
  aria-describedby="modal-description"
  >
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">How was the movie?</h2>
        <p className="text-gray-500 text-sm italic">Mufasa: The Lion King</p>
      </div>
      <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  
    {/* Rating Slider */}
    <div className="mb-6">
      <h3 className="text-base font-medium mb-4 text-gray-700">
        How would you rate the movie?
      </h3>
      <div className="flex items-center gap-4">
    <div className="relative flex-1">
      {/* Star Above the Slider */}
      <div
        className="absolute -top-6 left-0 transform -translate-x-1/2 text-red-500 text-xl font-bold"
        style={{
          left: `${(rating / 10) * 100}%`, // Position dynamically based on rating
        }}
      >
        ★
      </div>
  
      {/* Slider Input */}
      <input
        type="range"
        min="0"
        max="10"
        value={rating}
        onChange={(e) => setRating(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
      />
    </div>
    <span className="text-gray-800 font-medium text-sm">{rating}/10</span>
  </div>
  
    </div>
  
    {/* Show hashtags and comment section only if rating >= 1 */}
    {rating > 0 && (
      <>
        {/* Tags Section */}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-3 text-gray-700">
            What do you think about the movie?
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Express yourself with hashtags!
          </p>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors shadow-md ${
                  selectedTags.includes(tag)
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-red-100 hover:text-red-500"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
  
        {/* Review Text Area */}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-3 text-gray-700">
            Express more, write a review
          </h3>
          <textarea
            placeholder="Optional"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
            rows={3}
          />
        </div>
      </>
    )}
  
    {/* Submit Button */}
    <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-lg font-medium text-base hover:from-red-600 hover:to-red-700 shadow-lg transition-transform transform hover:scale-105">
      Submit Rating
    </button>
  </div>
  );
}
