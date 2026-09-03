import React, { useMemo, useState } from 'react';
import GlassCard from '../UI/GlassCard';
import { useFinance } from './FinancesView';
import TransactionsToolbar from './TransactionsToolbar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Sector } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import safeStorage from '../../utils/safeStorage';

const FinancesDashboard = () => {
  const { transactions, allTransactions, allMonthTransactions, categories, currency, handleSaveTransaction } = useFinance();
  const [isProcessingRecurring, setIsProcessingRecurring] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null);
  const [isTrendsCollapsed, setIsTrendsCollapsed] = useState(() => {
    return safeStorage.getItem('finances_trends_collapsed', false);
  });

  const [trendsPeriod, setTrendsPeriod] = useState(() => {
    return safeStorage.getItem('finances_trends_period', 6);
  });

  const toggleTrendsCollapsed = () => {
    setIsTrendsCollapsed(prev => {
      const next = !prev;
      safeStorage.setItem('finances_trends_collapsed', next);
      return next;
    });
  };

  const handlePeriodChange = (period) => {
    setTrendsPeriod(period);
    safeStorage.setItem('finances_trends_period', period);
  };

  const formatMoney = (val) => {
    const num = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(Math.abs(val));
    const curr = (typeof currency === 'string' ? currency : currency?.code) || 'RUB';
    const sign = val < 0 ? '-' : '';
    return (
      <>
        {sign}{num} <span style={{ fontSize: '0.65em', fontWeight: 500, opacity: 0.8 }}>{curr}</span>
      </>
    );
  };

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    const expenseByCategory = {};
    const categorySpending = {};

    (allMonthTransactions || transactions).forEach(t => {
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amount;
      } else {
        expense += amount;
        const catName = categories.find(c => c.id === t.categoryId)?.name || 'Uncategorized';
        expenseByCategory[catName] = (expenseByCategory[catName] || 0) + amount;
        categorySpending[t.categoryId] = (categorySpending[t.categoryId] || 0) + amount;
      }
    });

    const chartData = Object.keys(expenseByCategory).map(name => ({
      name,
      value: expenseByCategory[name]
    })).sort((a, b) => b.value - a.value);

    return { income, expense, balance: income - expense, chartData, categorySpending };
  }, [allMonthTransactions, transactions, categories]);

  // Recurring logic
  const dueRecurring = useMemo(() => {
    const today = new Date().toISOString().substring(0, 10);
    return allTransactions ? allTransactions.filter(t => 
      t.recurrence && t.recurrence !== 'none' && 
      t.recurrenceNextDate && t.recurrenceNextDate <= today &&
      (!t.recurrenceEndDate || t.recurrenceNextDate <= t.recurrenceEndDate)
    ) : [];
  }, [allTransactions]);

  const processRecurring = async () => {
    if (dueRecurring.length === 0) return;
    setIsProcessingRecurring(true);
    for (const t of dueRecurring) {
      const dateParts = t.recurrenceNextDate.split('-');
      if (dateParts.length !== 3) continue;
      let nextDateStr = t.recurrenceNextDate;
      let d = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      let clonedTransactions = [];
      const today = new Date().toISOString().substring(0, 10);

      while (nextDateStr <= today) {
        let clonedTx = { 
          ...t, 
          id: crypto.randomUUID(), 
          date: nextDateStr, 
          createdAt: new Date().toISOString(),
          recurrence: 'none',
          recurrenceNextDate: null,
          recurrenceEndDate: null
        };
        clonedTransactions.push(clonedTx);
        
        if (t.recurrence === 'daily') d.setDate(d.getDate() + 1);
        else if (t.recurrence === 'weekly') d.setDate(d.getDate() + 7);
        else if (t.recurrence === 'monthly') d.setMonth(d.getMonth() + 1);
        else if (t.recurrence === 'yearly') d.setFullYear(d.getFullYear() + 1);
        
        const ny = d.getFullYear();
        const nm = String(d.getMonth() + 1).padStart(2, '0');
        const nd = String(d.getDate()).padStart(2, '0');
        nextDateStr = `${ny}-${nm}-${nd}`;

        if (t.recurrenceEndDate && nextDateStr > t.recurrenceEndDate) {
          break;
        }
      }

      const updatedOriginal = { ...t, recurrenceNextDate: nextDateStr };
      
      if (t.recurrenceEndDate && nextDateStr > t.recurrenceEndDate) {
        updatedOriginal.recurrence = 'none';
        updatedOriginal.recurrenceNextDate = null;
      }

      await handleSaveTransaction(updatedOriginal);
      for (const ctx of clonedTransactions) {
        await handleSaveTransaction(ctx);
      }
    }
    setIsProcessingRecurring(false);
  };

  // Trend Chart logic (Last 6 or 12 months)
  const trendsData = useMemo(() => {
    const monthsMap = {};
    const today = new Date();
    const count = Number(trendsPeriod) || 6;
    
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short' });
      monthsMap[key] = { name: label, Income: 0, Expenses: 0, sortKey: key };
    }

    if (allTransactions) {
      allTransactions.forEach(t => {
        const txMonth = t.date?.substring(0, 7);
        if (monthsMap[txMonth]) {
          if (t.type === 'income') monthsMap[txMonth].Income += Number(t.amount) || 0;
          else monthsMap[txMonth].Expenses += Number(t.amount) || 0;
        }
      });
    }

    return Object.values(monthsMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [allTransactions, trendsPeriod]);


  const categoriesWithBudgets = categories ? categories.filter(c => c.type === 'expense' && c.budget > 0) : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.6)', 
          backdropFilter: 'blur(16px)', 
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.5)', 
          borderRadius: '16px', 
          padding: '12px 16px', 
          boxShadow: 'var(--shadow-soft)' 
        }}>
          {label && <p style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{label}</p>}
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0', fontSize: '13px', fontWeight: 700, color: entry.color }}>
              {entry.name}: {formatMoney(entry.value)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const COLORS = [
    '#f26a5b', // Warm Coral
    '#3a86ff', // Royal Blue
    '#2ec4b6', // Turquoise Teal
    '#ff9f1c', // Vibrant Amber
    '#8338ec', // Purple
    '#06d6a0', // Mint Green
    '#ff006e', // Magenta Pink
    '#4cc9f0', // Sky Blue
    '#e76f51', // Terracotta
    '#9d4edd', // Orchid
    '#588157', // Forest Sage
    '#f77f00', // Deep Orange
    '#4895ef', // Cornflower Blue
    '#d62828'  // Crimson
  ];

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 3}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2))', transition: 'all 0.2s ease' }}
        />
      </g>
    );
  };

  const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 12px', paddingTop: '12px' }}>
        {payload.map((entry, index) => {
          const isHovered = activeCategoryIndex === index;
          const isOtherHovered = activeCategoryIndex !== null && !isHovered;
          const catData = stats.chartData[index];
          const percent = stats.expense > 0 && catData ? Math.round((catData.value / stats.expense) * 100) : 0;

          return (
            <div
              key={`legend-${index}`}
              onMouseEnter={() => setActiveCategoryIndex(index)}
              onMouseLeave={() => setActiveCategoryIndex(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                opacity: isOtherHovered ? 0.4 : 1,
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                padding: '4px 10px',
                borderRadius: '12px',
                background: isHovered ? 'var(--item-bg)' : 'transparent',
                boxShadow: isHovered ? 'var(--shadow-soft)' : 'none',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: entry.color,
                  display: 'inline-block',
                  flexShrink: 0
                }}
              />
              <span style={{ 
                fontSize: '13px', 
                fontWeight: isHovered ? 700 : 500, 
                color: isHovered ? 'var(--text-main)' : 'var(--text-muted)',
                transition: 'color 0.2s ease'
              }}>
                {entry.value} {percent > 0 && <span style={{ opacity: 0.75, fontSize: '11px', marginLeft: '2px' }}>({percent}%)</span>}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Recurring Alert */}
      {dueRecurring.length > 0 && (
        <GlassCard style={{ padding: '20px', background: 'var(--accent-cream)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Clock size={24} color="var(--accent-coral)" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Recurring Transactions Due</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>You have {dueRecurring.length} recurring transaction(s) pending for today or earlier.</p>
            </div>
          </div>
          <button 
            onClick={processRecurring} 
            disabled={isProcessingRecurring}
            className="pill-btn primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <CheckCircle size={18} />
            {isProcessingRecurring ? 'Processing...' : `Process ${dueRecurring.length} transaction(s)`}
          </button>
        </GlassCard>
      )}

      {/* Main Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '30px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
          <GlassCard style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'var(--accent-cream)', padding: '16px', borderRadius: '50%', boxShadow: 'var(--shadow-inner)' }}>
              <Wallet size={28} color="var(--text-main)" />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Net Balance</p>
              <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-main)' }}>
                {formatMoney(stats.balance)}
              </h2>
            </div>
          </GlassCard>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '20px' }}>
            <GlassCard style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ background: 'rgba(164, 201, 229, 0.2)', padding: '8px', borderRadius: '50%' }}>
                  <ArrowUpRight size={20} color="var(--accent-blue)" />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>INCOME</p>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700 }}>{formatMoney(stats.income)}</h3>
            </GlassCard>

            <GlassCard style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ background: 'rgba(239, 154, 138, 0.2)', padding: '8px', borderRadius: '50%' }}>
                  <ArrowDownRight size={20} color="var(--accent-coral)" />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>EXPENSES</p>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700 }}>{formatMoney(stats.expense)}</h3>
            </GlassCard>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', paddingTop: '10px' }}>
            <TransactionsToolbar />
          </div>
        </div>

        <GlassCard style={{ padding: '20px', minHeight: '300px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Expenses by Category</h3>
          {stats.chartData.length > 0 ? (
            <div style={{ flex: 1, width: '100%', minHeight: '250px', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    activeIndex={activeCategoryIndex !== null ? activeCategoryIndex : undefined}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => setActiveCategoryIndex(index)}
                    onMouseLeave={() => setActiveCategoryIndex(null)}
                  >
                    {stats.chartData.map((entry, index) => {
                      const isHovered = activeCategoryIndex === index;
                      const isOtherHovered = activeCategoryIndex !== null && !isHovered;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          opacity={isOtherHovered ? 0.35 : 1}
                          style={{ transition: 'opacity 0.2s ease', cursor: 'pointer' }}
                        />
                      );
                    })}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend content={renderCustomLegend} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No expense data for this month.
            </div>
          )}
        </GlassCard>
      </div>

      {/* Row 2: Trend Chart and Budgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '30px' }}>
        
        {/* Trend Chart */}
        <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: isTrendsCollapsed ? 'auto' : '350px', minWidth: 0, transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isTrendsCollapsed ? '0' : '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                {trendsPeriod === 12 ? '1-Year Trends' : '6-Month Trends'}
              </h3>
              <div style={{ display: 'flex', gap: '3px', background: 'var(--item-bg)', padding: '3px', borderRadius: '16px' }}>
                <button
                  type="button"
                  onClick={() => handlePeriodChange(6)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    background: trendsPeriod === 6 ? 'var(--solid-card-bg)' : 'transparent',
                    fontWeight: trendsPeriod === 6 ? 700 : 500,
                    fontSize: '12px',
                    color: trendsPeriod === 6 ? 'var(--accent-blue)' : 'var(--text-muted)',
                    boxShadow: trendsPeriod === 6 ? 'var(--shadow-soft)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  6M
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodChange(12)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    background: trendsPeriod === 12 ? 'var(--solid-card-bg)' : 'transparent',
                    fontWeight: trendsPeriod === 12 ? 700 : 500,
                    fontSize: '12px',
                    color: trendsPeriod === 12 ? 'var(--accent-blue)' : 'var(--text-muted)',
                    boxShadow: trendsPeriod === 12 ? 'var(--shadow-soft)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  1Y
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTrendsCollapsed}
              className="neu-icon-btn"
              style={{ width: '32px', height: '32px', borderRadius: '50%', color: 'var(--text-muted)' }}
              title={isTrendsCollapsed ? "Развернуть график" : "Свернуть график"}
              aria-label={isTrendsCollapsed ? "Развернуть график" : "Свернуть график"}
            >
              {isTrendsCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>

          {!isTrendsCollapsed && (
            <div style={{ flex: 1, width: '100%', minHeight: '240px', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    content={<CustomTooltip />}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '13px' }} />
                  <Bar dataKey="Income" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} maxBarSize={trendsPeriod === 12 ? 24 : 40} />
                  <Bar dataKey="Expenses" fill="var(--accent-coral)" radius={[4, 4, 0, 0]} maxBarSize={trendsPeriod === 12 ? 24 : 40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>

        {/* Budgets */}
        {categoriesWithBudgets.length > 0 && (
          <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '350px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Budget Tracking</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {categoriesWithBudgets.map(cat => {
                const spent = stats.categorySpending[cat.id] || 0;
                const budget = cat.budget;
                const percent = Math.min(100, Math.round((spent / budget) * 100));
                
                let progressColor = 'var(--accent-green)';
                if (percent >= 100) progressColor = 'var(--accent-coral)';
                else if (percent >= 80) progressColor = 'var(--accent-yellow)';

                return (
                  <div key={cat.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                      <span style={{ fontWeight: 600 }}>{cat.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: percent >= 100 ? 'var(--accent-coral)' : 'inherit' }}>{formatMoney(spent)}</span> / {formatMoney(budget)}
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--card-border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${percent}%`, 
                        background: progressColor,
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}
      </div>

    </div>
  );
};

export default FinancesDashboard;
