import { useState, useEffect, useRef } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Trash2, Edit2, Check, X, Tag, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { ICON_OPTIONS } from './icons';
import CustomSelect from '../UI/CustomSelect';
import IconPickerModal from '../UI/IconPickerModal';
import { ListManager } from './SettingsView';
import { useConfirm } from '../../hooks/useConfirm';
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

const FinanceCategoriesManager = ({ user }) => {
  const confirm = useConfirm();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('expense');
  const [newCatIcon, setNewCatIcon] = useState('Tag');
  const [newCatBudget, setNewCatBudget] = useState('');
  
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatIcon, setEditCatIcon] = useState('Tag');
  const [editCatBudget, setEditCatBudget] = useState('');

  const [expandedCats, setExpandedCats] = useState({});

  // Subcategory states
  const [newSubcatName, setNewSubcatName] = useState({});
  const [newSubcatIcon, setNewSubcatIcon] = useState({});
  const [editingSubcatId, setEditingSubcatId] = useState(null);
  const [editSubcatName, setEditSubcatName] = useState('');
  const [editSubcatIcon, setEditSubcatIcon] = useState('Tag');

  // Universal Icon Picker Modal state
  const [iconPickerState, setIconPickerState] = useState(null);


  const [currency, setCurrency] = useState('USD');
  const [counterparties, setCounterparties] = useState([]);
  const [persons, setPersons] = useState([]);

  // Drag and drop refs
  const dragCatId = useRef(null);
  const draggedOverCatId = useRef(null);
  const dragSubcatId = useRef(null);
  const draggedOverSubcatId = useRef(null);

  // Styling state for drag feedback
  const [draggingCatId, setDraggingCatId] = useState(null);
  const [dragOverCatTargetId, setDragOverCatTargetId] = useState(null);
  const [draggingSubcatId, setDraggingSubcatId] = useState(null);
  const [dragOverSubcatTargetId, setDragOverSubcatTargetId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsubCat = onSnapshot(collection(db, "users", user.uid, "categories"), (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubSettings = onSnapshot(doc(db, "users", user.uid, "settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currency) setCurrency(data.currency);
        if (data.counterparties) setCounterparties(data.counterparties);
        if (data.persons) setPersons(data.persons);
      }
    });

    return () => { unsubCat(); unsubSettings(); };
  }, [user]);

  const handleCurrencyChange = async (e) => {
    const val = e.target.value;
    await setDoc(doc(db, "users", user.uid, "settings", "global"), { currency: val }, { merge: true });
  };

  const syncFinanceSettings = async (updates) => {
    await setDoc(doc(db, "users", user.uid, "settings", "global"), updates, { merge: true });
  };

  const handleRenameCounterparty = (oldName, newName) => {
    if (counterparties.includes(newName)) return;
    const updated = counterparties.map(p => p === oldName ? newName : p);
    syncFinanceSettings({ counterparties: updated });
  };

  const handleDeleteCounterparty = (name) => {
    const updated = counterparties.filter(p => p !== name);
    syncFinanceSettings({ counterparties: updated });
  };

  const handleRenamePerson = (oldName, newName) => {
    if (persons.includes(newName)) return;
    const updated = persons.map(p => p === oldName ? newName : p);
    syncFinanceSettings({ persons: updated });
  };

  const handleDeletePerson = (name) => {
    const updated = persons.filter(p => p !== name);
    syncFinanceSettings({ persons: updated });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const id = crypto.randomUUID();
    const typeCats = categories.filter(c => c.type === newCatType);
    await setDoc(doc(db, "users", user.uid, "categories", id), {
      id,
      name: newCatName.trim(),
      type: newCatType,
      iconName: newCatIcon,
      budget: newCatType === 'expense' && newCatBudget ? Number(newCatBudget) : null,
      subcategories: [],
      order: typeCats.length
    });
    setNewCatName('');
    setNewCatBudget('');
  };

  const startEdit = (cat) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
    setEditCatIcon(cat.iconName || 'Tag');
    setEditCatBudget(cat.budget ? String(cat.budget) : '');
  };

  const saveEdit = async (cat) => {
    if (editCatName.trim()) {
      await setDoc(doc(db, "users", user.uid, "categories", cat.id), { 
        ...cat, 
        name: editCatName.trim(),
        iconName: editCatIcon,
        budget: cat.type === 'expense' && editCatBudget ? Number(editCatBudget) : null
      }, { merge: true });
    }
    setEditingCatId(null);
  };

  const handleDelete = async (id) => {
    if (await confirm("Delete this category? All its subcategories will be deleted as well.")) {
      await deleteDoc(doc(db, "users", user.uid, "categories", id));
    }
  };

  const handleAddSubcat = async (e, cat) => {
    e.preventDefault();
    const subName = newSubcatName[cat.id];
    if (!subName || !subName.trim()) return;
    
    const newSub = {
      id: crypto.randomUUID(),
      name: subName.trim(),
      iconName: newSubcatIcon[cat.id] || 'Tag',
      order: (cat.subcategories || []).length
    };
    
    await setDoc(doc(db, "users", user.uid, "categories", cat.id), {
      subcategories: [...(cat.subcategories || []), newSub]
    }, { merge: true });
    
    setNewSubcatName(prev => ({ ...prev, [cat.id]: '' }));
  };

  const startEditSubcat = (subcat) => {
    setEditingSubcatId(subcat.id);
    setEditSubcatName(subcat.name);
    setEditSubcatIcon(subcat.iconName || 'Tag');
  };

  const saveEditSubcat = async (cat, subcatId) => {
    if (editSubcatName.trim()) {
      const updatedSubcategories = (cat.subcategories || []).map(sub => 
        sub.id === subcatId ? { ...sub, name: editSubcatName.trim(), iconName: editSubcatIcon } : sub
      );
      await setDoc(doc(db, "users", user.uid, "categories", cat.id), {
        ...cat,
        subcategories: updatedSubcategories
      }, { merge: true });
    }
    setEditingSubcatId(null);
  };

  const handleDeleteSubcat = async (cat, subcatId) => {
    if (await confirm("Delete this subcategory?")) {
      const updatedSubcategories = (cat.subcategories || []).filter(sub => sub.id !== subcatId);
      await setDoc(doc(db, "users", user.uid, "categories", cat.id), {
        ...cat,
        subcategories: updatedSubcategories
      }, { merge: true });
    }
  };

  const toggleCatExpand = (catId) => setExpandedCats(p => ({ ...p, [catId]: !p[catId] }));

  const renderIcon = (iconName) => {
    const IconComp = ICON_OPTIONS.find(i => i.name === iconName)?.icon || Tag;
    return <IconComp size={18} />;
  };

  const incomes = categories.filter(c => c.type === 'income').sort((a, b) => (a.order || 0) - (b.order || 0));
  const expenses = categories.filter(c => c.type === 'expense').sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleCatDrop = async (e, typeList) => {
    e.preventDefault();
    setDraggingCatId(null);
    setDragOverCatTargetId(null);
    
    if (!dragCatId.current || !draggedOverCatId.current) return;
    if (dragCatId.current === draggedOverCatId.current) return;

    const items = [...typeList];
    const dragIdx = items.findIndex(c => c.id === dragCatId.current);
    const dropIdx = items.findIndex(c => c.id === draggedOverCatId.current);

    if (dragIdx === -1 || dropIdx === -1) return;

    const [draggedItem] = items.splice(dragIdx, 1);
    items.splice(dropIdx, 0, draggedItem);

    // Update order optimistically
    setCategories(prev => {
      const otherCats = prev.filter(c => c.type !== draggedItem.type);
      const updatedTypeCats = items.map((cat, idx) => ({ ...cat, order: idx }));
      return [...otherCats, ...updatedTypeCats];
    });

    const batchUpdates = items.map((cat, idx) => {
      return setDoc(doc(db, "users", user.uid, "categories", cat.id), { order: idx }, { merge: true });
    });
    await Promise.all(batchUpdates);
    
    dragCatId.current = null;
    draggedOverCatId.current = null;
  };

  const handleSubcatDrop = async (e, cat) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingSubcatId(null);
    setDragOverSubcatTargetId(null);

    if (!dragSubcatId.current || !draggedOverSubcatId.current) return;
    if (dragSubcatId.current === draggedOverSubcatId.current) return;

    const items = [...(cat.subcategories || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    const dragIdx = items.findIndex(s => s.id === dragSubcatId.current);
    const dropIdx = items.findIndex(s => s.id === draggedOverSubcatId.current);

    if (dragIdx === -1 || dropIdx === -1) return;

    const [draggedItem] = items.splice(dragIdx, 1);
    items.splice(dropIdx, 0, draggedItem);

    const updatedSubcategories = items.map((sub, idx) => ({ ...sub, order: idx }));
    
    // Update locally first
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, subcategories: updatedSubcategories } : c));
    
    await setDoc(doc(db, "users", user.uid, "categories", cat.id), { subcategories: updatedSubcategories }, { merge: true });

    dragSubcatId.current = null;
    draggedOverSubcatId.current = null;
  };

  const renderCategoryList = (list, title) => (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {list.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No categories yet.</p>
        ) : (
          list.map(cat => (
            <div 
              key={cat.id} 
              className="settings-item" 
              draggable
              onDragStart={(e) => {
                dragCatId.current = cat.id;
                setDraggingCatId(cat.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                if (dragCatId.current && dragCatId.current !== cat.id) {
                  draggedOverCatId.current = cat.id;
                  setDragOverCatTargetId(cat.id);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={() => {
                setDraggingCatId(null);
                setDragOverCatTargetId(null);
              }}
              onDrop={(e) => handleCatDrop(e, list)}
              style={{
                display: 'flex', flexDirection: 'column',
                background: draggingCatId === cat.id ? 'var(--card-bg)' : 'var(--item-bg-hover)',
                opacity: draggingCatId === cat.id ? 0.5 : 1,
                borderTop: dragOverCatTargetId === cat.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                padding: '8px 14px', borderRadius: '12px',
                boxShadow: 'var(--shadow-inner)',
                transition: 'all 0.2s ease',
                cursor: 'grab'
            }}>
              {/* Category Header */}
              {editingCatId === cat.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      type="button"
                      onClick={() => setIconPickerState({
                        selectedIcon: editCatIcon,
                        onSelect: (name) => setEditCatIcon(name),
                        title: 'Иконка категории'
                      })}
                      className="neu-icon-btn" 
                      title="Выбрать иконку"
                      style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0 }}
                    >
                      {renderIcon(editCatIcon)}
                    </button>
                    <input 
                      type="text" 
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      className="neu-input"
                      style={{ flex: 1, padding: '6px 10px', minHeight: '32px', fontSize: '14px' }}
                      autoFocus
                    />
                    {cat.type === 'expense' && (
                      <input 
                        type="number" 
                        value={editCatBudget}
                        onChange={(e) => setEditCatBudget(e.target.value)}
                        className="neu-input"
                        placeholder="Budget"
                        style={{ width: '115px', padding: '6px 12px', minHeight: '32px', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    )}
                    <button onClick={() => saveEdit(cat)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', padding: '4px' }}>
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditingCatId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }} onClick={() => toggleCatExpand(cat.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', width: '16px' }}>
                      {expandedCats[cat.id] ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </div>
                    <div className="neu-icon-btn" style={{ width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' }}>
                      {renderIcon(cat.iconName)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{cat.name}</span>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <span style={{ background: 'var(--card-bg)', color: 'var(--text-muted)', padding: '1px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, boxShadow: 'var(--shadow-soft)' }}>
                          {cat.subcategories.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button onClick={() => startEdit(cat)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}>
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-coral)', cursor: 'pointer', padding: '6px' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Subcategories Section */}
              {expandedCats[cat.id] && !editingCatId && (
                <div style={{ marginTop: '10px', paddingLeft: '32px', borderLeft: '2px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* Existing Subcategories */}
                  {(cat.subcategories || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map(sub => (
                    <div 
                      key={sub.id} 
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        dragSubcatId.current = sub.id;
                        setDraggingSubcatId(sub.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (dragSubcatId.current && dragSubcatId.current !== sub.id) {
                          draggedOverSubcatId.current = sub.id;
                          setDragOverSubcatTargetId(sub.id);
                        }
                      }}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDragEnd={(e) => {
                        e.stopPropagation();
                        setDraggingSubcatId(null);
                        setDragOverSubcatTargetId(null);
                      }}
                      onDrop={(e) => handleSubcatDrop(e, cat)}
                      style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        background: draggingSubcatId === sub.id ? 'var(--item-bg)' : 'var(--solid-card-bg)', 
                        opacity: draggingSubcatId === sub.id ? 0.5 : 1,
                        borderTop: dragOverSubcatTargetId === sub.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                        padding: '6px 12px', borderRadius: '10px', boxShadow: 'var(--shadow-soft)',
                        transition: 'all 0.2s ease', cursor: 'grab'
                      }}
                    >
                      {editingSubcatId === sub.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                            <button 
                              type="button"
                              onClick={() => setIconPickerState({
                                selectedIcon: editSubcatIcon,
                                onSelect: (name) => setEditSubcatIcon(name),
                                title: 'Иконка подкатегории'
                              })}
                              className="neu-icon-btn" 
                              title="Выбрать иконку"
                              style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0 }}
                            >
                              {renderIcon(editSubcatIcon)}
                            </button>
                            <input 
                              type="text" 
                              value={editSubcatName}
                              onChange={(e) => setEditSubcatName(e.target.value)}
                              className="neu-input"
                              style={{ flex: 1, padding: '6px 12px', minHeight: '32px' }}
                              autoFocus
                            />
                            <button onClick={() => saveEditSubcat(cat, sub.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer' }}>
                              <Check size={18} />
                            </button>
                            <button onClick={() => setEditingSubcatId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="neu-icon-btn" style={{ width: '32px', height: '32px', borderRadius: '8px', cursor: 'default', background: 'var(--item-bg)' }}>
                              {renderIcon(sub.iconName)}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 500 }}>{sub.name}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => startEditSubcat(sub)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}>
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteSubcat(cat, sub.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-coral)', cursor: 'pointer', padding: '6px' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add New Subcategory Form */}
                  <form onSubmit={(e) => handleAddSubcat(e, cat)} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        type="button"
                        onClick={() => setIconPickerState({
                          selectedIcon: newSubcatIcon[cat.id] || 'Tag',
                          onSelect: (name) => setNewSubcatIcon(p => ({ ...p, [cat.id]: name })),
                          title: `Иконка подкатегории (${cat.name})`
                        })}
                        className="neu-icon-btn"
                        title="Выбрать иконку"
                        style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: 'var(--solid-card-bg)' }}
                      >
                        {renderIcon(newSubcatIcon[cat.id] || 'Tag')}
                      </button>
                      <input 
                        type="text" 
                        className="neu-input" 
                        placeholder="Add subcategory..." 
                        value={newSubcatName[cat.id] || ''}
                        onChange={(e) => setNewSubcatName(p => ({ ...p, [cat.id]: e.target.value }))}
                        style={{ flex: 1, padding: '8px 12px', minHeight: '32px', fontSize: '14px' }}
                      />
                      <button type="submit" className="pill-btn primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                        Add
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Currency Settings */}
      <div style={{ background: 'var(--item-bg)', padding: '16px 20px', borderRadius: '16px', boxShadow: 'var(--shadow-soft)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '14px' }}>Global Currency</h2>
        <div style={{ maxWidth: '300px' }}>
          <CustomSelect 
            options={CURRENCIES.map(c => ({ label: c.name, value: c.code }))}
            value={currency}
            onChange={(val) => handleCurrencyChange({ target: { value: val }})}
          />
        </div>
      </div>

      <ListManager 
        title="Manage Counterparties" 
        items={counterparties} setItems={(arr) => syncFinanceSettings({ counterparties: arr })} 
        onRename={handleRenameCounterparty} onDelete={handleDeleteCounterparty} 
        placeholder="Enter new counterparty (e.g. Netflix)..." 
      />

      <ListManager 
        title="Manage Persons" 
        items={persons} setItems={(arr) => syncFinanceSettings({ persons: arr })} 
        onRename={handleRenamePerson} onDelete={handleDeletePerson} 
        placeholder="Enter new person (e.g. John)..." 
      />

      {/* Categories Manager */}
      <div style={{ background: 'var(--item-bg)', padding: '16px 20px', borderRadius: '16px', boxShadow: 'var(--shadow-soft)' }}>
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Manage Categories</h2>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        
        {isOpen && (
          <div style={{ marginTop: '16px' }}>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', background: 'var(--item-bg-hover)', padding: '12px 16px', borderRadius: '14px', boxShadow: 'var(--shadow-inner)' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  onClick={() => setIconPickerState({
                    selectedIcon: newCatIcon,
                    onSelect: (name) => setNewCatIcon(name),
                    title: 'Иконка категории'
                  })}
                  className="neu-icon-btn"
                  title="Выбрать иконку"
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
                <div style={{ width: '150px' }}>
                  <CustomSelect 
                    options={[{ label: 'Expense', value: 'expense' }, { label: 'Income', value: 'income' }]}
                    value={newCatType}
                    onChange={(val) => setNewCatType(val)}
                  />
                </div>
                {newCatType === 'expense' && (
                  <input 
                    type="number" 
                    className="neu-input" 
                    placeholder="Monthly Budget" 
                    value={newCatBudget}
                    onChange={(e) => setNewCatBudget(e.target.value)}
                    style={{ width: '165px', padding: '10px 14px', boxSizing: 'border-box' }}
                  />
                )}
                <button type="submit" className="pill-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                  <Plus size={18} /> Add
                </button>
              </div>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '30px' }}>
              {renderCategoryList(expenses, "Expense Categories")}
              {renderCategoryList(incomes, "Income Categories")}
            </div>
          </div>
        )}
      </div>

      {/* Global Icon Picker Modal */}
      {iconPickerState && (
        <IconPickerModal
          isOpen={!!iconPickerState}
          onClose={() => setIconPickerState(null)}
          selectedIcon={iconPickerState.selectedIcon || 'Tag'}
          onSelect={(name) => {
            if (iconPickerState.onSelect) {
              iconPickerState.onSelect(name);
            }
          }}
          title={iconPickerState.title || 'Выберите иконку'}
        />
      )}
    </div>
  );
};

export default FinanceCategoriesManager;
