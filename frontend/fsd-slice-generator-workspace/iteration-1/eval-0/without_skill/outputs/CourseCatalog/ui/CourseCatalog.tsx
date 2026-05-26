import React from 'react';
import { apiClient } from '@/shared/api';
import { CourseCatalogGrid } from './CourseCatalogGrid';

export async function CourseCatalog() {
  // Fetch courses via apiClient
  // Adjust the API call based on your actual apiClient implementation
  let courses = [];
  try {
    const response = await apiClient.get('/courses');
    courses = response.data || response;
  } catch (error) {
    console.error('Failed to fetch courses:', error);
  }

  return (
    <section className="course-catalog-widget p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Course Catalog</h2>
      <CourseCatalogGrid courses={courses} />
    </section>
  );
}
