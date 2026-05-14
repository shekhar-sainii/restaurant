import React, { useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Loader2, CheckCircle, AlertCircle, User, Phone, Mail } from 'lucide-react';

const UserForm = ({ user, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.image || null);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('mobile', formData.mobile);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await adminService.updateUser(user._id, data);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Profile Image Picker */}
      <div className="flex flex-col items-center gap-4">
        <label className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/40">
            {imagePreview ? (
              <img 
                src={imagePreview.startsWith('blob:') ? imagePreview : `${API_URL}${imagePreview}`} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-text-muted">
                <User size={32} />
                <span className="text-[8px] font-black uppercase mt-1">Upload</span>
              </div>
            )}
          </div>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </label>
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Profile Picture</p>
      </div>

      {/* Profile Info Display (Read Only) */}
      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Account Identifier</p>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">{user.role}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Mail size={16} className="text-primary/60" />
          <span className="text-white/60">{user.email || 'No email provided'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/40 transition-all text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Mobile Contact</label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/40 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-10 border-t border-white/5">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-10 py-3.5 rounded-2xl flex items-center gap-2 shadow-[0_15px_30px_rgba(201,162,39,0.2)]"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <CheckCircle size={18} />
          )}
          <span className="text-xs font-black uppercase tracking-widest">
            Update Profile
          </span>
        </button>
      </div>
    </form>
  );
};

export default UserForm;
