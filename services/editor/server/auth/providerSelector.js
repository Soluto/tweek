const supportedAuthenticationSchemes = ['azuread', 'google', 'oauth2', 'httpDigest'];

const redirectHandler = (req, res) => res.redirect(req.query.redirectUrl || '/');

const selectAuthenticationProviders = (server, config) => {
  const authSchemesStr = config.get('TWEEK_AUTH_SCHEMES');
  const schemes = authSchemesStr ? authSchemesStr.split(',') : [];
  let goodSchemes = [];
  let badSchemes = [];

  schemes.forEach(scheme => {
    if (supportedAuthenticationSchemes.includes(scheme)) {
      const provider = require(`./${scheme}`);
      goodSchemes.push(provider(server, config, redirectHandler));
    } else {
      badSchemes.push(scheme);
    }
  });

  if (badSchemes.length !== 0) {
    throw new Error(`Unsupported authentication schemes ${badSchemes}`);
  }

  return goodSchemes;
};

export default selectAuthenticationProviders;
