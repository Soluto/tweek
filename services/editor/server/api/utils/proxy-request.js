import authenticatedClient from '../../auth/authenticatedClient';
import { getAuthor } from './author';

export default function (proxyUrl) {
  return async function (req, res) {
    const client = await authenticatedClient({ baseURL: `${proxyUrl}/api` });

    const config = {
      url: req.originalUrl.replace(/^\/api|\?.*/g, ''),
      method: req.method.toUpperCase(),
      params: { ...getAuthor(req), ...req.query },
      data: req.body,
      validateStatus: () => true,
    };

    const result = await client.request(config);

    res.status(result.status).send(result.data || result.statusText);
  };
}
