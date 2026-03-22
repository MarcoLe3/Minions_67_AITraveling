"use client";

import { useState } from "react";

/**
 * AI Travel Agent - Basic Frontend
 * bascially the form integration and API connection.
 */
export default function Home() {
  // Form State: Tracks user inputs for the trip. 
  // Standard React state is used here for a controlled component pattern.
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    budget: "",
    days: "",
  });

  // UI State: Manages loading indicators and the API response.
  // The 'result' state stores the structured object returned by our FastAPI backend.
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    itinerary: string;
    success: boolean;
    error: string | null;
  } | null>(null);

  // Synchronize input changes with the formData state.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Core submission logic: Connects the Next.js frontend to the FastAPI backend.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null); // Clear previous results before starting a new generation.

    try {
      // POST the user's travel details as JSON to our backend server.
      const response = await fetch("http://localhost:8000/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: formData.origin,
          destination: formData.destination,
          budget: Number(formData.budget), // Convert strings from form inputs to Numbers
          days: Number(formData.days),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      // Catch network errors (like the backend being offline) and display them in the UI.
      setResult({
        itinerary: "",
        success: false,
        error: err.message || "An unexpected error occurred connecting to the backend.",
      });
    } finally {
      // Always stop the loading spinner once the request is complete (success or fail).
      setLoading(false);
    }
  };

  return (
  );
}
