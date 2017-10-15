export default (swaggerSpec, options) => {
  return {
    request : {
      method : 'GET',
      url : '/some/thing'
    },
    response : {
      status : 200
    }
  };
};
