// Test script to verify backend API
const testBackend = async () => {
  const baseURL = 'http://localhost:5000/api/v1';
  
  // Test 1: Get available users endpoint
  try {
    const response = await fetch(`${baseURL}/chats/available-users`, {
      headers: {
        'Authorization': `Bearer YOUR_TOKEN_HERE`, // Replace with actual token
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Available users response:', await response.json());
  } catch (error) {
    console.error('Error testing available users:', error);
  }
  
  // Test 2: Get all doctors
  try {
    const response = await fetch(`${baseURL}/doctors`);
    const data = await response.json();
    console.log('All doctors:', data);
  } catch (error) {
    console.error('Error getting doctors:', error);
  }
  
  // Test 3: Get all users
  try {
    const response = await fetch(`${baseURL}/users`);
    const data = await response.json();
    console.log('All users:', data);
  } catch (error) {
    console.error('Error getting users:', error);
  }
};

// Run the test
testBackend();
