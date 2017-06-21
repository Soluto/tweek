import Rx from 'rxjs';

const messages$ = new Rx.Subject();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.onmessage = e => messages$.next(e.data);
}

export default messages$;
