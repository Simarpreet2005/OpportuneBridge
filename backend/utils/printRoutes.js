const printRoutes = (app) => {
  const routes = [];
  
  const printPaths = (path, layer) => {
    if (layer.route) {
      layer.route.stack.forEach((route) => {
        routes.push({
          method: route.method ? route.method.toUpperCase() : 'ALL',
          path: path + layer.route.path
        });
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      layer.handle.stack.forEach((stackItem) => {
        let routePath = layer.regexp.source
          .replace('^', '')
          .replace('\\/?(?=\\/|$)', '')
          .replace(/(?:\(\?:\(\[\^\\\/]\+\?\)\))/, '')
          .replace(/\\\//g, '/');
        
        // Very basic cleanup of regex path representation
        if (routePath.endsWith('/?')) routePath = routePath.slice(0, -2);
        if (routePath === '/') routePath = '';
        
        printPaths(path + routePath, stackItem);
      });
    }
  };

  app._router.stack.forEach((layer) => {
    printPaths('', layer);
  });

  console.log("================ REGISTERED ROUTES ================");
  routes.forEach(r => console.log(`${r.method}\t${r.path}`));
  console.log("===================================================");
};

export default printRoutes;
