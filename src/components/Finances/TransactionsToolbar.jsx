import React from 'react';
import { useFinance } from './FinancesView';
import { Plus, Search } from 'lucide-react';
import CustomMonthPicker from '../UI/CustomMonthPicker';

const TransactionsToolbar = () => {
  const { selectedMonth, setSelectedMonth, searchQuery, setSearchQuery, openNewTransaction } = useFinance();

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
        <button onClick={openNewTransaction} className="pill-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '15px' }}>
          <Plus size={20} /> Add Transaction
        </button>

        <div style={{ position: 'relative', width: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="neu-input" 
            placeholder="Search tags, person..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '45px' }}
          />
        </div>

        <CustomMonthPicker 
          value={selectedMonth}
          onChange={setSelectedMonth}
        />
      </div>

    </div>
  );
};

export default TransactionsToolbar;
