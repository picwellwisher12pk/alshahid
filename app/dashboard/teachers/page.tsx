"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Users, School } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Teacher {
  id: string;
  bio: string | null;
  profilePictureUrl: string | null;
  isActive: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  _count: {
    students: number;
    classes: number;
  };
}

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }

      const data = await response.json();
      setTeachers(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (teacherId: string) => {
    if (!confirm('Are you sure you want to deactivate this teacher?')) return;

    try {
      const response = await fetch(`/api/teachers/${teacherId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate teacher');
      }

      fetchTeachers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">Loading teachers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Teachers Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage all teachers in the system
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button
              onClick={() => router.push('/dashboard/teachers/new')}
              className="inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Teacher
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {teacher.profilePictureUrl ? (
                      <img
                        className="h-12 w-12 rounded-full"
                        src={teacher.profilePictureUrl}
                        alt={teacher.user.fullName}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-lg">
                          {teacher.user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {teacher.user.fullName}
                    </h3>
                    <p className="text-sm text-gray-500">{teacher.user.email}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      teacher.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {teacher.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {teacher.bio && (
                  <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                    {teacher.bio}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{teacher._count.students} Students</span>
                  </div>
                  <div>
                    <span>{teacher._count.classes} Classes</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/teachers/${teacher.id}`)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {teacher.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivate(teacher.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {teachers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <School className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new teacher.
            </p>
            <div className="mt-6">
              <Button onClick={() => router.push('/dashboard/teachers/new')}>
                <Plus className="h-5 w-5 mr-2" />
                Add Teacher
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
