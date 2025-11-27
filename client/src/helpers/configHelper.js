export const NODE_ENV = import.meta.env.MODE || 'development';

export const getEnvironmentConfig = () => {
  if (NODE_ENV === 'production') {
    return {
      serverIP: 'production-domain.com',
      serverPort: '',
      fileBaseUrl: '/files',
      publicURL: '/images/',
    };
  }

  return {
    serverIP: 'localhost',
    serverPort: '3000',
    fileBaseUrl: 'http://localhost:3000/files',
    publicURL: 'http://localhost:3000/images/',
  };
};

export const buildUrl = (ip, port, path) => {
  if (NODE_ENV === 'production') {
    return `https://${ip}${path}`;
  }

  return `http://${ip}:${port}${path}`;
};
