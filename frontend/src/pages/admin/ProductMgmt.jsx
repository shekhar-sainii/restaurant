import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import AdminTable from '../../components/common/AdminTable';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import ProductForm from '../../components/admin/ProductForm';
import { 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const ProductMgmt = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await adminService.fetchProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    try {
      await adminService.deleteProduct(selectedProduct._id);
      setProducts(products.filter(p => p._id !== selectedProduct._id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    loadProducts();
  };

  const handleOpenStatusModal = (product) => {
    setSelectedProduct(product);
    setIsStatusModalOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!selectedProduct) return;
    try {
      const newStatus = !selectedProduct.isAvailable;
      await adminService.updateProduct(selectedProduct._id, { isAvailable: newStatus });
      setProducts(products.map(p => p._id === selectedProduct._id ? { ...p, isAvailable: newStatus } : p));
      setIsStatusModalOpen(false);
    } catch (error) {
      alert('Failed to update product status');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted italic">No Img</div>
          )}
        </div>
      )
    },
    { key: 'name', label: 'Product Name', className: 'font-bold' },
    { 
      key: 'categoryId', 
      label: 'Category', 
      render: (val) => (
        <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 border border-white/5 uppercase tracking-widest font-black text-text-muted">
          {val?.name || 'Product'}
        </span>
      )
    },
    { 
      key: 'price', 
      label: 'Pricing', 
      render: (val, row) => (
        <div className="flex flex-col">
          {row.discountedPrice && <span className="text-[10px] text-text-muted line-through">₹{val}</span>}
          <span className="font-black text-primary">₹{row.discountedPrice || val}</span>
        </div>
      )
    },
    { 
      key: 'isAvailable', 
      label: 'Status', 
      render: (val, row) => (
        <button 
          onClick={() => handleOpenStatusModal(row)}
          className="group flex flex-col items-start gap-1 cursor-pointer"
          title="Click to toggle availability"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full transition-all ${val ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
            <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${val ? 'text-green-500' : 'text-red-500'}`}>
              {val ? 'Available' : 'Sold Out'}
            </span>
          </div>
          <span className="text-[7px] text-text-muted uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">Quick Toggle</span>
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
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-neutral/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/40 transition-all placeholder:text-white/10 text-sm"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all text-text-muted hover:text-primary">
            <FiFilter size={20} />
          </button>
          <button 
            onClick={handleOpenAdd}
            className="btn-primary flex items-center gap-2 px-6 py-4 rounded-2xl shadow-[0_10px_20px_rgba(201,162,39,0.15)] group transition-all"
          >
            <FiPlus size={20} className="group-hover:rotate-90 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Add Product</span>
          </button>
        </div>
      </div>

      <AdminTable 
        columns={columns}
        data={filteredProducts}
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
        title="Product Intelligence"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="aspect-video w-full rounded-3xl bg-white/5 border border-white/5 overflow-hidden flex items-center justify-center relative group">
               {selectedProduct.image ? (
                 <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
               ) : (
                 <span className="text-text-muted italic">No Visual Asset</span>
               )}
               <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-primary">
                 {selectedProduct.categoryId?.name || 'Uncategorized'}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                 <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Product Label</p>
                 <p className="text-sm text-white font-bold">{selectedProduct.name}</p>
               </div>
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                 <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Inventory Status</p>
                 <p className={`text-sm font-bold ${selectedProduct.isAvailable ? 'text-green-500' : 'text-red-500'}`}>
                   {selectedProduct.isAvailable ? 'In Stock' : 'Sold Out'}
                 </p>
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] text-text-muted uppercase font-black tracking-[0.2em]">Current Valuation</p>
                    <div className="flex items-center gap-3">
                       <span className="text-2xl font-black text-primary">₹{selectedProduct.discountedPrice || selectedProduct.price}</span>
                       {selectedProduct.discountedPrice && (
                         <span className="text-sm text-text-muted line-through">₹{selectedProduct.price}</span>
                       )}
                    </div>
                  </div>
                  {selectedProduct.discountedPrice && (
                    <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                       Save ₹{selectedProduct.price - selectedProduct.discountedPrice}
                    </div>
                  )}
               </div>

               <div className="pt-6 border-t border-white/5">
                  <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-3">Product Description</p>
                  <p className="text-xs text-text-muted leading-relaxed italic">
                    {selectedProduct.description || 'No descriptive intel available for this product selection.'}
                  </p>
               </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
               <p className="text-[9px] text-text-muted text-center uppercase font-black tracking-widest">
                 System Unique Hash: {selectedProduct._id}
               </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Main Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
      >
        <ProductForm 
          product={selectedProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Product?"
        message={`This will permanently remove "${selectedProduct?.name}" from your catalog. Products cannot be recovered once deleted.`}
        confirmText="Yes, Delete Product"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
        type="danger"
      />

      {/* Status Confirmation Modal */}
      <ConfirmModal
        isOpen={isStatusModalOpen}
        title={selectedProduct?.isAvailable ? 'Mark as Out of Stock?' : 'Mark as Available?'}
        message={`Are you sure you want to change the availability of "${selectedProduct?.name}" to ${selectedProduct?.isAvailable ? 'OUT OF STOCK' : 'AVAILABLE'}?`}
        confirmText="Confirm Status"
        onConfirm={handleStatusConfirm}
        onCancel={() => setIsStatusModalOpen(false)}
        type="warning"
      />
    </div>
  );
};

export default ProductMgmt;
