'use client';

import { Dispatch, SetStateAction } from 'react';
import Input from '@/components/ui/Input';

// Define types for the component's props
interface Speciality {
  id: number;
  name: string;
}

interface DoctorSearchFiltersProps {
  specialities: Speciality[];
  selectedSpeciality: string;
  setSelectedSpeciality: Dispatch<SetStateAction<string>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}

export default function DoctorSearchFilters({
  specialities,
  selectedSpeciality,
  setSelectedSpeciality,
  searchQuery,
  setSearchQuery,
}: DoctorSearchFiltersProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-3">Filter & Search</h3>
      
      {/* Search by Name Input */}
      <div>
        <Input
          id="search-query"
          label="Doctor's Name"
          placeholder="e.g., Dr. Smith"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter by Speciality Dropdown */}
      <div>
        <label htmlFor="speciality" className="block text-sm font-medium text-gray-700 mb-1">
          Speciality
        </label>
        <select
          id="speciality"
          value={selectedSpeciality}
          onChange={(e) => setSelectedSpeciality(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Specialities</option>
          {specialities.map((spec) => (
            <option key={spec.id} value={spec.id}>
              {spec.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}