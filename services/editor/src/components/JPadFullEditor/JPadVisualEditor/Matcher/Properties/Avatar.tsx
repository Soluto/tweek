import classnames from 'classnames';
import React from 'react';
import { useIdentities } from '../../../../../contexts/Schema/Schemas';
import keyIcon from '../../../../../resources/key-icon.svg';

function getAvatarText(identity: string, identities: string[]) {
  const index = identities.indexOf(identity);
  if (index >= 0) {
    identities.splice(index, 1);
  }

  const lowerNames = identities.map((x) => x.toLowerCase());

  let i = 1;
  while (i < identity.length) {
    const result = identity.substring(0, i).toLowerCase();
    if (!lowerNames.some((n) => n.startsWith(result))) {
      if (result.length > 1) {
        return result.slice(0, 1).concat(result.slice(-1));
      } else {
        return result;
      }
    }
    i++;
  }
  return identity;
}

export type AvatarProps = {
  identity: string;
  className?: string;
};

const Avatar = ({ identity, className, ...props }: AvatarProps) => {
  const identities = useIdentities();

  return (
    <div className={classnames('avatar-container', className)} title={identity} {...props}>
      {identity === 'keys' ? <img src={keyIcon} alt={''} /> : getAvatarText(identity, identities)}
    </div>
  );
};

export default Avatar;
