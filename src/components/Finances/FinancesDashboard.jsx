import React, { useMemo, useState } from 'react';
import GlassCard from '../UI/GlassCard';
import { useFinance } from './FinancesView';
import TransactionsToolbar from './TransactionsToolbar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, CheckCircle, Clock } from 'lucide-react';

const FinancesDashboard = () => {
  const { transactions, allTransactions, allMonthTransactions, categories, currency, handleSaveTransaction } = useFinance();
  const [isProcessingRecurring, setIsProcessingRecurring] = useState(false);

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

  // Trend Chart logic (Last 6 months)
  const trendsData = useMemo(() => {
    const monthsMap = {};
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
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
  }, [allTransactions]);

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

  const COLORS = ['#ef9a8a', '#a4c9e5', '#fbbba1', '#b7d5ec', '#f4c2c2', '#d46f5b', '#5b8fb9'];

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
                  >
                    {stats.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
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
        <GlassCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '350px', minWidth: 0 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>6-Month Trends</h3>
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
                <Bar dataKey="Income" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Expenses" fill="var(--accent-coral)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
