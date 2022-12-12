import { useEffect, useReducer, useRef } from 'react';

interface State<T> {
  data?: T;
  status: Status;
}

interface Status {
  idle: boolean;
  loading: boolean;
  fetched: boolean;
  error?: Error;
}

interface useFetchOptions {
  clientCache?: boolean
}

type Cache<T> = { [url: string]: T };

type Action<T> = { type: 'loading' } | { type: 'fetched'; payload: T } | { type: 'error'; payload: Error };

function useFetch<T = unknown>(url?: string, options?: RequestInit, useFetchOptions?: useFetchOptions): State<T> {
  const cache = useFetchOptions?.clientCache ? useRef<Cache<T>>({}) : false;

  const cancelRequest = useRef<boolean>(false);

  const initialState: State<T> = {
    status: {
      idle: true,
      loading: false,
      fetched: false,
      error: undefined
    },
    data: undefined
  };

  const fetchReducer = (state: State<T>, action: Action<T>): State<T> => {
    switch (action.type) {
      case 'loading':
        return { ...initialState, status: { ...initialState.status, loading: true, idle: false } };
      case 'fetched':
        return { data: action.payload, status: { ...initialState.status, loading: false, fetched: true } };
      case 'error':
        return { ...initialState, status: { ...initialState.status, loading: false, error: action.payload } };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(fetchReducer, initialState);

  useEffect(
    () => {
      if (!url) return;

      cancelRequest.current = false;

      const fetchData = async () => {
        dispatch({ type: 'loading' });

        if (cache && cache.current[url]) {
          dispatch({ type: 'fetched', payload: cache.current[url] });
          return;
        }

        try {
          const response = await fetch(url, options);
          if (!response.ok) {
            throw new Error(response.statusText);
          }

          const data = (await response.json()) as T;
          if (cache) cache.current[url] = data;
          if (cancelRequest.current) return;

          dispatch({ type: 'fetched', payload: data });
        } catch (error) {
          if (cancelRequest.current) return;

          dispatch({ type: 'error', payload: error as Error });
        }
      };

      void fetchData();

      return () => {
        cancelRequest.current = true;
      };
    },
    [url]
  );

  return state;
}

export default useFetch;
