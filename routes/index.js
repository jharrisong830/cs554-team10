import routes from './routes.js';

const configRoutes = (app) => {
  app.use('/', routes);
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route Not found' });
  });
};

export default configRoutes; 