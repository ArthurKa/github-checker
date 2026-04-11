import { Express } from 'express';
import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

register.registerMetric(httpRequestDuration);

export const mountMetrics = (app: Express) => {
  app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();

    res.on('finish', () => {
      end({
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode,
      });
    });

    next();
  });

  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
};
