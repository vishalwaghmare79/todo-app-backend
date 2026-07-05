import axios from 'axios';

export async function request(config) {
  try {
    const response = await axios(config);
    return { status: response.status, data: response.data };
  } catch (error) {
    if (error.response) {
      return { status: error.response.status, data: error.response.data };
    }

    return {
      status: 503,
      data: { message: 'Service unavailable' }
    };
  }
}
