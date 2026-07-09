import React from 'react';
import GlassCard from '../UI/GlassCard';
import { useFinance } from './FinancesView';
import { Edit2, Trash2, Tag as TagIcon } from 'lucide-react';
import { ICON_OPTIONS } from '../Settings/icons';

const TransactionsTable = () => {
  const { transactions, categories, currency, openEditTransaction, handleDeleteTransaction } = useFinance();

  const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val);

  return (
    <GlassCard style={{ padding: '30px', overflowX: 'auto' }}>
      <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Recent Transactions</h3>
      
      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <p>No transactions found for this period.</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: '14px' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Details</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => {
              const cat = categories.find(c => c.id === t.categoryId);
              const subcat = cat?.subcategories?.find(s => s.id === t.subcategoryId);
              
              const CatIcon = ICON_OPTIONS.find(i => i.name === cat?.iconName)?.icon || TagIcon;
              const SubcatIcon = subcat ? (ICON_OPTIONS.find(i => i.name === subcat.iconName)?.icon || TagIcon) : null;
              
              const formattedDate = new Date(t.date + 'T12:00:00').toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
              });

              return (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)', transition: 'background 0.2s', ':hover': { background: 'var(--item-bg)' } }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{formattedDate}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--item-bg)', padding: '6px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 600 }}>
                      {subcat ? (
                        <>
                          <SubcatIcon size={14} color={t.type === 'income' ? 'var(--accent-blue)' : 'var(--accent-coral)'} />
                          {cat?.name} → {subcat.name}
                        </>
                      ) : (
                        <>
                          <CatIcon size={14} color={t.type === 'income' ? 'var(--accent-blue)' : 'var(--accent-coral)'} />
                          {cat?.name || 'Uncategorized'}
                        </>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px', maxWidth: '300px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>
                        {t.counterparty} {t.person && `• ${t.person}`}
                      </div>
                      {t.comment && <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t.comment}</div>}
                      {t.tags && t.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {t.tags.map(tag => (
                            <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: 'var(--card-bg)', padding: '2px 8px', borderRadius: '8px', color: 'var(--text-muted)' }}>
                              <TagIcon size={10} /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, fontSize: '16px', color: t.type === 'income' ? 'var(--accent-blue)' : 'var(--accent-coral)' }}>
                    {t.type === 'income' ? '+' : '-'}{formatMoney(Number(t.amount))}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => openEditTransaction(t)} style={{ background: 'var(--item-bg)', border: 'none', padding: '8px', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteTransaction(t.id)} style={{ background: 'var(--item-bg)', border: 'none', padding: '8px', borderRadius: '12px', cursor: 'pointer', color: 'var(--accent-coral)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </GlassCard>
  );
};

export default TransactionsTable;
