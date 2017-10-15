import s2w from './swaggerToWiremock';

it('parses minimal GET endpoint', () => {
  const swaggerSpec = {
    paths: {
      '/pet': {
        get: {
          responses: {
            '200': {
            }
          }
        }
      }
    }
  };

  const wiremockMapping = s2w(swaggerSpec, {
    path: '/pet',
    method: 'GET',
    response: {
      code: 200,
    }
  });

  const expected = {
    request : {
      method : 'GET',
      url : '/some/thing'
    },
    response : {
      status : 200
    }
  };

  expect(wiremockMapping).toEqual(expected);
});
