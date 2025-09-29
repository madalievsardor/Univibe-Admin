import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/AuthSlice";

const useFetch = (baseUrl, options = {}, autoFetch = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const optionsRef = useRef(options);

  const fetchData = useCallback(
    async (url, overrideOptions = {}) => {
      if (!url) return;
      setLoading(true);
      setError(null);
      console.log("worked");
      try {
        console.log("worked")
        const response = await fetch(url, {
          ...optionsRef.current,
          ...overrideOptions,
        });
        if (!response.ok) {
          const errorText = await response.text();
          const errorMessage = `Error: ${response.status} ${response.statusText} - ${errorText} (URL: ${url})`;
          if (response.status === 401 || response.status === 403) {
            dispatch(logout());
            navigate("/login");
            throw new Error("Unauthorized or Forbidden: Redirecting to login");
          }

          throw new Error(errorMessage);
        }

        const result = await response.json();
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err.message || "An unknown error occurred";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, navigate]
  );

  useEffect(() => {
    if (autoFetch && baseUrl) {
      fetchData(baseUrl);
    }
  }, [baseUrl, autoFetch, fetchData]);

  const revalidate = () => fetchData(baseUrl);

  const postData = async (url, body, additionalHeaders = {}) => {
    const isFormData = body instanceof FormData;
    const headers = isFormData
      ? { ...optionsRef.current.headers, ...additionalHeaders }
      : {
          "Content-Type": "application/json",
          ...optionsRef.current.headers,
          ...additionalHeaders,
        };

    return fetchData(url, {
      method: "POST",
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
  };

  const putData = async (url, body) =>
    fetchData(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...optionsRef.current.headers },
      body: JSON.stringify(body),
    });

  const deleteData = async (url) =>
    fetchData(url, {
      method: "DELETE",
      headers: optionsRef.current.headers,
    });

  return { data, loading, error, revalidate, postData, putData, deleteData };
};

export default useFetch;
