import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Filter, Download, Search, Calendar, GraduationCap, Clock, Star, Eye } from 'lucide-react';
import StarField from '../components/StarField';

export default function PreviousPapers() {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: '',
    branch: '',
    examYear: '',
    semester: '',
    search: ''
  });

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const branches = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering'
  ];
  const examYears = ['2024', '2023', '2022', '2021', '2020', '2019'];
  const semesters = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];

  useEffect(() => {
    fetchPapers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, papers]);

  const fetchPapers = async () => {
    try {
      // Mock data - replace with actual API call
      const mockPapers = [
        {
          id: 1,
          title: 'Data Structures Mid-Term Exam',
          subject: 'Data Structures',
          year: '2nd Year',
          branch: 'Computer Science Engineering',
          examYear: '2023',
          semester: '3rd Semester',
          uploadedBy: 'Dr. Smith',
          uploadDate: '2024-01-15',
          fileUrl: '#',
          hasSolutions: true,
          duration: '3 hours',
          downloads: 342,
          rating: 4.9
        },
        {
          id: 2,
          title: 'Database Systems Final Exam',
          subject: 'DBMS',
          year: '3rd Year',
          branch: 'Computer Science Engineering',
          examYear: '2023',
          semester: '5th Semester',
          uploadedBy: 'Prof. Johnson',
          uploadDate: '2024-01-12',
          fileUrl: '#',
          hasSolutions: true,
          duration: '3 hours',
          downloads: 278,
          rating: 4.7
        },
        {
          id: 3,
          title: 'Digital Electronics Mid-Term',
          subject: 'Digital Electronics',
          year: '2nd Year',
          branch: 'Electronics & Communication',
          examYear: '2022',
          semester: '4th Semester',
          uploadedBy: 'Dr. Wilson',
          uploadDate: '2024-01-10',
          fileUrl: '#',
          hasSolutions: false,
          duration: '2 hours',
          downloads: 195,
          rating: 4.5
        }
      ];
      setPapers(mockPapers);
      setFilteredPapers(mockPapers);
    } catch (error) {
      console.error('Error fetching papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = papers;

    if (filters.year) {
      filtered = filtered.filter(paper => paper.year === filters.year);
    }
    if (filters.branch) {
      filtered = filtered.filter(paper => paper.branch === filters.branch);
    }
    if (filters.examYear) {
      filtered = filtered.filter(paper => paper.examYear === filters.examYear);
    }
    if (filters.semester) {
      filtered = filtered.filter(paper => paper.semester === filters.semester);
    }
    if (filters.search) {
      filtered = filtered.filter(paper =>
        paper.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        paper.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
        paper.uploadedBy.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredPapers(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ year: '', branch: '', examYear: '', semester: '', search: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
          <span className="text-gray-300">Loading papers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <StarField />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <FileText className="w-16 h-16 text-purple-400 animate-bounce" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 animate-glow">
            Previous Papers
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Access previous year question papers with solutions to ace your exams
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold">Filter Papers</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search papers..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 text-white pl-10 pr-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
            </div>

            {/* Year Filter */}
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Branch Filter */}
            <select
              value={filters.branch}
              onChange={(e) => handleFilterChange('branch', e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>

            {/* Exam Year Filter */}
            <select
              value={filters.examYear}
              onChange={(e) => handleFilterChange('examYear', e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="">Exam Year</option>
              {examYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Semester Filter */}
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="">All Semesters</option>
              {semesters.map(semester => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">
              Showing {filteredPapers.length} of {papers.length} papers
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Papers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <div key={paper.id} className="group bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-2 shadow-2xl hover:shadow-purple-500/10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-300">{paper.rating}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-400 transition-colors duration-300">
                {paper.title}
              </h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">{paper.year} • {paper.semester}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Exam Year: {paper.examYear}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Duration: {paper.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-300">{paper.downloads} downloads</span>
                </div>
              </div>

              {paper.hasSolutions && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                    ✓ Solutions Available
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 group">
                  <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                  <span className="text-sm font-medium">Download</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors duration-200">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPapers.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No papers found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}