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
    throw new Error(error.error || 'Failed to fetch users');
  }

  return response.json();
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
