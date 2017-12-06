const supportedAuthenticationSchemes = ['azuread', 'google', 'oauth2', 'httpDigest'];

const selectAuthenticationProviders = function (server, config) {
  const authSchemesStr = config.get('TWEEK_AUTH_SCHEMES');
  const schemes = authSchemesStr ? authSchemesStr.split(',') : [];
  let goodSchemes = [];
  let badSchemes = [];

  schemes.forEach((scheme) => {
    if (supportedAuthenticationSchemes.includes(scheme)) {
      const provider = require(`./${scheme}`);
      goodSchemes.push(provider(server, config));
    } else {
      badSchemes.push(scheme);
    }
  });

  if (badSchemes.length !== 0) {
    throw new Error(`Unsupported authentication schemes ${badSchemes}`);
  }

  return goodSchemes;
};

module.exports.selectAuthenticationProviders = selectAuthenticationProviders;
