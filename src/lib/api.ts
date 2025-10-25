import { CreateUserRequest, CreateTopicRequest, UpdateTopicRequest, User, Topic } from '@/types';

// User API calls
export async function createOrGetUser(data: CreateUserRequest): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create/get user');
  }

  return response.json();
}

// Topic API calls
export async function fetchTopics(): Promise<Topic[]> {
  const response = await fetch('/api/topics', {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    
    // If user not found (404), redirect to register
    if (response.status === 404) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      throw new Error('User not found');
    }
    
    throw new Error(error.error || 'Failed to fetch topics');
  }

  return response.json();
}

export async function createTopic(data: CreateTopicRequest): Promise<Topic> {
  const response = await fetch('/api/topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create topic');
  }

  return response.json();
}

export async function updateTopic(id: string, data: UpdateTopicRequest): Promise<Topic | { topic: Topic; user: User }> {
  const response = await fetch(`/api/topics/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update topic');
  }

  return response.json();
}

export async function deleteTopic(id: string): Promise<void> {
  const response = await fetch(`/api/topics/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete topic');
  }
}

// Fetch all users
export async function fetchAllUsers(): Promise<User[]> {
  const response = await fetch('/api/users/all', {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    
    // If user not found (404), clear session and redirect to register
    if (response.status === 404) {
      if (typeof window !== 'undefined') {
        // Clear session storage
        sessionStorage.removeItem('lean-coffee-user');
        sessionStorage.removeItem('lean-coffee-session');
        // Redirect to register
        window.location.href = '/';
      }
      throw new Error('User not found');
    }
    
    throw new Error(error.error || 'Failed to fetch users');
  }

  const users = await response.json();
  
  // Check if current user exists in the list
  if (typeof window !== 'undefined') {
    const currentUserStr = sessionStorage.getItem('lean-coffee-user');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        const userExists = users.some((u: User) => u.email === currentUser.email);
        
        // If current user doesn't exist in the list, they were deleted
        if (!userExists) {
          // Clear session storage
          sessionStorage.removeItem('lean-coffee-user');
          sessionStorage.removeItem('lean-coffee-session');
          // Redirect to register
          window.location.href = '/';
          throw new Error('Current user not found in users list');
        }
      } catch (error) {
        // If error parsing, clear and redirect
        if (error instanceof Error && error.message !== 'Current user not found in users list') {
          sessionStorage.removeItem('lean-coffee-user');
          sessionStorage.removeItem('lean-coffee-session');
          window.location.href = '/';
        }
        throw error;
      }
    }
  }

  return users;
}

// Delete user
export async function deleteUser(userId: string): Promise<void> {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user');
  }
}

// Fetch discussion history
export async function fetchDiscussionHistory(): Promise<Topic[]> {
  const response = await fetch('/api/topics/history', {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch history');
  }

  return response.json();
}
