// Mocked openapi-fetch client for FSD
export const apiClient = {
  PUT: async (path: string, options: any) => {
    return { data: { success: true }, error: null };
  }
};

export default apiClient;
