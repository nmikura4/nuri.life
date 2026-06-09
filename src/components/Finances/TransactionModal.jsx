import React, { useState, useEffect } from 'react';
import GlassCard from '../UI/GlassCard';
import { X, Tag as TagIcon, ChevronDown, ChevronUp } from 'lucide-react';
import CustomDatePicker from '../UI/CustomDatePicker';
import '../UI/UI.css';

const TransactionModal = ({ isOpen, onClose, transaction, onSave, categories, counterparties = [], persons = [] }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    date: new Date().toISOString().substring(0, 10),
    categoryId: '',
    person: '',
    counterparty: '',
    comment: '',
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        date: transaction.date.substring(0, 10)
      });
      setIsCommentOpen(!!transaction.comment);
    } else {
      const expCat = categories.find(c => c.type === 'expense');
      setFormData(prev => ({ 
        ...prev, 
        categoryId: expCat ? expCat.id : '',
        type: 'expense',
        amount: '',
        date: new Date().toISOString().substring(0, 10),
        person: '',
        counterparty: '',
        comment: '',
        tags: []
      }));
      setIsCommentOpen(false);
    }
  }, [transaction, categories, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setFormData(prev => {
      const filteredCats = categories.filter(c => c.type === type);
      return { 
        ...prev, 
        type, 
        categoryId: filteredCats.length > 0 ? filteredCats[0].id : '' 
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
    if (!formData.amount || !formData.categoryId) return;
    
    const finalData = {
      ...formData,
      amount: Number(formData.amount),
    };
    
    onSave(finalData);
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={transaction ? 'Edit Transaction' : 'New Transaction'}>
      <div onClick={e => e.stopPropagation()} style={{ margin: 'auto', width: '100%', maxWidth: '500px' }}>
        <GlassCard className="responsive-card" style={{ padding: '30px', position: 'relative', background: 'var(--solid-card-bg)' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>

          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
            {transaction ? 'Edit Transaction' : 'New Transaction'}
          </h2>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: 'var(--item-bg)', padding: '5px', borderRadius: '20px', width: 'fit-content' }}>
            <button type="button" onClick={() => handleTypeChange('expense')} style={{ padding: '8px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer', background: formData.type === 'expense' ? 'var(--solid-card-bg)' : 'transparent', fontWeight: formData.type === 'expense' ? 600 : 400, color: formData.type === 'expense' ? 'var(--accent-coral)' : 'var(--text-main)', boxShadow: formData.type === 'expense' ? 'var(--shadow-soft)' : 'none', transition: 'all 0.3s ease' }}>
              Expense
            </button>
            <button type="button" onClick={() => handleTypeChange('income')} style={{ padding: '8px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer', background: formData.type === 'income' ? 'var(--solid-card-bg)' : 'transparent', fontWeight: formData.type === 'income' ? 600 : 400, color: formData.type === 'income' ? 'var(--accent-blue)' : 'var(--text-main)', boxShadow: formData.type === 'income' ? 'var(--shadow-soft)' : 'none', transition: 'all 0.3s ease' }}>
              Income
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
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Category</label>
              <select name="categoryId" required className="neu-select" value={formData.categoryId} onChange={handleChange}>
                <option value="" disabled>Select a category</option>
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {filteredCategories.length === 0 && (
                <p style={{ fontSize: '12px', color: 'var(--accent-coral)', marginTop: '8px' }}>Please create categories in Settings first.</p>
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

            <div style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '12px', boxShadow: 'var(--shadow-soft)' }}>
              <div 
                onClick={() => setIsCommentOpen(!isCommentOpen)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: isCommentOpen ? '12px' : '0' }}
              >
                <label style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer', margin: 0 }}>Comment / Note</label>
                {isCommentOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </div>
              {isCommentOpen && (
                <textarea name="comment" value={formData.comment} onChange={handleChange} className="neu-textarea" placeholder="Add details..." rows="3" style={{ resize: 'none' }} />
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
    </div>
  );
};

export default TransactionModal;
