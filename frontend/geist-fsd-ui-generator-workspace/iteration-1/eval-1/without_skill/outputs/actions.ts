'use server'

import { apiClient } from './apiClient';

export async function updateApiTokenAction(token: string) {
  try {
    const response = await apiClient.put('/api/token', { token });
    return { success: true, message: 'Token updated successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to update token' };
  }
}
