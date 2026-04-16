<<<<<<< HEAD
=======
"use client";
>>>>>>> 7e97373 (pls)

export default function Home() {
  return (
<<<<<<< HEAD
    <div className="">
      <section
        className="h-[300px] w-[300px]"
      >
      </section>
=======
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-gray-900 tracking-tight">
            AI Travel Agent
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your trip details to generate a custom itinerary
          </p>
        </div>

        {/* Travel Form */}
        <form
          className="mt-8 space-y-4 bg-white p-8 rounded-xl shadow-lg border border-gray-100"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
                Origin
              </label>
              <input
                id="origin"
                name="origin"
                type="text"
                required
                value={formData.origin}
                onChange={handleChange}
                placeholder="Where are you starting from?"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                Destination
              </label>
              <input
                id="destination"
                name="destination"
                type="text"
                required
                value={formData.destination}
                onChange={handleChange}
                placeholder="Where do you want to go?"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                  Budget ($)
                </label>
                <input
                  id="budget"
                  name="budget"
                  type="number"
                  required
                  min="1"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="2000"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="days" className="block text-sm font-medium text-gray-700">
                  Days
                </label>
                <input
                  id="days"
                  name="days"
                  type="number"
                  required
                  min="1"
                  value={formData.days}
                  onChange={handleChange}
                  placeholder="5"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
            >
              {/* Dynamic button text based on the current generation state */}
              {loading ? "Generating Itinerary..." : "Generate Itinerary"}
            </button>
          </div>
        </form>

        {/* Results Area */}
        {result && (
          <div className="mt-8 w-full">
            {result.success ? (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-50 border-l-4 border-l-blue-500">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                  Your Destination: {formData.destination}
                </h2>
                {/* Result Block: Preserve line breaks and whitespace using whitespace-pre-wrap */}
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-mono text-sm max-h-[500px] overflow-y-auto">
                  {result.itinerary}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-md border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error generating itinerary
                    </h3>
                    <div className="mt-2 text-sm text-red-700 italic">
                      {result.error}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
>>>>>>> 7e97373 (pls)
    </div>
  );
}
