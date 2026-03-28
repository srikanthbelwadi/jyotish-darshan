import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MockDashboard } from './src/components/tabs/MockDashboard.jsx';

try {
  const html = ReactDOMServer.renderToString(React.createElement(MockDashboard, { onOpenJyotishDesk: () => {} }));
  console.log("SUCCESS, HTML LENGTH:", html.length);
} catch (e) {
  console.error("REACT RENDER CRASH:", e);
}
