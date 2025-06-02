import { useEffect, useState, useCallback, useContext } from "react";
// import { token as staticToken } from "../config";
import { AuthContext } from "../context/AuthContext.jsx";

const useFetchData = url => {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to fetch data');
      }

      setData(result.data);
    } catch (err) {
      setError(err.message);
      // console.error("Fetch Data Error:", err);
    } finally {
      setLoading(false);
    }
  }, [url, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

export default useFetchData;
