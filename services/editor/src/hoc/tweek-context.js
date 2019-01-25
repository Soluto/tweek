import { createTweekContext } from 'react-tweek';
import { tweekRepository } from '../utils/tweekClients';

export const TweekContext = createTweekContext(tweekRepository);

TweekContext.prepare('@tweek/editor/_');

export const withTweekKeys = TweekContext.withTweekKeys;
