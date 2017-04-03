import axios from 'axios';
import generateToken from './generateToken';

export default async function({headers, ...config}) {
  const token = await generateToken();
  return axios.create({
    ...config,
    headers: {
      ...headers,
      'Authorization': token && `Bearer ${token}`
    }
  });
}
