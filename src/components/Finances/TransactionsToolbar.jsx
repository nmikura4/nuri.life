import React from 'react';
import { useFinance } from './FinancesView';
import { Plus, Search, Download } from 'lucide-react';
import CustomMonthPicker from '../UI/CustomMonthPicker';
import CustomSelect from '../UI/CustomSelect';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' }
];

const TransactionsToolbar = () => {
  const { transactions, categories, selectedMonth, setSelectedMonth, searchQuery, setSearchQuery, filterType, setFilterType, openNewTransaction } = useFinance();

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      alert('No transactions to export for this period.');
      return;
    }
    
    let csv = 'Date,Type,Category,Subcategory,Amount,Currency,Counterparty,Person,Tags,Comment\n';
    
    transactions.forEach(t => {
      const cat = categories.find(c => c.id === t.categoryId)?.name || '';
      const subcat = categories.find(c => c.id === t.categoryId)?.subcategories?.find(s => s.id === t.subcategoryId)?.name || '';
      const amount = t.amount || 0;
      const type = t.type || 'expense';
      const counterparty = t.counterparty || '';
      const person = t.person || '';
      const tags = Array.isArray(t.tags) ? t.tags.join(';') : (t.tags || '');
      const comment = (t.comment || '').replace(/"/g, '""');
      
      csv += `${t.date},${type},"${cat}","${subcat}",${amount},"${t.currency || ''}","${counterparty}","${person}","${tags}","${comment}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
      
      <button onClick={openNewTransaction} className="pill-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}>
        <Plus size={18} /> New
      </button>

      <div style={{ position: 'relative', flex: 1, minWidth: '100px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          className="neu-input" 
          placeholder="Search..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', paddingLeft: '36px', fontSize: '14px' }}
        />
      </div>

      <div style={{ flexShrink: 0, minWidth: '125px' }}>
        <CustomSelect 
          value={filterType}
          onChange={setFilterType}
          options={FILTER_OPTIONS}
          innerStyle={{ padding: '8px 14px', fontSize: '13px', borderRadius: '15px' }}
        />
      </div>

      <div style={{ flexShrink: 0, display: 'flex', gap: '10px' }}>
        <CustomMonthPicker 
          value={selectedMonth}
          onChange={setSelectedMonth}
        />
        <button 
          onClick={handleExportCSV} 
          className="neu-icon-btn" 
          style={{ padding: '0 12px', height: '40px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}
          title="Export CSV"
        >
          <Download size={16} />
        </button>
      </div>

    </div>
  );
};

export default TransactionsToolbar;
