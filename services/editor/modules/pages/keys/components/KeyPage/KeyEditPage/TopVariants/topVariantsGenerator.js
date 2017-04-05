import R from 'ramda';

const sortWithConverted = R.sortWith([
  R.descend(R.prop('converted')),
]);

export const generate = variants => {
  
  const variantsAsEntries = Object.entries(variants || {})
    .map(([variant, events]) => ({
      variant, 
      funnelStart: events.start || 0,
      funnelComplete: events.complete || 0
    }))
    .map(({variant, funnelStart, funnelComplete}) => ({
      variant, funnelStart, funnelComplete,
      percentage: funnelStart > 0 ? funnelComplete/funnelStart : undefined
    }));

  return R.take(3, sortWithConverted(variantsAsEntries));
};