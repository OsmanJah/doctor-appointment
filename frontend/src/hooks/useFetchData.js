import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { useQuery } from '@tanstack/react-query';

const useFetchData = url => {
  const navigate = useNavigate();
  const { token, dispatch } = useContext(AuthContext);

  const query = useQuery({
    queryKey: ["fetch", url, token],
    queryFn: async () => {
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, { headers });

      if (res.status === 401 || res.status === 403) {
        dispatch({ type: "LOGOUT" });
        navigate("/login", { replace: true });
        throw new Error('Unauthorized');
      }

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to fetch data');
      return result.data;
    },
    staleTime: 5 * 60_000,
    retry: 2,
  });

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch
  };
};

export default useFetchData;
