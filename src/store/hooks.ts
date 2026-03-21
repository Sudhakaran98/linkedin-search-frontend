import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/** Pre-typed dispatch hook */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Pre-typed selector hook */
export function useAppSelector<T>(selector: (state: RootState) => T): T {
  return useSelector(selector);
}
