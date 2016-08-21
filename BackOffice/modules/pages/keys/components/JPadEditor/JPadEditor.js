import React from 'react';
import Rule from './Rule/Rule';
import style from './JPadEditor.css';
import Chance from 'chance';
const isBrowser = typeof (window) === 'object';
const chance = new Chance();

function deleteCase(mutate, caseIndex) {
  if (confirm('Are you sure?')) {
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
                                &#xE908;
                            </button>
                            : null }
                        {i < cases.length - 1 ?
                            <button className={style['case-order-button']}
                              onClick={() => mutate.replaceKeys(i, i + 1) }
                              title="Move down"
                            >
                                &#xE902;
                            </button>
                            : null }
                        <button className={style['delete-case-button']}
                          onClick={() => deleteCase(mutate, i) }
                          title="Remove case"
                        ></button>
                    </div>

                    <Rule key={rule.Id} mutate={mutate.in(i) } rule={rule} />

                </div>
            )) }

        </div>
    )
        :
        (<div>Loading rule...</div>);
};
