import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    profile: { bio: '', department: '', year: '', contact: '' }
  });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        profile: {
          bio: user.profile?.bio || '',
          department: user.profile?.department || '',
          year: user.profile?.year || '',
          contact: user.profile?.contact || ''
        }
      });
    }
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (['bio', 'department', 'year', 'contact'].includes(name)) {
      setForm(prev => ({ ...prev, profile: { ...prev.profile, [name]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name: form.name, profile: form.profile });
      setMsg('Profile updated');
      setEditing(false);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed');
    }
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto' }}>
      <h2>Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>

      {!editing && (
        <>
          <p><strong>Bio:</strong> {user.profile?.bio}</p>
          <p><strong>Department:</strong> {user.profile?.department}</p>
          <p><strong>Year:</strong> {user.profile?.year}</p>
          <p><strong>Contact:</strong> {user.profile?.contact}</p>
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        </>
      )}

      {editing && (
        <form onSubmit={onSubmit}>
          <input name="name" value={form.name} onChange={onChange} />
          <textarea name="bio" value={form.profile.bio} onChange={onChange} />
          <input name="department" value={form.profile.department} onChange={onChange} />
          <input name="year" value={form.profile.year} onChange={onChange} />
          <input name="contact" value={form.profile.contact} onChange={onChange} />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      )}

      {msg && <p>{msg}</p>}
    </div>
  );
}
