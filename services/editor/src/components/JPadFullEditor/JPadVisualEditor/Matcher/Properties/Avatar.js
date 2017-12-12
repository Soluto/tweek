import React from 'react';
import classnames from 'classnames';
import * as ContextService from '../../../../../services/context-service';
import keyIcon from '../../../../../resources/key-icon.svg';

function getAvatarText(identity) {
  const identities = ContextService.getIdentities();
  const index = identities.indexOf(identity);
  if (index >= 0) {
    identities.splice(index, 1);
  }

  const lowerNames = identities.map(x => x.toLowerCase());

  let i = 1;
  while (i < identity.length) {
    const result = identity.substring(0, i).toLowerCase();
    if (!lowerNames.some(n => n.startsWith(result))) return result;
    i++;
  }
  return identity;
}

const Avatar = ({ identity, className, ...props }) =>
  <div className={classnames('avatar-container', className)} {...props}>
    {identity === 'keys' ? <img src={keyIcon} alt={''} /> : getAvatarText(identity)}
  </div>;

export default Avatar;
