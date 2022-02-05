/* eslint-disable prefer-const */
/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { Component } from 'react';

export default class Comments extends Component {
  componentDidMount() {
    let script = document.createElement('script');
    let anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');
    script.setAttribute('repo', 'FelipeBrenner/ignite-reactjs-desafios');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    anchor.appendChild(script);
  }

  render() {
    return <div id="inject-comments-for-uterances"></div>;
  }
}
