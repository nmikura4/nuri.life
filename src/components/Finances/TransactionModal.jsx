import React, { useState, useEffect, useRef } from 'react';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import GlassCard from '../UI/GlassCard';
import { X, Tag as TagIcon, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import CustomDatePicker from '../UI/CustomDatePicker';
import CustomSelect from '../UI/CustomSelect';
import FileUploader from '../UI/FileUploader';
import CategoryPickerModal from './CategoryPickerModal';
import { ICON_OPTIONS } from '../Settings/icons';
import safeStorage from '../../utils/safeStorage';
import '../UI/UI.css';

const TransactionModal = ({ isOpen, onClose, transaction, onSave, categories, counterparties = [], persons = [] }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    date: new Date().toISOString().substring(0, 10),
    categoryId: '',
    subcategoryId: '',
    person: '',
    counterparty: '',
    comment: '',
    tags: [],
    file: null,
    recurrence: 'none',
    recurrenceEndDate: ''
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isSubcategoryPickerOpen, setIsSubcategoryPickerOpen] = useState(false);
  
  const commentRef = useRef(null);
  useEffect(() => {
    if (commentRef.current && isCommentOpen) {
      commentRef.current.style.height = 'auto';
      commentRef.current.style.height = commentRef.current.scrollHeight + 'px';
    }
  }, [formData.comment, isCommentOpen]);

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        date: transaction.date.substring(0, 10)
      });
      setIsCommentOpen(!!transaction.comment);
    } else {
      const lastDate = safeStorage.getItem('lastTxDate', new Date().toISOString().substring(0, 10));
      const lastType = safeStorage.getItem('lastTxType', 'expense');
      const lastCatId = safeStorage.getItem('lastTxCatId', null);
      const lastCounterparty = safeStorage.getItem('lastTxCounterparty', '');

      const fallbackCat = categories.find(c => c.type === lastType) || categories.find(c => c.type === 'expense');
      const validCat = lastCatId ? categories.find(c => c.id === lastCatId && c.type === lastType) : null;
      const initialCatId = validCat ? validCat.id : (fallbackCat ? fallbackCat.id : '');

      setFormData(prev => ({ 
        ...prev, 
        categoryId: initialCatId,
        subcategoryId: '',
        type: lastType,
        amount: '',
        date: lastDate,
        person: '',
        counterparty: lastCounterparty,
        comment: '',
        tags: [],
        file: null,
        recurrence: 'none',
        recurrenceEndDate: ''
      }));
      setIsCommentOpen(false);
    }
  }, [transaction, categories, isOpen]);

  useEscapeKey(() => {
    if (!isCategoryPickerOpen && !isSubcategoryPickerOpen) {
      onClose();
    }
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'categoryId') next.subcategoryId = '';
      return next;
    });
  };

  const handleTypeChange = (type) => {
    setFormData(prev => {
      const filteredCats = categories.filter(c => c.type === type);
      return { 
        ...prev, 
        type, 
        categoryId: filteredCats.length > 0 ? filteredCats[0].id : '',
        subcategoryId: ''
      };
    });
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const numAmount = Number(formData.amount);
    if (!numAmount || numAmount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }
    if (!formData.categoryId) {
      alert("Category is required");
      return;
    }

    if (formData.recurrence && formData.recurrence !== 'none' && formData.recurrenceEndDate) {
      if (formData.recurrenceEndDate <= formData.date) {
        alert("Recurrence end date must be after the transaction date");
        return;
      }
    }
    
    const finalTagInput = tagInput.trim();
    let finalTags = formData.tags;
    if (finalTagInput && !finalTags.includes(finalTagInput)) {
      finalTags = [...finalTags, finalTagInput];
      setTagInput('');
    }
    
    if (!transaction) {
      safeStorage.setItem('lastTxDate', formData.date);
      safeStorage.setItem('lastTxType', formData.type);
      safeStorage.setItem('lastTxCatId', formData.categoryId);
      safeStorage.setItem('lastTxCounterparty', formData.counterparty);
    }

    const finalData = {
      ...formData,
      tags: finalTags,
      amount: numAmount,
    };

    if (finalData.recurrence && finalData.recurrence !== 'none') {
      const [y, m, d] = finalData.date.split('-');
      const dateObj = new Date(y, m - 1, d);
      
      if (finalData.recurrence === 'daily') dateObj.setDate(dateObj.getDate() + 1);
      else if (finalData.recurrence === 'weekly') dateObj.setDate(dateObj.getDate() + 7);
      else if (finalData.recurrence === 'monthly') dateObj.setMonth(dateObj.getMonth() + 1);
      else if (finalData.recurrence === 'yearly') dateObj.setFullYear(dateObj.getFullYear() + 1);

      const ny = dateObj.getFullYear();
      const nm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const nd = String(dateObj.getDate()).padStart(2, '0');
      finalData.recurrenceNextDate = `${ny}-${nm}-${nd}`;
    } else {
      finalData.recurrenceNextDate = null;
    }
    
    onSave(finalData);
  };

  const filteredCategories = categories.filter(c => c.type === formData.type).sort((a, b) => (a.order || 0) - (b.order || 0));
  const selectedCategory = categories.find(c => c.id === formData.categoryId);
  const selectedSubcategory = selectedCategory?.subcategories?.find(s => s.id === formData.subcategoryId);
  const SelectedCatIcon = ICON_OPTIONS.find(i => i.name === selectedCategory?.iconName)?.icon || TagIcon;
  const SelectedSubcatIcon = selectedSubcategory ? (ICON_OPTIONS.find(i => i.name === selectedSubcategory.iconName)?.icon || TagIcon) : null;
  const subcategories = [...(selectedCategory?.subcategories || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={transaction ? 'Edit Transaction' : 'New Transaction'}>
      <div onClick={e => e.stopPropagation()} style={{ margin: 'auto', width: '100%', maxWidth: '500px' }}>
        <GlassCard className="responsive-card" style={{ padding: '24px', position: 'relative', background: 'var(--solid-card-bg)', maxHeight: '90vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                {transaction ? 'Edit Transaction' : 'New Transaction'}
              </h2>
              <div style={{ display: 'flex', gap: '4px', background: 'var(--item-bg)', padding: '4px', borderRadius: '20px' }}>
                <button type="button" onClick={() => handleTypeChange('expense')} style={{ padding: '6px 16px', borderRadius: '16px', border: 'none', cursor: 'pointer', background: formData.type === 'expense' ? 'var(--solid-card-bg)' : 'transparent', fontWeight: formData.type === 'expense' ? 600 : 500, fontSize: '13px', color: formData.type === 'expense' ? 'var(--accent-coral)' : 'var(--text-main)', boxShadow: formData.type === 'expense' ? 'var(--shadow-soft)' : 'none', transition: 'all 0.3s ease' }}>
                  Expense
                </button>
                <button type="button" onClick={() => handleTypeChange('income')} style={{ padding: '6px 16px', borderRadius: '16px', border: 'none', cursor: 'pointer', background: formData.type === 'income' ? 'var(--solid-card-bg)' : 'transparent', fontWeight: formData.type === 'income' ? 600 : 500, fontSize: '13px', color: formData.type === 'income' ? 'var(--accent-blue)' : 'var(--text-main)', boxShadow: formData.type === 'income' ? 'var(--shadow-soft)' : 'none', transition: 'all 0.3s ease' }}>
                  Income
                </button>
              </div>
            </div>
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="responsive-grid-2" style={{ gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Amount</label>
                <input type="number" step="0.01" name="amount" required className="neu-input" value={formData.amount} onChange={handleChange} placeholder="0.00" autoFocus />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Date</label>
                <CustomDatePicker 
                  value={formData.date} 
                  onChange={(val) => setFormData(prev => ({ ...prev, date: val }))} 
                  alignRight={true}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Category</label>

              <div 
                className="neu-input" 
                onClick={() => setIsCategoryPickerOpen(true)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '10px 14px',
                  userSelect: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: selectedCategory ? 'var(--item-bg)' : 'var(--item-bg-hover)',
                    color: formData.type === 'expense' ? 'var(--accent-coral)' : 'var(--accent-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-soft)'
                  }}>
                    <SelectedCatIcon size={18} />
                  </div>

                  <span style={{ fontWeight: 700, fontSize: '14px', color: selectedCategory ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {selectedCategory ? selectedCategory.name : 'Select a category...'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                  <ChevronDown size={16} />
                </div>
              </div>

              {filteredCategories.length === 0 && (
                <p style={{ fontSize: '12px', color: 'var(--accent-coral)', marginTop: '8px' }}>Please create categories in Settings first.</p>
              )}

              {subcategories.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Subcategory (Optional)</label>
                  <div 
                    className="neu-input" 
                    onClick={() => setIsSubcategoryPickerOpen(true)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      padding: '10px 14px',
                      userSelect: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: selectedSubcategory ? 'var(--item-bg)' : 'var(--item-bg-hover)',
                        color: 'var(--accent-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: 'var(--shadow-soft)'
                      }}>
                        {SelectedSubcatIcon ? <SelectedSubcatIcon size={18} /> : <TagIcon size={18} />}
                      </div>

                      <span style={{ fontWeight: 600, fontSize: '14px', color: selectedSubcategory ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {selectedSubcategory ? selectedSubcategory.name : 'None (No subcategory)'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="responsive-grid-2" style={{ gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Counterparty</label>
                <input type="text" name="counterparty" list="counterparty-list" className="neu-input" value={formData.counterparty || ''} onChange={handleChange} placeholder="e.g. Netflix" style={{ width: '100%', boxSizing: 'border-box' }} />
                <datalist id="counterparty-list">
                  {counterparties.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Person (Who)</label>
                <input type="text" name="person" list="person-list" className="neu-input" value={formData.person || ''} onChange={handleChange} placeholder="e.g. John" style={{ width: '100%', boxSizing: 'border-box' }} />
                <datalist id="person-list">
                  {persons.map(p => <option key={p} value={p} />)}
                </datalist>
              </div>
            </div>

            <div className="responsive-grid-2" style={{ gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Tags (Press Enter)</label>
                <div className="neu-input" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px 16px', minHeight: '44px', alignItems: 'center' }}>
                  {formData.tags.map(tag => (
                    <span key={tag} style={{ background: 'var(--item-bg)', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TagIcon size={12} /> {tag}
                      <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}><X size={12} /></button>
                    </span>
                  ))}
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={formData.tags.length === 0 ? "Add tags..." : ""}
                    style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, minWidth: '80px', color: 'var(--text-main)', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Attachment</label>
                <FileUploader 
                  fileData={formData.file} 
                  onChange={(val) => setFormData(prev => ({ ...prev, file: val }))} 
                  folder="finances" 
                />
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '12px', boxShadow: 'var(--shadow-soft)' }}>
              <div 
                onClick={() => setIsCommentOpen(!isCommentOpen)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: isCommentOpen ? '12px' : '0' }}
              >
                <label style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer', margin: 0 }}>Comment / Note</label>
                {isCommentOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </div>
              {isCommentOpen && (
                <textarea ref={commentRef} name="comment" value={formData.comment} onChange={handleChange} className="neu-textarea" placeholder="Add details..." rows="1" style={{ resize: 'none', overflow: 'hidden' }} />
              )}
            </div>

            <div className={formData.recurrence !== 'none' ? 'responsive-grid-2' : ''} style={{ gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Recurrence</label>
                <CustomSelect 
                  options={[
                    { label: 'None', value: 'none' },
                    { label: 'Daily', value: 'daily' },
                    { label: 'Weekly', value: 'weekly' },
                    { label: 'Monthly', value: 'monthly' },
                    { label: 'Yearly', value: 'yearly' },
                  ]}
                  value={formData.recurrence || 'none'}
                  onChange={(val) => setFormData(prev => ({ ...prev, recurrence: val }))}
                  menuPlacement="top"
                />
              </div>
              
              {formData.recurrence !== 'none' && (
                <div className="fade-in">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>End Date (Optional)</label>
                  <CustomDatePicker 
                    value={formData.recurrenceEndDate || ''} 
                    onChange={(val) => setFormData(prev => ({ ...prev, recurrenceEndDate: val }))} 
                    alignRight={true}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '10px' }}>
              <button type="button" className="pill-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="pill-btn primary" disabled={!formData.amount || !formData.categoryId}>
                {transaction ? 'Save Changes' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>

      {/* Category Picker Modal */}
      {isCategoryPickerOpen && (
        <CategoryPickerModal
          isOpen={isCategoryPickerOpen}
          onClose={() => setIsCategoryPickerOpen(false)}
          title="Выберите категорию"
          options={filteredCategories}
          selectedId={formData.categoryId}
          type={formData.type}
          showTypeSwitch={true}
          onTypeChange={handleTypeChange}
          onSelect={(catId) => {
            setFormData(prev => ({
              ...prev,
              categoryId: catId,
              subcategoryId: ''
            }));
          }}
          placeholder="Поиск категории..."
        />
      )}

      {/* Subcategory Picker Modal */}
      {isSubcategoryPickerOpen && (
        <CategoryPickerModal
          isOpen={isSubcategoryPickerOpen}
          onClose={() => setIsSubcategoryPickerOpen(false)}
          title={`Подкатегории: ${selectedCategory?.name || ''}`}
          options={[
            { id: '', name: 'Без подкатегории (None)', iconName: 'Tag' },
            ...subcategories
          ]}
          selectedId={formData.subcategoryId}
          type={formData.type}
          showTypeSwitch={false}
          onSelect={(subId) => {
            setFormData(prev => ({
              ...prev,
              subcategoryId: subId
            }));
          }}
          placeholder="Поиск подкатегории..."
        />
      )}
    </div>
  );
};

export default TransactionModal;

