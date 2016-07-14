import React from 'react';
import style from './KeyMetaEditor.css';



export default ({ meta, onMetaChangedCallback }) => (

    <div>
        <div>display name: {meta.displayName}</div>
        <div>description: {meta.description}</div>
        <div>
            tags: {meta.tags.map(tag =>
               (
                    <div key={tag}
                      className={style['meta-data-tag']}>
                        <div className={style['meta-data-tag-closing-button']}
                          title="Remove tag"
                          onClick={() => onMetaChangedCallback( removeTag(meta, tag) ) } >
                            x
                        </div>
                        <span className={style['meta-data-tag-name']}>{tag}</span>
                    </div>)
            ) }
        </div>
    </div>
);
