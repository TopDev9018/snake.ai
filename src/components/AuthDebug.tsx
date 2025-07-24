import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { roleApi } from '../pages/patron/services/apiService';

const AuthDebug: React.FC = () => {
  const { isAuthenticated, user, sessionId, login } = useAuth();
  const [testResult, setTestResult] = useState<string>('');

  const testApiCall = async () => {
    try {
      setTestResult('Testing API call...');
      const result = await roleApi.getUserRole();
      if (result.success) {
        setTestResult(`API call successful: ${JSON.stringify(result.data)}`);
      } else {
        setTestResult(`API call failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`API call error: ${error}`);
    }
  };

  const mockLogin = async () => {
    try {
      setTestResult('Creating development session...');
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1'}/dev/login`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        login(data.session_id);
        setTestResult(`Development login successful! User: ${data.user.twitter_username}`);
      } else {
        const errorText = await response.text();
        setTestResult(`Development login failed: ${errorText}`);
      }
    } catch (error) {
      setTestResult(`Development login error: ${error}`);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '100px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid black', 
      padding: '10px',
      zIndex: 1000,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h4>Auth Debug</h4>
      <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      <p><strong>Session ID:</strong> {sessionId || 'none'}</p>
      <p><strong>User:</strong> {user?.twitter_username || 'none'}</p>
      
      {!isAuthenticated && (
        <button onClick={mockLogin} style={{ marginTop: '10px', backgroundColor: '#A9E000', border: 'none', padding: '5px 10px' }}>
          Mock Login (Dev)
        </button>
      )}
      
      <button onClick={testApiCall} style={{ marginTop: '10px', marginLeft: '5px' }}>
        Test API Call
      </button>
      
      <div style={{ marginTop: '10px', wordBreak: 'break-word' }}>
        {testResult}
      </div>
    </div>
  );
};

export default AuthDebug;
