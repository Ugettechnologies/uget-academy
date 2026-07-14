import React from 'react';
import Link from 'next/link';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    instructor: {
      firstName: string;
      lastName: string;
    };
  };
  isEnrolled?: boolean;
}

export default function CourseCard({ course, isEnrolled = false }: CourseCardProps) {
  const priceDisplay = course.price === 0 ? 'Free' : `₦${course.price.toLocaleString()}`;

  return (
    <div className="flex flex-col justify-between p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-brand-primary/45 transition-all duration-300">
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] text-slate-450 font-bold tracking-wider uppercase">
            {course.instructor.firstName} {course.instructor.lastName}
          </span>
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/10">
            {priceDisplay}
          </span>
        </div>
        
        <h4 className="text-lg font-black text-slate-800 line-clamp-1 mb-2 tracking-tight">
          {course.title}
        </h4>
        
        <p className="text-xs text-slate-500 line-clamp-3 font-normal leading-relaxed">
          {course.description}
        </p>
      </div>

      <div className="mt-6">
        {isEnrolled ? (
          <Link
            href={`/student/courses/${course.id}`}
            className="flex w-full items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 px-4 text-xs font-bold text-white transition-all shadow-md shadow-emerald-600/10"
          >
            Watch Course Lessons
          </Link>
        ) : (
          <Link
            href={`/student/courses/${course.id}`}
            className="flex w-full items-center justify-center rounded-xl bg-brand-primary hover:bg-brand-primary/95 py-3 px-4 text-xs font-bold text-white transition-all shadow-lg shadow-brand-primary/10"
          >
            Learn More & Enroll
          </Link>
        )}
      </div>
    </div>
  );
}
