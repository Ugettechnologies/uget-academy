'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  published: boolean;
  createdAt: string;
}

export default function CourseBuilder() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch instructor courses
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        // Since /api/courses returns all published courses unless filtered,
        // we'll filter them or fetch them directly if we have an endpoint.
        // For development, our API lists all. Let's filter instructor courses if needed, 
        // or for now just display whatever is returned as a list of courses.
        setCourses(data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create course.');
        setLoading(false);
        return;
      }

      setSuccess('Course created successfully!');
      setTitle('');
      setDescription('');
      setPrice('0');
      fetchCourses();
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (courseId: string, currentPublished: boolean) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentPublished }),
      });

      if (response.ok) {
        fetchCourses();
      }
    } catch (err) {
      console.error('Error publishing course:', err);
    }
  };

  return (
    <div className="space-y-10">
      {/* Create Course Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">
          Create New Course
        </h3>

        <form onSubmit={handleCreateCourse} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 text-sm text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Course Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 py-3 text-gray-950 dark:text-white placeholder-gray-400 focus:border-brand-primary focus:ring-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition text-sm"
                placeholder="e.g., Introduction to React & TypeScript"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Description
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 py-3 text-gray-950 dark:text-white placeholder-gray-400 focus:border-brand-primary focus:ring-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition text-sm"
                placeholder="Describe what students will learn in this course..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Price (NGN / USD)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 py-3 text-gray-950 dark:text-white placeholder-gray-400 focus:border-brand-primary focus:ring-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition text-sm"
                placeholder="0 for free courses"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-lg border border-transparent bg-brand-primary py-3 px-4 text-sm font-semibold text-white hover:bg-brand-primary/95 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 transition shadow-lg shadow-brand-primary/20"
          >
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </div>

      {/* Courses List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">
          Your Courses
        </h3>

        {fetching ? (
          <div className="py-12 text-center text-sm text-gray-500">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">
            You haven't created any courses yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col justify-between p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:shadow-md transition"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        course.published
                          ? 'bg-green-50 text-green-700 border border-green-150'
                          : 'bg-amber-50 text-amber-700 border border-amber-150'
                      }`}
                    >
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-sm font-bold text-brand-primary">
                      {course.price === 0 ? 'Free' : `₦${course.price.toLocaleString()}`}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                    {course.title}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href={`/instructor/courses/${course.id}`}
                    className="flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2 px-4 text-xs font-semibold text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
                  >
                    Manage Course & Lessons
                  </Link>

                  <button
                    onClick={() => handlePublish(course.id, course.published)}
                    className={`flex items-center justify-center rounded-lg py-2 px-4 text-xs font-semibold text-white transition ${
                      course.published
                        ? 'bg-amber-600 hover:bg-amber-500'
                        : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    {course.published ? 'Unpublish' : 'Publish Course'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
