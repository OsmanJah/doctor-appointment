import { useEffect, useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
// import { token as staticToken } from "../config";
import { AuthContext } from "../context/AuthContext.jsx";

const useFetchData = url => {
  const navigate = useNavigate();
  const { token, dispatch } = useContext(AuthContext);
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

      // If token expired or unauthorized, force logout and redirect
      if (res.status === 401 || res.status === 403) {
        dispatch({ type: "LOGOUT" });
        navigate("/login", { replace: true });
        return; // halt further processing
      }

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
