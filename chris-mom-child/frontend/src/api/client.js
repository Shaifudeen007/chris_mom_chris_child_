import axios from 'axios';

// GLOBAL FLAG: Set this to false when your backend is ready!
export const USE_MOCK_BACKEND = false; 

const api = axios.create({
  // Aligning with the REST API Structure in the Technical Design Document
  baseURL: 'http://localhost:8000/api' 
});

// Automatically inject JWT token to all requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('cmcc_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRevealed = false;
let mockTasks = [
  { id: 1, title: 'Bake Cookies', description: 'Bake 10 chocolate chip cookies for the office.', status: 'APPROVED', points: 50 }
];

if (USE_MOCK_BACKEND) {
  api.defaults.adapter = async (config) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let payload = null;
        let message = "Success";
        
        const url = config.url || '';
        const method = (config.method || 'get').toLowerCase();

        // --- 1. Authentication ---
        if (url.includes('/auth/login') && method === 'post') {
          const body = JSON.parse(config.data);
          payload = { access_token: body.email, refresh_token: 'mock-refresh-123' };
          message = "Logged in successfully";
        } 
        else if (url.includes('/auth/register') && method === 'post') {
          payload = { id: 1, name: 'Mock User', email: 'mock@example.com' };
          message = "Registered successfully";
        }
        else if (url.includes('/auth/me') && method === 'get') {
          const token = config.headers?.Authorization?.split(' ')[1];
          if (token === 'admin@example.com') {
            payload = { id: 1, name: 'Demo Admin Player', role: 'ADMIN', email: 'admin@example.com' };
          } else {
            payload = { id: 2, name: 'Demo User Player', role: 'USER', email: token || 'user@example.com' };
          }
        }
        
        // --- 2. Game ---
        else if (url.endsWith('/games') && method === 'get') {
          payload = [
            { id: 1, name: 'Family Christmas 2026', status: isRevealed ? 'REVEALED' : 'ACTIVE' },
            { id: 2, name: 'Office Secret Santa', status: 'ACTIVE' },
            { id: 3, name: 'Friends Group', status: 'COMPLETED' }
          ];
        }
        else if (url.match(/\/games\/\d+$/) && method === 'get') {
          payload = { id: 1, name: 'Family Christmas 2026', status: isRevealed ? 'REVEALED' : 'ACTIVE' };
        }
        else if (url.includes('/join') && method === 'post') {
          payload = { participantId: 101, status: 'JOINED' };
          message = "Joined game successfully";
        }

        // --- 3. Participant (Identities) ---
        else if (url.includes('/my-identities') && method === 'get') {
          payload = [
            { 
              role: 'MOM', 
              secretCode: 'MOM-X7K92', 
              counterpartAlias: 'Little Helper', 
              revealed: isRevealed,
              counterpart_name: isRevealed ? 'Rahul Sharma' : null
            },
            { 
              role: 'CHILD', 
              secretCode: 'CHILD-A8P31', 
              counterpartAlias: 'Santa Claus', 
              revealed: isRevealed,
              counterpart_name: isRevealed ? 'Sarah Johnson' : null
            }
          ];
        }

        // --- 4. Mom & Child Tasks ---
        else if (url.includes('/mom/tasks') && method === 'post') {
          const body = JSON.parse(config.data);
          const newTask = { id: mockTasks.length + 1, title: body.title, description: body.description, status: 'PENDING', points: body.points };
          mockTasks.push(newTask);
          payload = newTask;
          message = "Mission created successfully!";
        }
        else if (url.includes('/mom/tasks') && method === 'get') {
          payload = mockTasks;
        }
        else if (url.includes('/child/tasks') && method === 'get') {
          payload = mockTasks.filter(t => t.status === 'APPROVED');
        }

        // --- 5. Leaderboard ---
        else if (url.includes('/leaderboard') && method === 'get') {
          payload = [
            { rank: 1, secretCode: 'ELF-X92K', points: 450 },
            { rank: 2, secretCode: 'RUDOLPH-77', points: 320 }
          ];
        }
        
        // --- 6. Admin Actions ---
        else if (url.includes('/admin/users') && method === 'get') {
          payload = [
            { id: 1, name: 'Admin Player', email: 'admin@example.com', role: 'ADMIN' },
            { id: 2, name: 'Demo Mom', email: 'mom@example.com', role: 'USER' },
            { id: 3, name: 'Demo Child', email: 'child@example.com', role: 'USER' }
          ];
        }
        else if (url.includes('/admin/matches') && method === 'get') {
          payload = [
            { id: 1, momName: 'Demo Mom', childName: 'Demo Child', gameName: 'Family Christmas 2026' }
          ];
        }
        else if (url.includes('/admin/tasks') && method === 'get') {
          payload = mockTasks;
        }
        else if (url.includes('/admin/tasks/') && url.includes('/approve') && method === 'post') {
          const taskId = parseInt(url.split('/admin/tasks/')[1].split('/')[0]);
          const task = mockTasks.find(t => t.id === taskId);
          if (task) task.status = 'APPROVED';
          payload = task;
          message = "Task approved!";
        }
        else if (url.includes('/admin/tasks/') && url.includes('/reject') && method === 'post') {
          const taskId = parseInt(url.split('/admin/tasks/')[1].split('/')[0]);
          const task = mockTasks.find(t => t.id === taskId);
          if (task) task.status = 'REJECTED';
          payload = task;
          message = "Task rejected!";
        }
        else if (url.includes('/admin/games') && url.includes('/reveal') && method === 'post') {
          isRevealed = true;
          payload = { success: true };
          message = "Final Reveal has been enabled!";
        }
        else if (url.includes('/admin/games') && url.includes('/start') && method === 'post') {
          payload = { success: true };
          message = "Game has been started!";
        }
        else {
           payload = {};
        }

        // STANDARD API RESPONSE FORMAT (from doc section 37)
        const responseData = {
          success: true,
          data: payload,
          message: message
        };

        resolve({
          data: responseData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {}
        });
      }, 500); // Network latency simulation
    });
  };
}

export default api;
