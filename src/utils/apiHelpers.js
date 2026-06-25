/**
 * Normalize paginated API responses.
 * Backend paginatedResponse puts the list directly in `data` (array),
 * while successResponse may nest under a named key e.g. { pgs: [...] }.
 */
export const parsePaginatedResponse = (axiosResponse, namedKey) => {
  const body = axiosResponse?.data ?? {};
  const { data, pagination } = body;

  if (Array.isArray(data)) {
    return { items: data, pagination: pagination ?? null };
  }

  if (data && typeof data === 'object' && namedKey && Array.isArray(data[namedKey])) {
    return {
      items: data[namedKey],
      pagination: pagination ?? data.pagination ?? null,
    };
  }

  if (data && typeof data === 'object') {
    const fallbackKey = ['meetups', 'requests', 'pgs', 'users', 'items'].find(
      (k) => Array.isArray(data[k])
    );
    if (fallbackKey) {
      return { items: data[fallbackKey], pagination: pagination ?? data.pagination ?? null };
    }
  }

  return { items: [], pagination: pagination ?? null };
};

export const parseEntityResponse = (axiosResponse, entityKey) => {
  const data = axiosResponse?.data?.data;
  if (!data) return null;
  if (entityKey && data[entityKey] !== undefined) return data[entityKey];
  return data;
};

export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  return error.message || fallback;
};
