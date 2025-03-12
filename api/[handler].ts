import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush, { PushSubscription } from 'web-push';
import { Db, MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import { OAuth2Client } from 'google-auth-library';

const config = {
  MONGODB_CONNECTION: process.env.MONGODB_CONNECTION,
  VAPID_EMAIL: process.env.VAPID_EMAIL,
  VAPID_PUBLIC: process.env.VAPID_PUBLIC,
  VAPID_PRIVATE: process.env.VAPID_PRIVATE,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  limits: {
    alerts: 100,
    subscriptions: 100,
  }
};

interface Alert {
  id: string;
  title: string;
  severity: string;
  timestamp: number;
}

interface Subscription extends PushSubscription {
}

interface Route {
  name: string;
  method: 'GET' | 'POST';
  handler: (request: VercelRequest, response: VercelResponse) => Promise<void>;
}

const uri = config.MONGODB_CONNECTION;

/* NOTE: Expects a database created called "alerts-db" with collections "alerts" and "subscriptions" */
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

export const isAuthenticated = async (request: VercelRequest) => {
  try {
    const authHeader = Array.isArray(request.headers['Authorization']) ? request.headers['Authorization'][0] : request.headers['Authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      return false;
    }
    const [, token] = authHeader.split(' ');
    await googleClient.verifyIdToken({
      idToken: token,
      audience: config.GOOGLE_CLIENT_ID,
    });
    return true;
  } catch {
    return false;
  }
};

const notify = async (alert: Alert, existingDb?: Db) => {
  webpush.setVapidDetails(
    `mailto:${config.VAPID_EMAIL}`,
    config.VAPID_PUBLIC,
    config.VAPID_PRIVATE,
  );

  const db = existingDb ?? (await client.connect()).db('alerts-db');
  const collection = db.collection<Subscription>('subscriptions');
  const subscriptions = await collection
    .find({})
    .sort({ _id: 1 })
    .limit(config.limits.subscriptions)
    .toArray();

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(alert));
    } catch (error) {
      console.error('Error sending notifications', error);
      if (error.statusCode === 410) {
        try {
          await collection.deleteOne({ endpoint: subscription.endpoint });
          console.log('Deleted expired subscription:', subscription.endpoint);
        } catch (deleteError) {
          console.error('Error deleting expired subscription:', deleteError);
        }
      }
    }
  }
};

const routes: Route[] = [
  {
    name: 'alerts',
    method: 'GET',
    handler: async (request, response) => {
      try {
        await client.connect();
        const db = client.db('alerts-db');
        const collection = db.collection<Alert>('alerts');

        const afterId = request.query.afterId as string;
        const query = afterId ? { _id: { $gt: new ObjectId(afterId) } } : {};

        const alerts = (await collection
          .find(query)
          .sort({ _id: 1 })
          .limit(config.limits.alerts)
          .toArray())
          .map(({
            _id,
            ...alert
          }) => ({
            ...alert,
            id: _id
          }));

        response.status(200).json(alerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        response.status(500).json({ error: 'Failed to fetch alerts' });
      } finally {
        await client.close();
      }
    }
  },
  {
    name: 'alerts',
    method: 'POST',
    handler: async (request, response) => {
      if (!request.body.severity || !request.body.title) {
        response.status(400).json({ error: 'Failed to create alert, invalid body.' });
        return;
      }

      try {
        await client.connect();
        const db = client.db('alerts-db');
        const collection = db.collection<Omit<Alert, 'id'>>('alerts');

        const newAlert: Omit<Alert, 'id'> = {
          title: request.body.title,
          severity: request.body.severity,
          timestamp: Date.now(),
        };

        const result = await collection.insertOne(newAlert);

        const alert: Alert = {
          ...newAlert,
          id: result.insertedId as string,
        };
        await notify(alert, db);
        response.status(201).json(alert);
      } catch (error) {
        console.error('Error creating alert:', error);
        response.status(500).json({ error: 'Failed to create alert' });
      } finally {
        await client.close();
      }
    }
  },
  {
    name: 'register',
    method: 'POST',
    handler: async (request, response) => {
      const {
        endpoint,
        expirationTime,
        keys
      } = request.body;

      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        response.status(400).json({ error: 'Failed to register subscription, invalid body.' });
        return;
      }

      try {
        await client.connect();
        const db = client.db('alerts-db');
        const collection = db.collection<Subscription>('subscriptions');

        const subscription: Subscription = {
          endpoint: request.body.endpoint,
          expirationTime: request.body.expirationTime,
          keys: {
            p256dh: request.body.keys.p256dh,
            auth: request.body.keys.auth,
          }
        };

        const result = await collection.insertOne(subscription);

        response.status(201).json({
          id: result.insertedId,
        });
      } catch (error) {
        console.error('Error registering subscription:', error);
        response.status(500).json({ error: 'Failed to register subscription' });
      } finally {
        await client.close();
      }
    }
  },
  {
    name: 'reset',
    method: 'POST',
    handler: async (request, response) => {
      try {
        await client.connect();
        const db = client.db('alerts-db');
        await db.dropDatabase();

        await db.createCollection('alerts');
        await db.createCollection('subscriptions');

        response.status(200).json({ message: 'Database reset successfully.' });
      } catch (error) {
        console.error('Error resetting database:', error);
        response.status(500).json({ error: 'Failed to reset database.' });
      } finally {
        await client.close();
      }
    }
  },
];

export const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (
  request: VercelRequest,
  response: VercelResponse,
) => {
  const handlerName = request.query.handler;
  const route = routes.find(({
    name,
    method
  }) => name === handlerName && method === request.method);
  if (route) return route.handler(request, response);

  response.status(400).json({
    _debug: {
      body: request.body,
      query: request.query.handler,
      cookies: request.cookies,
      routeFound: Boolean(route),
      path: request.url,
      isAuthenticated: await isAuthenticated(request),
    },
  });
};

export default allowCors(handler);