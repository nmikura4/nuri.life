import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebase';
import FinancesDashboard from './FinancesDashboard';
import TransactionsTable from './TransactionsTable';
import TransactionModal from './TransactionModal';
import { useConfirm } from '../../hooks/useConfirm';

export const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

const FinancesView = ({ user }) => {
  const confirm = useConfirm();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currency, setCurrency] = useState('USD');
  const [initialBalance, setInitialBalance] = useState(0);
  const [initialCardBalance, setInitialCardBalance] = useState(undefined);
  const [initialCashBalance, setInitialCashBalance] = useState(undefined);
  const [counterparties, setCounterparties] = useState([]);
  const [persons, setPersons] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Load categories
    const unsubCat = onSnapshot(collection(db, "users", user.uid, "categories"), (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Load transactions
    const unsubTx = onSnapshot(collection(db, "users", user.uid, "transactions"), (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Load global finance settings
    const unsubSettings = onSnapshot(doc(db, "users", user.uid, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currency) setCurrency(data.currency);
        if (data.counterparties) setCounterparties(data.counterparties);
        if (data.persons) setPersons(data.persons);
        if (data.initialBalance !== undefined) setInitialBalance(Number(data.initialBalance) || 0);
        if (data.initialCardBalance !== undefined) setInitialCardBalance(Number(data.initialCardBalance) || 0);
        if (data.initialCashBalance !== undefined) setInitialCashBalance(Number(data.initialCashBalance) || 0);
      }
    });

    return () => {
      unsubCat();
      unsubTx();
      unsubSettings();
    };
  }, [user]);

  const handleSaveTransaction = async (data) => {
    const id = data.id || crypto.randomUUID();
    const payload = { ...data, id };
    if (!data.id) {
      payload.createdAt = new Date().toISOString();
    }
    await setDoc(doc(db, "users", user.uid, "transactions", id), payload, { merge: true });
    setIsModalOpen(false);
  };

  const handleDeleteTransaction = async (id) => {
    if (await confirm("Are you sure you want to delete this transaction?")) {
      const txToDelete = transactions.find(t => t.id === id);
      if (txToDelete?.file?.path) {
        try {
          const fileRef = ref(storage, txToDelete.file.path);
          await deleteObject(fileRef);
        } catch (err) {
          console.error("Failed to delete attached file: ", err);
        }
      }
      await deleteDoc(doc(db, "users", user.uid, "transactions", id));
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!t.date || !t.date.startsWith(selectedMonth)) return false;
      if (filterType !== 'all') {
        if (filterType === 'card') {
          if ((t.paymentMethod || 'card') !== 'card') return false;
        } else if (filterType === 'cash') {
          if (t.paymentMethod !== 'cash') return false;
        } else if (t.type !== filterType) {
          return false;
        }
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const catName = categories.find(c => c.id === t.categoryId)?.name?.toLowerCase() || '';
        return (
          catName.includes(q) ||
          (t.comment && t.comment.toLowerCase().includes(q)) ||
          (t.person && t.person.toLowerCase().includes(q)) ||
          (t.counterparty && t.counterparty.toLowerCase().includes(q)) ||
          (Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase().includes(q)))
        );
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      if (dateB.getTime() !== dateA.getTime()) {
        return dateB - dateA;
      }
      const getMs = (val) => val?.toDate ? val.toDate().getTime() : (new Date(val || 0).getTime());
      return getMs(b.createdAt) - getMs(a.createdAt);
    });
  }, [transactions, selectedMonth, filterType, searchQuery, categories]);

  const allMonthTransactions = useMemo(() => {
    return transactions.filter(t => t.date && t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const updateInitialBalances = async (cardVal, cashVal) => {
    if (!user) return;
    const validCard = Math.max(0, parseFloat(cardVal) || 0);
    const validCash = Math.max(0, parseFloat(cashVal) || 0);
    await setDoc(doc(db, "users", user.uid, "settings", "global"), {
      initialCardBalance: validCard,
      initialCashBalance: validCash,
      initialBalance: validCard + validCash
    }, { merge: true });
  };

  const value = {
    transactions: filteredTransactions,
    allTransactions: transactions,
    allMonthTransactions,
    categories,
    counterparties,
    persons,
    selectedMonth,
    setSelectedMonth,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    currency,
    initialBalance,
    initialCardBalance,
    initialCashBalance,
    updateInitialBalances,
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
