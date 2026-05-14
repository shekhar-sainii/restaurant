import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { adminService } from '../../services/admin.service';
import AdminTable from '../../components/common/AdminTable';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import UserForm from '../../components/admin/UserForm';
import { selectAuth } from '../../redux/slices/authSlice';
import { 
  FiSearch, 
  FiMail, 
  FiPhone, 
  FiShield, 
  FiUser,
  FiCalendar,
  FiEdit,
  FiTrash2,
  FiEye,
  FiLock,
  FiUnlock,
  FiRefreshCw,
  FiAlertCircle
} from 'react-icons/fi';

const UserMgmt = () => {
  const { user: currentUser } = useSelector(selectAuth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingRole, setPendingRole] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.fetchUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenRoleChange = (user, newRole) => {
    if (user._id === currentUser?._id) {
      alert("Security: You cannot change your own role.");
      return;
    }
    setSelectedUser(user);
    setPendingRole(newRole);
    setIsRoleModalOpen(true);
  };

  const handleRoleConfirm = async () => {
    if (!selectedUser || !pendingRole) return;
    try {
      await adminService.updateUserRole(selectedUser._id, pendingRole);
      setIsRoleModalOpen(false);
      loadUsers();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleOpenDelete = (user) => {
    if (user._id === currentUser?._id) {
      alert("Security: You cannot delete your own account while logged in.");
      return;
    }
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      await adminService.deleteUser(selectedUser._id);
      setUsers(users.filter(u => u._id !== selectedUser._id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    loadUsers();
  };

  const handleOpenStatusModal = (user) => {
    if (user._id === currentUser?._id) {
      alert("Security: You cannot block your own account.");
      return;
    }
    setSelectedUser(user);
    setIsStatusModalOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!selectedUser) return;
    try {
      await adminService.toggleUserStatus(selectedUser._id);
      setIsStatusModalOpen(false);
      loadUsers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mobile?.includes(searchTerm)
  );

  const columns = [
    { 
      key: 'name', 
      label: 'Profile', 
      render: (val, row) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const displayName = val || 'Unknown';
        return (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary font-bold overflow-hidden">
              {row?.image ? (
                <img src={`${API_URL}${row.image}`} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0)
              )}
            </div>
            <div className="flex flex-col">
            <span className="font-bold flex items-center gap-2">
              {displayName}
              {row?._id === currentUser?._id && (
                <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase tracking-tighter">You</span>
              )}
            </span>
            <span className="text-[10px] text-text-muted flex items-center gap-1">
              <FiCalendar size={10} /> {row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
        );
      }
    },
    { 
      key: 'email', 
      label: 'Contact Info', 
      render: (val, row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-text-muted group">
            <FiMail size={12} className="text-primary/60 group-hover:text-primary transition-colors" />
            <span>{val || 'N/A'}</span>
          </div>
          {row.mobile && (
            <div className="flex items-center gap-2 text-xs text-text-muted group">
              <FiPhone size={12} className="text-primary/60 group-hover:text-primary transition-colors" />
              <span>{row.mobile}</span>
            </div>
          )}
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'Privileges', 
      render: (val, row) => {
        const roleStyles = {
          ADMIN: 'bg-primary/20 text-primary border-primary/20',
          KITCHEN: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
          DELIVERY: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
          USER: 'bg-white/5 text-text-muted border-white/10',
          GUEST: 'bg-white/5 text-text-muted/60 border-white/5',
        };
        
        return (
          <div className="flex flex-col gap-2">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${roleStyles[val] || roleStyles.USER}`}>
              {val === 'ADMIN' ? <FiShield size={10} /> : <FiUser size={10} />}
              {val}
            </span>
            <select
              value={val}
              onChange={(e) => handleOpenRoleChange(row, e.target.value)}
              className="bg-white/5 border border-white/5 rounded-lg text-[9px] px-2 py-1 outline-none text-text-muted hover:border-primary/40 focus:border-primary transition-all cursor-pointer"
            >
              {['ADMIN', 'KITCHEN', 'DELIVERY', 'USER', 'GUEST'].map(role => (
                <option key={role} value={role} className="bg-bg-dark">{role}</option>
              ))}
            </select>
          </div>
        );
      }
    },
    { 
      key: 'isActive', 
      label: 'Status', 
      render: (val, row) => (
        <button 
          onClick={() => handleOpenStatusModal(row)}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className={`w-2.5 h-2.5 rounded-full transition-all ${val ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${val ? 'text-green-500' : 'text-red-500'}`}>
            {val ? 'Active' : 'Banned'}
          </span>
          {val ? <FiUnlock size={12} className="opacity-0 group-hover:opacity-100 text-text-muted" /> : <FiLock size={12} className="opacity-0 group-hover:opacity-100 text-red-500" />}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative group flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search members & staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-neutral/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/40 transition-all placeholder:text-white/10 text-sm"
          />
        </div>

        <div className="px-6 py-2 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center gap-6">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Total Users</p>
            <p className="text-xl font-bold text-white max-md:text-lg leading-none">{users.length}</p>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Active</p>
            <p className="text-xl font-bold text-green-500 max-md:text-lg leading-none">{users.filter(u => u.isActive).length}</p>
          </div>
        </div>
      </div>

      <AdminTable 
        columns={columns}
        data={filteredUsers}
        loading={loading}
        actions={(row) => (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleOpenDetail(row)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-primary/40 hover:text-primary transition-all text-text-muted"
            >
              <FiEye size={16} />
            </button>
            <button 
              onClick={() => handleOpenEdit(row)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-primary/40 hover:text-primary transition-all text-text-muted"
            >
              <FiEdit size={16} />
            </button>
            <button 
              onClick={() => handleOpenDelete(row)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/40 hover:text-red-500 transition-all text-text-muted"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        )}
      />

      {/* Profile Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Account Intelligence"
      >
        {selectedUser && (
          <UserForm 
            user={selectedUser}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormModalOpen(false)}
          />
        )}
      </Modal>

      {/* Detail View Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="User Intelligence"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-primary/20 p-1">
                 <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-bg-dark text-2xl font-black text-primary">
                    {selectedUser?.image ? (
                      <img 
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedUser.image}`} 
                        alt={selectedUser.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      (selectedUser?.name || 'U').charAt(0)
                    )}
                 </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                <span className="text-xs text-text-muted uppercase tracking-widest font-black flex items-center gap-2">
                  <FiShield size={12} className="text-primary" /> {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Email Address</p>
                <p className="text-sm text-white">{selectedUser.email || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Mobile Number</p>
                <p className="text-sm text-white">{selectedUser.mobile || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Account Status</p>
                <p className={`text-sm font-bold ${selectedUser.isActive ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedUser.isActive ? 'Active' : 'Banned'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Member Since</p>
                <p className="text-sm text-white">{new Date(selectedUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
               <FiAlertCircle className="text-primary" size={18} />
               <p className="text-[10px] text-text-muted uppercase font-black leading-tight tracking-wider">
                 User System ID: {selectedUser._id}
               </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Role Change Confirmation */}
      <ConfirmModal
        isOpen={isRoleModalOpen}
        title="Privilege Shift?"
        message={`Confirm: You are assigning the "${pendingRole}" role to "${selectedUser?.name}". This will change their system access levels.`}
        confirmText="Confirm Change"
        onConfirm={handleRoleConfirm}
        onCancel={() => setIsRoleModalOpen(false)}
        type="warning"
      />

      {/* Account Status Confirmation */}
      <ConfirmModal
        isOpen={isStatusModalOpen}
        title={selectedUser?.isActive ? 'Block User Account?' : 'Restore User Account?'}
        message={`Are you sure you want to ${selectedUser?.isActive ? 'block access for' : 'restore access for'} "${selectedUser?.name}"? ${selectedUser?.isActive ? 'They will no longer be able to log in.' : 'They will regain full system access.'}`}
        confirmText={selectedUser?.isActive ? 'Yes, Block User' : 'Yes, Restore Access'}
        onConfirm={handleStatusConfirm}
        onCancel={() => setIsStatusModalOpen(false)}
        type={selectedUser?.isActive ? 'danger' : 'warning'}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Burn Account?"
        message={`CRITICAL: Are you sure you want to delete "${selectedUser?.name}"? This will permanently erase their order history and identifiers.`}
        confirmText="Yes, Burn Account"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
        type="danger"
      />
    </div>
  );
};

export default UserMgmt;
