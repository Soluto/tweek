import {mapPropsStream} from 'recompose';
import {getConfiguration} from '../../utils/fetch';
import Rx from 'rxjs';
const getSecurityPageIsEnabled = async () => {
	try {
		const response = await getConfiguration('security_page/is_enabled');

		return await response.json();
	} catch (e) {
		console.warn('Failed fetching security_page/is_enabled from Tweek', e);
		return false;
	}
}

export default (securityPageIsEnabledPropName) => 
	mapPropsStream(props$ => {
		const securityPageIsEnabled$ = props$
			.flatMap(() => {
				const futureValue = Rx.Observable.fromPromise(
					getSecurityPageIsEnabled().then(
						value => value,
						() => false,
					),
				);
				return Rx.Observable.of(futureValue);
			})
			.switch();
		return props$.combineLatest(securityPageIsEnabled$, (props, securityPageIsEnabled) => ({
			...props,
			[securityPageIsEnabledPropName]: securityPageIsEnabled,
		}))
	})