import PusherJS from 'pusher-js';

// Get Pusher credentials from environment variables
// Note: In production, use NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER
// For now, we'll use PUSHER_KEY and PUSHER_CLUSTER if NEXT_PUBLIC versions are not available
const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY;
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER;

if (!pusherKey) {
  throw new Error('Pusher key is not configured. Please set NEXT_PUBLIC_PUSHER_KEY or PUSHER_KEY in your environment variables.');
}

if (!pusherCluster) {
  throw new Error('Pusher cluster is not configured. Please set NEXT_PUBLIC_PUSHER_CLUSTER or PUSHER_CLUSTER in your environment variables.');
}

const pusherClient = new PusherJS(pusherKey, {
  cluster: pusherCluster,
  forceTLS: true,
});

export default pusherClient;
