import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import FinancesDashboard from './FinancesDashboard';
import TransactionsTable from './TransactionsTable';
import TransactionModal from './TransactionModal';

export const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

const FinancesView = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [counterparties, setCounterparties] = useState([]);
  const [persons, setPersons] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    // Load categories
    const unsubCat = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Load transactions
    const unsubTx = onSnapshot(collection(db, "transactions"), (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Load global finance settings
    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currency) setCurrency(data.currency);
        if (data.counterparties) setCounterparties(data.counterparties);
        if (data.persons) setPersons(data.persons);
      }
    });

    return () => {
      unsubCat();
      unsubTx();
      unsubSettings();
    };
  }, []);

  const handleSaveTransaction = async (data) => {
    const id = data.id || crypto.randomUUID();
    const payload = { ...data, id };
    if (!data.id) {
      payload.createdAt = new Date().toISOString();
    }
    await setDoc(doc(db, "transactions", id), payload, { merge: true });
    setIsModalOpen(false);
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await deleteDoc(doc(db, "transactions", id));
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!t.date.startsWith(selectedMonth)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const catName = categories.find(c => c.id === t.categoryId)?.name?.toLowerCase() || '';
        return (
          catName.includes(q) ||
          (t.comment && t.comment.toLowerCase().includes(q)) ||
          (t.person && t.person.toLowerCase().includes(q)) ||
          (t.counterparty && t.counterparty.toLowerCase().includes(q)) ||
          (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
        );
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }, [transactions, selectedMonth, searchQuery, categories]);

  const value = {
    transactions: filteredTransactions,
    allTransactions: transactions,
    categories,
    counterparties,
    persons,
    selectedMonth,
    setSelectedMonth,
    searchQuery,
    setSearchQuery,
    currency,
    openNewTransaction: () => { setEditingTransaction(null); setIsModalOpen(true); },
    openEditTransaction: (tx) => { setEditingTransaction(tx); setIsModalOpen(true); },
    handleDeleteTransaction,
    handleSaveTransaction
  };

  return (
    <FinanceContext.Provider value={value}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <FinancesDashboard />
        <TransactionsTable />
        
        {isModalOpen && (
          <TransactionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            transaction={editingTransaction} 
            onSave={handleSaveTransaction} 
            categories={categories}
            counterparties={counterparties}
            persons={persons}
          />
        )}
      </div>
    </FinanceContext.Provider>
  );
};

export default FinancesView;
