// FAJL: src/pages/DriverEarnings.jsx

import React, { useState } from 'react';
import { NavbarDriver } from '../components/NavbarDriver';
import { DriverFooter } from '../components/DriverFooter';
import { DollarSign, ListChecks, Calendar, BarChart2, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Mock podaci su blago prošireni da sadrže i dan u nedelji
const earningsData = {
  today: 45.50,
  thisWeek: 275.80,
  thisMonth: 1150.25,
  recentDeliveries: [
    { id: 'ORD-123', date: '2025-08-19', day: 'Tue', amount: 10.50, restaurant: 'Pizza Palace' },
    { id: 'ORD-122', date: '2025-08-19', day: 'Tue', amount: 8.00, restaurant: 'Sushi Central' },
    { id: 'ORD-120', date: '2025-08-18', day: 'Mon', amount: 12.75, restaurant: 'Burger Barn' },
    { id: 'ORD-119', date: '2025-08-18', day: 'Mon', amount: 9.25, restaurant: 'Taco Town' },
    { id: 'ORD-117', date: '2025-08-17', day: 'Sun', amount: 11.00, restaurant: 'Kebab King' },
    { id: 'ORD-116', date: '2025-08-16', day: 'Sat', amount: 20.00, restaurant: 'Pizza Palace' },
    { id: 'ORD-115', date: '2025-08-15', day: 'Fri', amount: 15.00, restaurant: 'Sushi Central' },
  ],
};

// Pomoćna komponenta StatCard
const StatCard = ({ title, value, icon, color }) => {
  const cardStyle = {
    backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex',
    alignItems: 'center', gap: '1rem',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    cursor: 'pointer'
  };
  const iconStyle = {
    padding: '0.75rem', borderRadius: '50%',
    backgroundColor: color, color: 'white'
  };
  return (
    <div
      style={cardStyle}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.03)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
      }}
    >
      <div style={iconStyle}>{icon}</div>
      <div>
        <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>{title}</p>
        <p style={{ fontWeight: 'bold', fontSize: '1.75rem', margin: '0.25rem 0 0 0', color: '#1F2937' }}>
          ${value.toFixed(2)}
        </p>
      </div>
    </div>
  );
};


// Glavna komponenta stranice
export function DriverEarnings() {
  const [hoveredRow, setHoveredRow] = useState(null);

  // === PRIPREMA PODATAKA ZA OBA GRAFIKONA ===

  // 1. Podaci za Bar Chart (Zarada po danu)
  const earningsByDay = earningsData.recentDeliveries.reduce((acc, delivery) => {
      acc[delivery.day] = (acc[delivery.day] || 0) + delivery.amount;
      return acc;
  }, {});
  const weeklyEarningsChartData = Object.keys(earningsByDay).map(day => ({
      day,
      earnings: parseFloat(earningsByDay[day].toFixed(2)),
  }));

  // 2. Podaci za Pie Chart (Zarada po restoranu)
  const earningsByRestaurant = earningsData.recentDeliveries.reduce((acc, delivery) => {
      acc[delivery.restaurant] = (acc[delivery.restaurant] || 0) + delivery.amount;
      return acc;
  }, {});
  const restaurantChartData = Object.keys(earningsByRestaurant).map(name => ({
      name,
      value: parseFloat(earningsByRestaurant[name].toFixed(2)),
  }));
  const PIE_COLORS = ['#8A643B', '#B58A5F', '#D4A056', '#A9A9A9', '#696969']; // Paleta boja za Pie Chart

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFBEB' }}>
      <NavbarDriver />
      <main style={{ flex: 1, padding: '2rem 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#4A4A4A', marginBottom: '2rem' }}>My Earnings</h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <StatCard title="Today's Earnings" value={earningsData.today} icon={<DollarSign />} color="#34D399" />
            <StatCard title="This Week" value={earningsData.thisWeek} icon={<ListChecks />} color="#60A5FA" />
            <StatCard title="This Month" value={earningsData.thisMonth} icon={<Calendar />} color="#FBBF24" />
          </div>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4A4A4A', marginBottom: '1.5rem' }}>Earnings Analytics</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
              
              <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart2 size={18} /> Weekly Earnings</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyEarningsChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: '#6B7280' }} />
                    <YAxis tick={{ fill: '#6B7280' }} tickFormatter={(value) => `$${value}`} />
                    <Tooltip cursor={{ fill: 'rgba(243, 234, 217, 0.4)' }} contentStyle={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px' }} />
                    <Bar dataKey="earnings" fill="#8A643B" barSize={30} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PieIcon size={18} /> Top Restaurants</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={restaurantChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                            {restaurantChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} contentStyle={{ backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px' }} />
                        <Legend iconType='circle' layout='vertical' verticalAlign='middle' align='right' />
                    </PieChart>
                </ResponsiveContainer>
              </div>

            </div>
          </section>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4A4A4A', marginBottom: '1.5rem' }}>Recent Deliveries</h2>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', color: '#6B7280', fontWeight: '600' }}>Order ID</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#6B7280', fontWeight: '600' }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#6B7280', fontWeight: '600' }}>Restaurant</th>
                  <th style={{ padding: '1rem 1.5rem', color: '#6B7280', fontWeight: '600', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {earningsData.recentDeliveries.map((delivery, index) => {
                  const rowStyle = {
                    borderTop: index > 0 ? '1px solid #F3F4F6' : 'none',
                    transition: 'background-color 0.2s ease',
                    backgroundColor: hoveredRow === delivery.id ? '#FDFDF5' : 'transparent'
                  };

                  return (
                    <tr 
                      key={delivery.id} 
                      style={rowStyle}
                      onMouseEnter={() => setHoveredRow(delivery.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{delivery.id}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#4A4A4A' }}>{delivery.date}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#4A4A4A' }}>{delivery.restaurant}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#10B981', fontWeight: 'bold', textAlign: 'right' }}>+${delivery.amount.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <DriverFooter />
    </div>
  );
}