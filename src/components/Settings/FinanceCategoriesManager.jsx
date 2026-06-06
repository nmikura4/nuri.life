import { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Trash2, Edit2, Check, X, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { ICON_OPTIONS } from './icons';
import '../UI/UI.css';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar ($)' }, { code: 'EUR', name: 'Euro (€)' }, { code: 'AZN', name: 'Azerbaijani Manat (₼)' },
  { code: 'GBP', name: 'British Pound (£)' }, { code: 'JPY', name: 'Japanese Yen (¥)' }, { code: 'CHF', name: 'Swiss Franc (Fr)' },
  { code: 'CAD', name: 'Canadian Dollar (C$)' }, { code: 'AUD', name: 'Australian Dollar (A$)' }, { code: 'CNY', name: 'Chinese Yuan (¥)' },
  { code: 'RUB', name: 'Russian Ruble (₽)' }, { code: 'INR', name: 'Indian Rupee (₹)' }, { code: 'BRL', name: 'Brazilian Real (R$)' },
  { code: 'KRW', name: 'South Korean Won (₩)' }, { code: 'MXN', name: 'Mexican Peso ($)' }, { code: 'TRY', name: 'Turkish Lira (₺)' },
  { code: 'ZAR', name: 'South African Rand (R)' }, { code: 'SEK', name: 'Swedish Krona (kr)' }, { code: 'NZD', name: 'New Zealand Dollar (NZ$)' },
  { code: 'SGD', name: 'Singapore Dollar (S$)' }, { code: 'HKD', name: 'Hong Kong Dollar (HK$)' }, { code: 'AED', name: 'UAE Dirham (د.إ)' }
];

const FinanceCategoriesManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('expense');
  const [newCatIcon, setNewCatIcon] = useState('Tag');
  const [isNewIconPickerOpen, setIsNewIconPickerOpen] = useState(false);
  
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatIcon, setEditCatIcon] = useState('Tag');
  const [isEditIconPickerOpen, setIsEditIconPickerOpen] = useState(false);

  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const unsubCat = onSnapshot(collection(db, "categories"), (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubSettings = onSnapshot(doc(db, "settings", "global"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().currency) {
        setCurrency(docSnap.data().currency);
      }
    });

    return () => { unsubCat(); unsubSettings(); };
  }, []);

  const handleCurrencyChange = async (e) => {
    const val = e.target.value;
    await setDoc(doc(db, "settings", "global"), { currency: val }, { merge: true });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const id = crypto.randomUUID();
    await setDoc(doc(db, "categories", id), {
      id,
      name: newCatName.trim(),
      type: newCatType,
      iconName: newCatIcon
    });
    setNewCatName('');
    setIsNewIconPickerOpen(false);
  };

  const startEdit = (cat) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatIcon(cat.iconName || 'Tag');
    setIsEditIconPickerOpen(false);
  };

  const saveEdit = async (cat) => {
    if (editCatName.trim()) {
      await setDoc(doc(db, "categories", cat.id), { 
        ...cat, 
        name: editCatName.trim(),
        iconName: editCatIcon
      }, { merge: true });
    }
    setEditingCatId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      await deleteDoc(doc(db, "categories", id));
    }
  };

  const renderIcon = (iconName) => {
    const IconComp = ICON_OPTIONS.find(i => i.name === iconName)?.icon || Tag;
    return <IconComp size={18} />;
  };

  const incomes = categories.filter(c => c.type === 'income');
  const expenses = categories.filter(c => c.type === 'expense');

  const renderCategoryList = (list, title) => (
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px', color: 'var(--text-muted)' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {list.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No categories yet.</p>
        ) : (
          list.map(cat => (
            <div key={cat.id} className="settings-item" style={{
              display: 'flex', flexDirection: 'column',
              background: 'var(--item-bg-hover)', padding: '16px 20px', borderRadius: '16px',
              boxShadow: 'var(--shadow-inner)'
            }}>
              {editingCatId === cat.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                      onClick={() => setIsEditIconPickerOpen(!isEditIconPickerOpen)}
                      className="neu-icon-btn" 
                      style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }}
                    >
                      {renderIcon(editCatIcon)}
                    </button>
                    <input 
                      type="text" 
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      className="neu-input"
                      style={{ flex: 1 }}
                      autoFocus
                    />
                    <button onClick={() => saveEdit(cat)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }}>
                      <Check size={20} />
                    </button>
                    <button onClick={() => setEditingCatId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X size={20} />
                    </button>
                  </div>
                  {isEditIconPickerOpen && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '15px', background: 'var(--card-bg)', borderRadius: '16px', boxShadow: 'var(--shadow-soft)', maxHeight: '200px', overflowY: 'auto' }}>
                      {ICON_OPTIONS.map(opt => {
                        const IconComponent = opt.icon;
                        return (
                          <button 
                            key={opt.name} 
                            type="button"
                            onClick={() => { setEditCatIcon(opt.name); setIsEditIconPickerOpen(false); }}
                            className={`neu-icon-btn ${editCatIcon === opt.name ? 'selected' : ''}`}
                            style={{ width: '40px', height: '40px', borderRadius: '12px' }}
                            title={opt.name}
                          >
                            <IconComponent size={18} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="neu-icon-btn" style={{ width: '40px', height: '40px', borderRadius: '12px', cursor: 'default' }}>
                      {renderIcon(cat.iconName)}
                    </div>
                    <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => startEdit(cat)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '10px' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-coral)', cursor: 'pointer', padding: '10px' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Currency Settings */}
      <div style={{ background: 'var(--item-bg)', padding: '20px 30px', borderRadius: '24px', boxShadow: 'var(--shadow-soft)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Global Currency</h2>
        <select className="neu-select" value={currency} onChange={handleCurrencyChange} style={{ maxWidth: '300px' }}>
          {CURRENCIES.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Categories Manager */}
      <div style={{ background: 'var(--item-bg)', padding: '20px 30px', borderRadius: '24px', boxShadow: 'var(--shadow-soft)' }}>
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Manage Categories</h2>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        
        {isOpen && (
          <div style={{ marginTop: '30px' }}>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px', background: 'var(--item-bg-hover)', padding: '20px', borderRadius: '20px', boxShadow: 'var(--shadow-inner)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  onClick={() => setIsNewIconPickerOpen(!isNewIconPickerOpen)}
                  className="neu-icon-btn"
                  title="Choose Icon"
                  style={{ flexShrink: 0 }}
                >
                  {renderIcon(newCatIcon)}
                </button>
                <input 
                  type="text" 
                  className="neu-input" 
                  placeholder="New category name..." 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  style={{ width: '50%', maxWidth: '250px' }}
                />
                <select 
                  className="neu-select" 
                  value={newCatType} 
                  onChange={(e) => setNewCatType(e.target.value)}
                  style={{ width: '130px' }}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <button type="submit" className="pill-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                  <Plus size={18} /> Add
                </button>
              </div>
              
              {isNewIconPickerOpen && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '20px', background: 'var(--card-bg)', borderRadius: '20px', boxShadow: 'var(--shadow-soft)', maxHeight: '250px', overflowY: 'auto', marginTop: '10px' }}>
                  {ICON_OPTIONS.map(opt => {
                    const IconComponent = opt.icon;
                    return (
                      <button 
                        key={opt.name} 
                        type="button"
                        onClick={() => { setNewCatIcon(opt.name); setIsNewIconPickerOpen(false); }}
                        className={`neu-icon-btn ${newCatIcon === opt.name ? 'selected' : ''}`}
                        title={opt.name}
                      >
                        <IconComponent size={20} />
                      </button>
                    );
                  })}
                </div>
              )}
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              {renderCategoryList(expenses, "Expense Categories")}
              {renderCategoryList(incomes, "Income Categories")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceCategoriesManager;
