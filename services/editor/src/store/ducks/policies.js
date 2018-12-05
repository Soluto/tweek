import { withJsonData } from '../../utils/http';
import fetch from '../../utils/fetch';


export const getPolicies = () => fetch('/policies', {
	method: 'GET',
}).then(response => response.json());

export const putPolicies = (policies) => fetch('/policies', {
	method: 'PUT',
	...withJsonData(policies),
});