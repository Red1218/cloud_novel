import { useNavigate } from 'react-router-dom';

/** Back to wherever the page was opened from, or `fallback` on a fresh load. */
export function useBack(fallback: string) {
  const navigate = useNavigate();
  return () => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate(fallback));
}
