import React, { useState, useMemo, useEffect } from 'react';
import GlassCard from '../UI/GlassCard';
import { useFinance } from './FinancesView';
import { Edit2, Trash2, Tag as TagIcon, Paperclip, CreditCard, Banknote, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ICON_OPTIONS } from '../Settings/icons';
import CustomDatePicker from '../UI/CustomDatePicker';
import CustomSelect from '../UI/CustomSelect';
import safeStorage from '../../utils/safeStorage';

const LIMIT_OPTIONS = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
  { value: 'all', label: 'All' }
];

const TransactionsTable = () => {
  const { transactions, categories, currency, openEditTransaction, handleDeleteTransaction, selectedMonth, setSelectedMonth } = useFinance();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [limit, setLimit] = useState(() => {
    return safeStorage.getItem('transactions_table_limit', '20');
  });
  const [currentPage, setCurrentPage] = useState(1);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setCurrentPage(1);
    if (newDate && setSelectedMonth) {
      const newMonth = newDate.substring(0, 7);
      if (newMonth !== selectedMonth) {
        setSelectedMonth(newMonth);
      }
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    safeStorage.setItem('transactions_table_limit', newLimit);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (selectedDate && !selectedDate.startsWith(selectedMonth)) {
      setSelectedDate('');
      setCurrentPage(1);
    }
  }, [selectedMonth]);

  const dateFilteredTransactions = useMemo(() => {
    if (!selectedDate) return transactions;
    return transactions.filter(t => t.date === selectedDate);
  }, [transactions, selectedDate]);

  const { periodIncome, periodExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    dateFilteredTransactions.forEach(t => {
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amount;
      } else {
        expense += amount;
      }
    });
    return { periodIncome: income, periodExpense: expense };
  }, [dateFilteredTransactions]);

  const numLimit = limit === 'all' ? dateFilteredTransactions.length : (parseInt(limit, 10) || 20);
  const totalPages = Math.max(1, Math.ceil(dateFilteredTransactions.length / (numLimit || 1)));
  const activePage = Math.min(currentPage, totalPages);

  const displayedTransactions = useMemo(() => {
    if (limit === 'all') return dateFilteredTransactions;
    const start = (activePage - 1) * numLimit;
    return dateFilteredTransactions.slice(start, start + numLimit);
  }, [dateFilteredTransactions, limit, activePage, numLimit]);

  const startItem = dateFilteredTransactions.length === 0 ? 0 : (limit === 'all' ? 1 : (activePage - 1) * numLimit + 1);
  const endItem = limit === 'all' ? dateFilteredTransactions.length : Math.min(activePage * numLimit, dateFilteredTransactions.length);

  const formatMoney = (val) => {
    const num = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Math.abs(val));
    const curr = (typeof currency === 'string' ? currency : currency?.code) || 'RUB';
    return `${num} ${curr}`;
  };

  return (
    <GlassCard style={{ padding: '30px', overflow: 'visible' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Transactions</h3>
            <span style={{ 
              fontSize: '12px', 
              fontWeight: 700, 
              padding: '3px 9px', 
              borderRadius: '12px', 
              background: 'var(--item-bg)', 
              color: 'var(--text-muted)' 
            }}>
              {dateFilteredTransactions.length}
            </span>
          </div>

          {/* Income and Expense summary for the selected calendar period */}
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '10px', 
              background: 'var(--item-bg)', 
              padding: '5px 12px', 
              borderRadius: '14px', 
              boxShadow: 'var(--shadow-inner)',
              border: '1px solid var(--card-border)'
            }}
          >
            <div 
              title={`Income for selected period: ${periodIncome > 0 ? '+' : ''}${formatMoney(periodIncome)}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-blue)' }}
            >
              <ArrowUpRight size={15} strokeWidth={2.5} />
              <span>{periodIncome > 0 ? '+' : ''}{formatMoney(periodIncome)}</span>
            </div>
            <div style={{ width: '1px', height: '14px', background: 'var(--card-border)', opacity: 0.8 }} />
            <div 
              title={`Expenses for selected period: ${periodExpense > 0 ? '-' : ''}${formatMoney(periodExpense)}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-coral)' }}
            >
              <ArrowDownRight size={15} strokeWidth={2.5} />
              <span>{periodExpense > 0 ? '-' : ''}{formatMoney(periodExpense)}</span>
            </div>
          </div>
        </div>

        {/* Filters in the indicated place */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Specific date selector */}
          <div style={{ width: '138px' }}>
            <CustomDatePicker 
              value={selectedDate}
              onChange={handleDateChange}
              placeholder="All Dates"
              defaultMonth={selectedMonth}
              alignRight={true}
              center={true}
              innerStyle={{ padding: '8px 8px', fontSize: '13px', minHeight: '36px' }}
            />
          </div>

          {/* Rows limit selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Show:</span>
            <div style={{ width: '90px' }}>
              <CustomSelect 
                value={limit}
                onChange={handleLimitChange}
                options={LIMIT_OPTIONS}
                center={true}
                innerStyle={{ padding: '8px 10px', fontSize: '13px', minHeight: '36px' }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {dateFilteredTransactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <p>
            {selectedDate 
              ? 'No transactions found for the selected date.' 
              : 'No transactions found for this period.'}
          </p>
          {selectedDate && (
            <button 
              type="button" 
              onClick={() => handleDateChange('')} 
              className="pill-btn" 
              style={{ marginTop: '10px', fontSize: '13px' }}
            >
              Show all transactions for this month
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            <table className="transactions-table-desktop" style={{ minWidth: '600px' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)' }}>
                <th>Date</th>
                <th>Category</th>
                <th>Details</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedTransactions.map(t => {
                const cat = categories.find(c => c.id === t.categoryId);
                const subcat = cat?.subcategories?.find(s => s.id === t.subcategoryId);
                
                const CatIcon = ICON_OPTIONS.find(i => i.name === cat?.iconName)?.icon || TagIcon;
                const SubcatIcon = subcat ? (ICON_OPTIONS.find(i => i.name === subcat.iconName)?.icon || TagIcon) : null;
                
                let formattedDate = 'Invalid Date';
                if (t.date) {
                  const dateObj = new Date(t.date.includes('T') ? t.date : t.date + 'T12:00:00');
                  if (!isNaN(dateObj.getTime())) {
                    formattedDate = dateObj.toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    });
                  }
                }

                return (
                  <tr key={t.id} className="transaction-row">
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{formattedDate}</div>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'var(--item-bg)', padding: '4px 10px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600 }}>
                        {subcat ? (
                          <>
                            <SubcatIcon size={13} color={t.type === 'income' ? 'var(--accent-blue)' : 'var(--accent-coral)'} />
                            {cat?.name} → {subcat.name}
                          </>
                        ) : (
                          <>
                            <CatIcon size={13} color={t.type === 'income' ? 'var(--accent-blue)' : 'var(--accent-coral)'} />
                            {cat?.name || 'Uncategorized'}
                          </>
                        )}
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>
                          {t.counterparty} {t.person && `• ${t.person}`}
                        </div>
                        {t.comment && <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{t.comment}</div>}
                        {t.tags && t.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                            {t.tags.map(tag => (
                              <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: 'var(--card-bg)', padding: '2px 8px', borderRadius: '8px', color: 'var(--text-muted)' }}>
                                <TagIcon size={10} /> {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {t.file && t.file.url && (
                          <div style={{ marginTop: '2px' }}>
                            <a href={t.file.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent-blue)', textDecoration: 'none', background: 'var(--item-bg)', padding: '3px 8px', borderRadius: '8px' }}>
                              <Paperclip size={12} /> {t.file.name || 'Attachment'}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <span style={{ color: t.type === 'income' ? 'var(--accent-blue)' : 'var(--accent-coral)' }}>
                          {t.type === 'income' ? '+' : '-'}{formatMoney(Number(t.amount))}
                        </span>
                        <span 
                          title={t.paymentMethod === 'cash' ? 'Cash' : 'Card'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '22px',
                            height: '22px',
                            borderRadius: '7px',
                            background: 'var(--item-bg)',
                            flexShrink: 0,
                            boxShadow: 'var(--shadow-inner)'
                          }}
                        >
                          {t.paymentMethod === 'cash' ? (
                            <Banknote size={12} color="var(--text-main)" />
                          ) : (
                            <CreditCard size={12} color="var(--text-main)" />
                          )}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button onClick={() => openEditTransaction(t)} style={{ background: 'var(--item-bg)', border: 'none', padding: '6px', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDeleteTransaction(t.id)} style={{ background: 'var(--item-bg)', border: 'none', padding: '6px', borderRadius: '10px', cursor: 'pointer', color: 'var(--accent-coral)' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          {/* Mobile Cards View */}
          <div className="transactions-cards-mobile">
            {displayedTransactions.map(t => {
              const cat = categories.find(c => c.id === t.categoryId);
              const subcat = cat?.subcategories?.find(s => s.id === t.subcategoryId);
              
              const CatIcon = ICON_OPTIONS.find(i => i.name === cat?.iconName)?.icon || TagIcon;
              const SubcatIcon = subcat ? (ICON_OPTIONS.find(i => i.name === subcat.iconName)?.icon || TagIcon) : null;
              
              let formattedDate = 'Invalid Date';
              if (t.date) {
                const dateObj = new Date(t.date.includes('T') ? t.date : t.date + 'T12:00:00');
                if (!isNaN(dateObj.getTime())) {
                  formattedDate = dateObj.toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  });
                }
              }

              return (
                <div 
                  key={t.id}
                  style={{
                    background: 'var(--item-bg)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: 'var(--shadow-soft)',
                    border: '1px solid var(--card-border)'
                  }}
                >
                  {/* Top Row: Category + Amount */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--card-bg)', padding: '6px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 600 }}>
                      {subcat ? (
                        <>
                          <SubcatIcon size={14} color={t.type === 'income' ? 'var(--accent-blue)' : 'var(--accent-coral)'} />
                          <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cat?.name} → {subcat.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <CatIcon size={14} color={t.type === 'income' ? 'var(--accent-blue)' : 'var(--accent-coral)'} />
                          <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cat?.name || 'Uncategorized'}
                          </span>
                        </>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '16px', color: t.type === 'income' ? 'var(--accent-blue)' : 'var(--accent-coral)' }}>
                        {t.type === 'income' ? '+' : '-'}{formatMoney(Number(t.amount))}
                      </span>
                      <span 
                        title={t.paymentMethod === 'cash' ? 'Cash' : 'Card'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '22px',
                          height: '22px',
                          borderRadius: '7px',
                          background: 'var(--card-bg)',
                          flexShrink: 0,
                          boxShadow: 'var(--shadow-inner)'
                        }}
                      >
                        {t.paymentMethod === 'cash' ? (
                          <Banknote size={12} color="var(--text-main)" />
                        ) : (
                          <CreditCard size={12} color="var(--text-main)" />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>{formattedDate}</span>
                      {(t.counterparty || t.person) && (
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {t.counterparty} {t.person && `• ${t.person}`}
                        </span>
                      )}
                    </div>

                    {t.comment && (
                      <div style={{ fontSize: '13px', color: 'var(--text-main)', marginTop: '2px' }}>
                        {t.comment}
                      </div>
                    )}

                    {t.tags && t.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {t.tags.map(tag => (
                          <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: 'var(--card-bg)', padding: '2px 8px', borderRadius: '8px', color: 'var(--text-muted)' }}>
                            <TagIcon size={10} /> {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {t.file && t.file.url && (
                      <div style={{ marginTop: '6px' }}>
                        <a href={t.file.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent-blue)', textDecoration: 'none', background: 'var(--card-bg)', padding: '4px 10px', borderRadius: '8px' }}>
                          <Paperclip size={12} /> {t.file.name || 'Attachment'}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Bottom: Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '6px', borderTop: '1px solid var(--card-border)' }}>
                    <button 
                      onClick={() => openEditTransaction(t)} 
                      style={{ 
                        background: 'var(--card-bg)', 
                        border: 'none', 
                        padding: '8px 14px', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        color: 'var(--text-main)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteTransaction(t.id)} 
                      style={{ 
                        background: 'var(--card-bg)', 
                        border: 'none', 
                        padding: '8px 14px', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        color: 'var(--accent-coral)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {limit !== 'all' && dateFilteredTransactions.length > (parseInt(limit, 10) || 20) && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '20px', 
              paddingTop: '16px', 
              borderTop: '1px solid var(--card-border)', 
              flexWrap: 'wrap', 
              gap: '12px' 
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Showing {startItem}–{endItem} of {dateFilteredTransactions.length}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={activePage === 1}
                  className="neu-icon-btn"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', opacity: activePage === 1 ? 0.35 : 1, cursor: activePage === 1 ? 'not-allowed' : 'pointer' }}
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', padding: '0 4px' }}>
                  {activePage} / {totalPages}
                </span>
                <button 
                  type="button" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={activePage === totalPages}
                  className="neu-icon-btn"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', opacity: activePage === totalPages ? 0.35 : 1, cursor: activePage === totalPages ? 'not-allowed' : 'pointer' }}
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </GlassCard>
  );
};

export default TransactionsTable;
