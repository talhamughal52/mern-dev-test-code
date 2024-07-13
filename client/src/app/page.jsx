"use client";

import { useState } from "react";
import axios from "axios";
import { useAuth } from "./_hooks/AuthProvider";
import { redirect } from "next/navigation";

export default function Page() {
  const user = useAuth();
  if (!user.token) return redirect("/login");

  const [maxPictures, setMaxPictures] = useState(1);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const model = e.target.model.value;
    const price = e.target.price.value;
    const phone = e.target.phone.value;
    const city = e.target.city.value;

    if (!model || !price || !phone || !city || !images.length) {
      setError("Please fill in all fields");
      return;
    }

    if (model.length < 3) {
      setError("Car Model must be minium 3 letters");
      return;
    }

    if (phone.length !== 11) {
      setError("Phone number must be exactly 11 digits");
      return;
    }

    if (maxPictures < images.length) {
      setError("Please upload less images");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("model", model);
      formData.append("price", price);
      formData.append("phone", phone);
      formData.append("city", city);
      formData.append("maxPictures", maxPictures);
      images.forEach((image) => formData.append("images", image));

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/add-car`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("mernTestToken")}`,
          },
        }
      );

      if (res.status === 201) {
        setSuccess(true);
        e.target.reset();
        setImages([]);
        setPreviewImages([]);
        setLoading(false);
        setMaxPictures(1);

        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      if (err.response.status == 401) {
        localStorage.removeItem("mernTestToken");
        user.setToken("");
      }
      setError(err.response.data.message);
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    let files = Array.from(e.target.files);
    if (files.length > maxPictures) {
      setError(`You can upload up to ${maxPictures} pictures`);
      files = files.slice(0, maxPictures);
      setImages(files);
    } else {
      setImages(files);
      setError("");
    }

    const images = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(images);
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-8">
      <form
        className="w-full max-w-md bg-white border border-gray-300 shadow-md rounded-lg p-6"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold text-center mb-6">Add Car</h1>
        <input
          required
          type="text"
          placeholder="Car Model"
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          name="model"
        />
        <input
          type="number"
          required
          placeholder="Price"
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          name="price"
        />
        <input
          type="number"
          required
          placeholder="Phone Number"
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          name="phone"
        />
        <input
          type="text"
          required
          placeholder="City"
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          name="city"
          pattern="[A-Za-z\s]+"
        />
        <input
          type="number"
          required
          placeholder="Max Pictures"
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          name="maxPictures"
          min={1}
          max={10}
          value={maxPictures}
          onChange={(e) => setMaxPictures(e.target.value)}
        />
        <input
          required
          type="file"
          multiple
          accept="image/*"
          name="images"
          onChange={handleImageChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
        />
        <div className="flex flex-wrap -mx-2 mb-4">
          {previewImages.map((preview, index) => (
            <img
              key={index}
              src={preview}
              alt="Preview"
              className="w-1/4 h-24 object-cover mx-2 mb-2 rounded-md"
            />
          ))}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Loading..." : "Submit"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && (
          <p className="text-green-500 mt-2">Car added successfully</p>
        )}
      </form>
    </section>
  );
}
