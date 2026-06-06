import React, { useMemo } from 'react';
import GlassCard from '../UI/GlassCard';
import { useFinance } from './FinancesView';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

const FinancesDashboard = () => {
  const { transactions, categories, currency } = useFinance();

  const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    const expenseByCategory = {};

    transactions.forEach(t => {
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amount;
      } else {
        expense += amount;
        const catName = categories.find(c => c.id === t.categoryId)?.name || 'Uncategorized';
        expenseByCategory[catName] = (expenseByCategory[catName] || 0) + amount;
      }
    });

    const chartData = Object.keys(expenseByCategory).map(name => ({
      name,
      value: expenseByCategory[name]
    })).sort((a, b) => b.value - a.value);

    return { income, expense, balance: income - expense, chartData };
  }, [transactions, categories]);

  const COLORS = ['#ef9a8a', '#a4c9e5', '#fbbba1', '#b7d5ec', '#f4c2c2', '#d46f5b', '#5b8fb9'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
      </div>

      <GlassCard style={{ padding: '20px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Expenses by Category</h3>
        {stats.chartData.length > 0 ? (
          <div style={{ flex: 1, width: '100%', minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
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
                <RechartsTooltip 
                  contentStyle={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-card)', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: 'var(--text-main)', fontWeight: 600 }}
                  formatter={(value) => formatMoney(value)}
                />
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
  );
};

export default FinancesDashboard;
