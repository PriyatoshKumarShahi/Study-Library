import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Upload,
  FileText,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Plus,
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import StarField from '../components/StarField';
import API from '../api';

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadType, setUploadType] = useState('notes');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    year: '',
    branch: '',
    semester: '',
    examYear: '',
    description: '',
    file: null
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
  const semesters = [
    '1st Semester',
    '2nd Semester',
    '3rd Semester',
    '4th Semester',
    '5th Semester',
    '6th Semester',
    '7th Semester',
    '8th Semester'
  ];
  const examYears = ['2024', '2023', '2022', '2021', '2020', '2019'];

  const isAdmin = user?.email === 'priytoshshahi90@gmail.com';

  useEffect(() => {
    if (!isAdmin) {
      setMessage({ type: 'error', text: 'Access denied. Admin privileges required.' });
    }
  }, [isAdmin]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (activeTab !== 'users') return;
      setLoadingUsers(true);
      try {
        const res = await API.get('/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsersList(res.data);
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Failed to fetch users' });
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please upload only PDF or Word documents.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 10MB.' });
      return;
    }
    setFormData((prev) => ({ ...prev, file }));
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage(null);

    try {
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('title', formData.title);
      uploadData.append('subject', formData.subject);
      uploadData.append('year', formData.year);
      uploadData.append('branch', formData.branch);
      uploadData.append('description', formData.description);

      if (uploadType === 'papers') {
        uploadData.append('semester', formData.semester);
        uploadData.append('examYear', formData.examYear);
      }

      const endpoint = uploadType === 'notes' ? '/notes/upload' : '/papers/upload';

      await API.post(endpoint, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setMessage({
        type: 'success',
        text: `${uploadType === 'notes' ? 'Notes' : 'Paper'} uploaded successfully!`
      });

      setFormData({
        title: '',
        subject: '',
        year: '',
        branch: '',
        semester: '',
        examYear: '',
        description: '',
        file: null
      });

      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      const errMsg = error.response?.data?.message || error.message || 'Upload failed';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setUploading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
        <StarField />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="bg-red-900/50 border border-red-700 rounded-2xl p-8 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <h2 className="text-2xl font-bold text-red-200">Access Denied</h2>
            </div>
            <p className="text-red-300">You don't have admin privileges to access this page.</p>
          </div>
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
              <Settings className="w-16 h-16 text-green-400 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 animate-glow">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Manage and upload study materials for students
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-900/50 border-green-700 text-green-200'
                : 'bg-red-900/50 border-red-700 text-red-200'
            } animate-fade-in`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl mb-8 shadow-2xl">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors duration-200 ${
                activeTab === 'upload' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Upload className="w-5 h-5" />
              Upload Content
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors duration-200 ${
                activeTab === 'manage' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Manage Content
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors duration-200 ${
                activeTab === 'users' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              User Management
            </button>
          </div>

          <div className="p-8">
            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <UploadTab
                uploadType={uploadType}
                setUploadType={setUploadType}
                formData={formData}
                handleInputChange={handleInputChange}
                handleFileChange={handleFileChange}
                handleSubmit={handleSubmit}
                uploading={uploading}
                years={years}
                branches={branches}
                semesters={semesters}
                examYears={examYears}
              />
            )}

            {/* Manage Tab */}
            {activeTab === 'manage' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Content Management</h2>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Content Management</h3>
                  <p className="text-gray-500">View and manage uploaded content</p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">User Management</h2>
                {loadingUsers ? (
                  <p className="text-gray-400">Loading users...</p>
                ) : usersList.length === 0 ? (
                  <p className="text-gray-400">No users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border border-gray-700 rounded-lg overflow-hidden">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-300">Name</th>
                          <th className="px-4 py-2 text-left text-gray-300">Email</th>
                          <th className="px-4 py-2 text-left text-gray-300">Role</th>
                          
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((u) => (
                          <tr key={u.email} className="border-b border-gray-700 hover:bg-gray-800 transition-colors duration-150">
                            <td className="px-4 py-2">{u.name}</td>
                            <td className="px-4 py-2">{u.email}</td>
                            <td className="px-4 py-2 capitalize">{u.role}</td>
                           
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Optional: extract Upload Tab to separate component for cleaner code
const UploadTab = ({
  uploadType,
  setUploadType,
  formData,
  handleInputChange,
  handleFileChange,
  handleSubmit,
  uploading,
  years,
  branches,
  semesters,
  examYears
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Upload Study Materials</h2>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setUploadType('notes')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
            uploadType === 'notes'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          Upload Notes
        </button>
        <button
          onClick={() => setUploadType('papers')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
            uploadType === 'papers'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <FileText className="w-5 h-5" />
          Upload Papers
        </button>
      </div>

     <form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">Title *</label>
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        placeholder={`Enter ${uploadType === 'notes' ? 'notes' : 'paper'} title`}
        className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        required
      />
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">Subject *</label>
      <input
        type="text"
        name="subject"
        value={formData.subject}
        onChange={handleInputChange}
        placeholder="Enter subject name"
        className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        required
      />
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">Year *</label>
      <select
        name="year"
        value={formData.year}
        onChange={handleInputChange}
        className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        required
      >
        <option value="">Select Year</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>

    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">Branch *</label>
      <select
        name="branch"
        value={formData.branch}
        onChange={handleInputChange}
        className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        required
      >
        <option value="">Select Branch</option>
        {branches.map((branch) => (
          <option key={branch} value={branch}>
            {branch}
          </option>
        ))}
      </select>
    </div>

    {uploadType === 'papers' && (
      <>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Semester *</label>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleInputChange}
            className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            required
          >
            <option value="">Select Semester</option>
            {semesters.map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Exam Year *</label>
          <select
            name="examYear"
            value={formData.examYear}
            onChange={handleInputChange}
            className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            required
          >
            <option value="">Select Exam Year</option>
            {examYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </>
    )}
  </div>

  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-300">Description</label>
    <textarea
      name="description"
      value={formData.description}
      onChange={handleInputChange}
      placeholder={`Enter ${uploadType === 'notes' ? 'notes' : 'paper'} description`}
      rows={4}
      className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
    />
  </div>

  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-300">File Upload *</label>
    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors duration-200">
      <input
        type="file"
        id="file-upload"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        className="hidden"
        required
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-300 mb-2">
          {formData.file ? formData.file.name : 'Click to upload file'}
        </p>
        <p className="text-sm text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
      </label>
    </div>
  </div>

  <button
    type="submit"
    disabled={uploading}
    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105"
  >
    {uploading ? (
      <span className="flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        Uploading...
      </span>
    ) : (
      <span className="flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" />
        Upload {uploadType === 'notes' ? 'Notes' : 'Paper'}
      </span>
    )}
  </button>
</form>

    </div>
  );
};
