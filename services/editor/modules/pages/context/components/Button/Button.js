import React from 'react';

import style from './button.css';

export default ({ text, onClick }) => {
  return <div className={style['context-button']} onClick={ onClick }>
    <p style={ style.text }>{ text }</p>
  </div>
}