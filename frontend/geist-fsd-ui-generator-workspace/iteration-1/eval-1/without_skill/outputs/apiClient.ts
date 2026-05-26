export const apiClient = {
  put: async (url: string, data: any) => {
    // Mocked API PUT request
    console.log(`PUT ${url}`, data);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true };
  }
};
