import React from 'react';
import Rule from './Rule/Rule';
import style from './JPadEditor.css';
import Chance from 'chance';
const isBrowser = typeof (window) === 'object';
const chance = new Chance();

function deleteCase(mutate, caseIndex) {
  let isDeleteConfirmed = confirm('Are you sure?');

  if (isDeleteConfirmed) {
    mutate.in(caseIndex).delete();
  }
}

export default ({ cases, mutate }) => {
  if (!cases) return (<div/>);
  return isBrowser ? (
        <div className={style['case-container']}>

            <button className={style['add-case-button']} onClick={() =>
                mutate.prepend({ Id: chance.guid(), Matcher: {}, Value: '', Type: 'SingleVariant' })
            } >
                Add Case
            </button>

            {cases.map((rule, i) => (
                <div className={style['conditions-container']}
                  disabled
                  key={rule.Id}
                >

                    <div className={style['case-control-wrapper']} >
                        {i > 0 ?
                            <button className={style['case-order-button']}
                              onClick={() => mutate.replaceKeys(i, i - 1) }
                              title="Move up"
                            >
                                &#9650;
                            </button>
                            : null }
                        {i < cases.length - 1 ?
                            <button className={style['case-order-button']}
                              onClick={() => mutate.replaceKeys(i, i + 1) }
                              title="Move down"
                            >
                                &#9660;
                            </button>
                            : null }
                        <button className={style['delete-case-button']}
                          onClick={() => deleteCase(mutate, i) }
                          title="Remove case"
                        >x</button>
                    </div>

                    <Rule key={rule.Id} mutate={mutate.in(i) } rule={rule} />

                </div>
            )) }

        </div>
    )
        :
        (<div>Loading rule...</div>);
};
