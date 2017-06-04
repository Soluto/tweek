import React from 'react';
import favicon from '../../public/favicon.ico';

const { arrayOf, string, node, object } = React.PropTypes;
const shims = `
  (String.prototype.trim && Function.prototype.bind) || document.write('<script src="/es5-shim.js"><\\/script>');
  window.Promise || document.write('<script src="/Promise.js"><\\/script>');
  window.fetch || document.write('<script src="/fetch.js"><\\/script>');
  window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=t.forceSSL||"https:"===document.location.protocol,a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=(r?"https:":"http:")+"//cdn.heapanalytics.com/js/heap-"+e+".js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(a,n);for(var o=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","removeEventProperty","setEventProperties","track","unsetEventProperty"],c=0;c<p.length;c++)heap[p[c]]=o(p[c])};
      heap.load("715887490");
`;

const Document = React.createClass({
  propTypes: {
    styles: arrayOf(node),
    scripts: arrayOf(node),
    content: string,
    title: string,
    initialState: object,
  },

  render() {
    const { styles, scripts, content, title, initialState } = this.props;
    let storeScript = `window.STORE_INITIAL_STATE = ${JSON.stringify(initialState)}`;
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <link rel="shortcut icon" href={favicon} />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i"
          />
          <link rel="stylesheet" href="https://unpkg.com/rodal@1.4.1/lib/rodal.css" />
          <title>{title}</title>
          {styles}
        </head>
        <body>
          <div id="app" dangerouslySetInnerHTML={{ __html: content }} />
          <script dangerouslySetInnerHTML={{ __html: storeScript }} />
          <script dangerouslySetInnerHTML={{ __html: shims }} />
          {scripts}
        </body>
      </html>
    );
  },
});

export default Document;
