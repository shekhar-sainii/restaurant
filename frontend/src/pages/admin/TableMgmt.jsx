import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import AdminTable from '../../components/common/AdminTable';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import TableForm from '../../components/admin/TableForm';
import { 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiSearch,
  FiTrello,
  FiUnlock
} from 'react-icons/fi';

const TableMgmt = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const loadTables = async () => {
    setLoading(true);
    try {
      const response = await adminService.fetchTables();
      setTables(response.data || []);
    } catch (error) {
      console.error('Failed to load tables', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleOpenRelease = (table) => {
    setSelectedTable(table);
    setIsReleaseModalOpen(true);
  };

  const handleReleaseConfirm = async () => {
    if (!selectedTable) return;
    try {
      await adminService.releaseTable(selectedTable._id);
      setIsReleaseModalOpen(false);
      loadTables();
    } catch (error) {
      alert('Failed to release table');
    }
  };

  const handleOpenAdd = () => {
    setSelectedTable(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (table) => {
    setSelectedTable(table);
    setIsFormModalOpen(true);
  };

  const handleOpenDelete = (table) => {
    setSelectedTable(table);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTable) return;
    try {
      await adminService.deleteTable(selectedTable._id);
      setTables(tables.filter(t => t._id !== selectedTable._id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      alert('Failed to delete table');
    }
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    loadTables();
  };

  const filteredTables = tables.filter(t => 
    t.tableNumber.toString().includes(searchTerm)
  );

  const columns = [
    { 
      key: 'tableNumber', 
      label: 'Table #', 
      className: 'font-bold text-lg text-primary',
      render: (val) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <FiTrello size={18} />
          </div>
          <span>Table {val}</span>
        </div>
      )
    },
    { 
      key: 'capacity', 
      label: 'Capacity', 
      className: 'text-center',
      render: (val) => (
        <span className="bg-white/5 px-3 py-1 rounded-lg text-text-muted text-xs">
          {val} Seats
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (val, row) => {
        const styles = {
          AVAILABLE: 'bg-green-500/10 text-green-500',
          OCCUPIED: 'bg-red-500/10 text-red-500',
          RESERVED: 'bg-blue-500/10 text-blue-500',
          INACTIVE: 'bg-gray-500/10 text-gray-400',
        };
        const isOccupied = val === 'OCCUPIED';
        const timeOccupied = isOccupied ? Math.floor((Date.now() - new Date(row.updatedAt)) / 60000) : 0;

        return (
          <div className="flex flex-col gap-1">
            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${styles[val] || styles.INACTIVE}`}>
              {val}
            </span>
            {isOccupied && (
              <span className="text-[10px] text-text-muted text-center italic">
                {timeOccupied}m ago
              </span>
            )}
          </div>
        );
      }
    },
    { 
      key: 'createdAt', 
      label: 'Created At', 
      render: (val) => <span className="text-[10px] text-text-muted">{new Date(val).toLocaleDateString()}</span>
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative group flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search tables by number..."
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
          <span className="text-xs font-black uppercase tracking-widest">Add Table</span>
        </button>
      </div>

      <AdminTable 
        columns={columns}
        data={filteredTables}
        loading={loading}
        actions={(row) => (
          <>
            {row.status === 'OCCUPIED' && (
              <button 
                onClick={() => handleOpenRelease(row)}
                title="Release Table"
                className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary hover:text-black transition-all text-primary"
              >
                <FiUnlock size={16} />
              </button>
            )}
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

      {/* Main Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedTable ? 'Edit Table' : 'Create New Table'}
      >
        <TableForm 
          table={selectedTable}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Table?"
        message={`Warning: Deleting table "${selectedTable?.tableNumber}" will remove it from the system. This action cannot be undone.`}
        confirmText="Yes, Delete Table"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
        type="danger"
      />

      {/* Release Confirmation Modal */}
      <ConfirmModal
        isOpen={isReleaseModalOpen}
        title="Release Table?"
        message={`Are you sure you want to release Table ${selectedTable?.tableNumber}? This will make the table available for new customers.`}
        confirmText="Yes, Release Table"
        onConfirm={handleReleaseConfirm}
        onCancel={() => setIsReleaseModalOpen(false)}
        type="warning"
      />
    </div>
  );
};

export default TableMgmt;
