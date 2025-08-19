// FAJL: src/pages/DriverEarnings.jsx

import React, { useState } from 'react'; // <-- Uvezite useState za praćenje hovera
import { NavbarDriver } from '../components/NavbarDriver';
import { DriverFooter } from '../components/DriverFooter';
import { DollarSign, ListChecks, Calendar } from 'lucide-react';

// Mock podaci ostaju isti
const earningsData = {
  today: 45.50,
  thisWeek: 275.80,
  thisMonth: 1150.25,
  recentDeliveries: [
    { id: 'ORD-123', date: '2025-08-19', amount: 10.50, restaurant: 'Pizza Palace' },
    { id: 'ORD-122', date: '2025-08-19', amount: 8.00, restaurant: 'Sushi Central' },
    { id: 'ORD-120', date: '2025-08-18', amount: 12.75, restaurant: 'Burger Barn' },
    { id: 'ORD-119', date: '2025-08-18', amount: 9.25, restaurant: 'Taco Town' },
    { id: 'ORD-117', date: '2025-08-17', amount: 11.00, restaurant: 'Kebab King' },
  ],
};

// === UNAPREĐENA StatCard KOMPONENTA SA HOVER EFEKTOM ===
const StatCard = ({ title, value, icon, color }) => {
  // Definišemo stilove kao objekte radi preglednosti
  const cardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // Glatka tranzicija
    cursor: 'pointer'
  };

  const iconStyle = {
    padding: '0.75rem',
    borderRadius: '50%',
    backgroundColor: color,
    color: 'white'
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
      <div style={iconStyle}>
        {icon}
      </div>
      <div>
        <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>{title}</p>
        <p style={{ fontWeight: 'bold', fontSize: '1.75rem', margin: '0.25rem 0 0 0', color: '#1F2937' }}>
          ${value.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export function DriverEarnings() {
  // State za praćenje preko kojeg reda u tabeli se nalazi miš
  const [hoveredRow, setHoveredRow] = useState(null);

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
                  // Dinamički stil za red koji se menja na hover
                  const rowStyle = {
                    borderTop: index > 0 ? '1px solid #F3F4F6' : 'none',
                    transition: 'background-color 0.2s ease', // Tranzicija za boju pozadine
                    backgroundColor: hoveredRow === delivery.id ? '#FDFDF5' : 'transparent' // Svetla bež pozadina na hover
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