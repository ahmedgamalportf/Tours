const allowRoles = require('./allowRoles');

describe('allowRoles', () => {
  test('rejects non-admin users', () => {
    const req = {
      user: {
        role: 'user',
      },
    };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status };
    const next = jest.fn();

    allowRoles('admin')(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'You are not allowed to access this resource',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
