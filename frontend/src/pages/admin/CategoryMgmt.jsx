import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import AdminTable from '../../components/common/AdminTable';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import CategoryForm from '../../components/admin/CategoryForm';
import { 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiSearch,
  FiGrid
} from 'react-icons/fi';

const CategoryMgmt = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await adminService.fetchCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (category) => {
    setSelectedCategory(category);
    setIsDetailModalOpen(true);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    try {
      await adminService.deleteCategory(selectedCategory._id);
      setCategories(categories.filter(c => c._id !== selectedCategory._id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    loadCategories();
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      key: 'image', 
      label: 'Img', 
      className: 'w-20',
      render: (val, row) => (
        <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/10 group-hover:border-primary/40 transition-colors">
          {val ? (
            <img src={val} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary/40">
              <FiGrid size={16} />
            </div>
          )}
        </div>
      )
    },
    { key: 'name', label: 'Category Name', className: 'font-bold' },
    { 
      key: 'slug', 
      label: 'URL Slug', 
      render: (val) => <span className="text-[10px] bg-white/5 px-2 py-1 rounded-lg text-text-muted">{val}</span>
    },
    { key: 'sortOrder', label: 'Order', className: 'text-center' },
    { 
      key: 'isActive', 
      label: 'Status', 
      render: (val) => (
        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${val ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {val ? 'Active' : 'Disabled'}
        </span>
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
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-neutral/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/40 transition-all placeholder:text-white/10 text-sm"
          />
        </div>

        <button 
          onClick={handleOpenAdd}
          className="btn-primary flex items-center gap-2 px-6 py-4 rounded-2xl shadow-[0_10px_20px_rgba(201,162,39,0.15)] group transition-all"
        >
          <FiPlus size={20} className="group-hover:rotate-90 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Add Category</span>
        </button>
      </div>

      <AdminTable 
        columns={columns}
        data={filteredCategories}
        loading={loading}
        actions={(row) => (
          <>
            <button 
              onClick={() => handleOpenDetail(row)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/40 hover:text-blue-400 transition-all text-text-muted"
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
          </>
        )}
      />

      {/* Detail View Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Category Intelligence"
      >
        {selectedCategory && (
          <div className="space-y-6">
            <div className="aspect-video w-full rounded-3xl bg-white/5 border border-white/5 overflow-hidden flex items-center justify-center relative group">
               {selectedCategory.image ? (
                 <img src={selectedCategory.image} alt={selectedCategory.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
               ) : (
                 <div className="flex flex-col items-center gap-2 text-primary/40">
                    <FiGrid size={48} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Visual Not Set</span>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                 <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Section Label</p>
                 <p className="text-sm text-white font-bold">{selectedCategory.name}</p>
               </div>
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                 <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Operational Status</p>
                 <p className={`text-sm font-bold ${selectedCategory.isActive ? 'text-green-500' : 'text-red-500'}`}>
                   {selectedCategory.isActive ? 'Active Menu' : 'Disabled Section'}
                 </p>
               </div>
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                 <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">URL Slug</p>
                 <p className="text-sm text-primary font-mono font-bold">/{selectedCategory.slug}</p>
               </div>
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                 <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Display Rank</p>
                 <p className="text-sm text-white font-bold">Position #{selectedCategory.sortOrder}</p>
               </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
               <p className="text-[9px] text-text-muted text-center uppercase font-black tracking-widest leading-loose">
                 Category Index ID: {selectedCategory._id}
               </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Main Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedCategory ? 'Edit Category' : 'Create New Category'}
      >
        <CategoryForm 
          category={selectedCategory}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Category?"
        message={`Warning: Deleting "${selectedCategory?.name}" will remove this entire section from the menu. Products in this category may become hidden.`}
        confirmText="Yes, Delete Category"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
        type="danger"
      />
    </div>
  );
};

export default CategoryMgmt;
