import React from 'react';
import { useFinance } from './FinancesView';
import { Plus, Search } from 'lucide-react';
import CustomMonthPicker from '../UI/CustomMonthPicker';

const TransactionsToolbar = () => {
  const { selectedMonth, setSelectedMonth, searchQuery, setSearchQuery, openNewTransaction } = useFinance();

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'nowrap', alignItems: 'center', width: '100%' }}>
      
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

      <div style={{ flexShrink: 0 }}>
        <CustomMonthPicker 
          value={selectedMonth}
          onChange={setSelectedMonth}
        />
      </div>

    </div>
  );
};

export default TransactionsToolbar;
