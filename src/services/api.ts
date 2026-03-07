import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setShowAddPost, setShowProgress } from '../utils/uiSlice';
import { ResponseData } from './apiTypes';
import { showAlert } from '../utils/alertSlice';
import Urls from './Urls';
import Language from './Language';

// @ts-ignore
const baseQueryWithReAuth = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: Urls.apiUrl,
    timeout: 30000,
    prepareHeaders: async (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  });

  api.dispatch(setShowProgress(true));
  let response = await baseQuery(args, api, extraOptions);

  // Error response handling
  if (response.error) {
    if (
      response.error.status === 'TIMEOUT_ERROR' ||
      response.error.status === 'FETCH_ERROR'
    ) {
      // extraOptions && extraOptions.hideProgress;
      api.dispatch(
        showAlert({
          title: Language.error,
          message: Language.network_timeout,
          confirmText: Language.enter,
        }),
      );
    } else {
      const errorData = response.error.data as ResponseData;
      if (response.error.status === 401 || response.error.status === 403) {
        sessionStorage.clear();
        api.dispatch(setShowAddPost(false));
      }

      if (extraOptions && extraOptions.hideProgress) {
      } else {
        api.dispatch(
          showAlert({
            title: Language.error,
            message: errorData.resultMessage,
            confirmText: Language.enter,
          }),
        );
      }
    }
  }
  api.dispatch(setShowProgress(false));
  return response;
};

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: 'api',
  // @ts-ignore
  baseQuery: baseQueryWithReAuth,
  endpoints: () => ({}),
});