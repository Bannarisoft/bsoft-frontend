import { useState, useEffect } from "react";
import { Apirequest } from "../utils/lib";

export const useDataFetchHook = (
  endpoint: string,
  method: string,
  module?: string,
  refreshKey?: number
) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await Apirequest(
          endpoint,
          method,
          null,
          module ? module : undefined
        ).then((res) => res.data);

        setData(response?.data);

        if (response?.totalCount) {
          setCount(response.totalCount);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    if (endpoint && method) {
      fetchData();
    }
  }, [endpoint, method, module, refreshKey]);

  return { data, loading, error, count };
};
