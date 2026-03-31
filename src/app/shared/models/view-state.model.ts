export type ViewState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error | string }
  | { status: 'empty'; message?: string }
  | { status: 'content'; data: T };

export const ViewStateHelpers = {
  loading: <T>(): ViewState<T> => ({ status: 'loading' }),
  error: <T>(error: Error | string): ViewState<T> => ({ status: 'error', error }),
  empty: <T>(message?: string): ViewState<T> => ({ status: 'empty', message }),
  content: <T>(data: T): ViewState<T> => ({ status: 'content', data }),
};
