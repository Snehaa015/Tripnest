import api from './api';

export const uploadDocument = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

export const generateItinerary = async (extractedData, tempFile) => {
  const response = await api.post('/itinerary/generate', { extractedData, tempFile });
  return response.data;
};

export const getItineraries = async (search = '') => {
  const response = await api.get('/itinerary', {
    params: { search },
  });
  return response.data;
};

export const getItineraryById = async (id, lang = '') => {
  const response = await api.get(`/itinerary/${id}`, {
    params: { lang }
  });
  return response.data;
};

export const deleteItinerary = async (id) => {
  const response = await api.delete(`/itinerary/${id}`);
  return response.data;
};

export const getPublicItinerary = async (shareId, lang = '') => {
  const response = await api.get(`/share/${shareId}`, {
    params: { lang }
  });
  return response.data;
};

export const shareItinerary = async (id) => {
  const response = await api.post(`/itinerary/${id}/share`);
  return response.data;
};
