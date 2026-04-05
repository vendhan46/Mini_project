import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { getStoredUser } from '../../utils/auth';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getStoredUser();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [summaryResponse, historyResponse] = await Promise.all([
          api.get('/user/dashboard'),
          api.get('/user/history?limit=30'),
        ]);

        setSummary(summaryResponse.data.summary);
        setHistory(historyResponse.data.history || []);
      } catch (loadError) {
        const message = loadError?.response?.data?.error || 'Failed to load dashboard data.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className='dashboard-page'>Loading dashboard...</div>;
  }

  if (error) {
    return <div className='dashboard-page dashboard-error'>{error}</div>;
  }

  return (
    <div className='dashboard-page'>
      <div className='dashboard-header'>
        <h2>{user?.name ? `${user.name}'s Dashboard` : 'Dashboard'}</h2>
      </div>

      <div className='dashboard-stats'>
        <div className='stat-card'>
          <h4>Total Interactions</h4>
          <p>{summary?.total_interactions ?? 0}</p>
        </div>
        <div className='stat-card'>
          <h4>Top Mood</h4>
          <p>{summary?.top_mood || 'Not enough data'}</p>
        </div>
        <div className='stat-card'>
          <h4>Recent Actions</h4>
          <p>{summary?.recent_interactions?.length ?? 0}</p>
        </div>
      </div>

      <div className='history-card'>
        <h3>History</h3>
        {history.length === 0 ? (
          <p>No interactions yet. Start by capturing your emotion.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Detected</th>
                <th>Final</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.created_at).toLocaleString()}</td>
                  <td>{entry.detected_emotion || '-'}</td>
                  <td>{entry.final_emotion || '-'}</td>
                  <td>{entry.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
