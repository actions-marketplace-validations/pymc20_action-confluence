import * as core from '@actions/core';
import _ from 'lodash';
import {parse} from 'node-html-parser';

function makeHtml(jsonString: JSON, prevContents: string) {
  let html = '';
  if (_.isEmpty(prevContents)) {
    Object.keys(jsonString).map((x: any) => {
      html += `<h1>${x}</h1>`;
      const val = _.get(jsonString, x, '');
      const splitVal = _.split(val, '\n');
      if (_.isArray(splitVal)) {
        splitVal.map(y => {
          html += `<p>${y}</p>`;
        });
      } else {
        html += `<p>${val}</p>`;
      }
    });
  } else {
    const parseHtml = parse(prevContents);
    const titleNodeList = parseHtml.querySelectorAll('h1');
    Object.keys(jsonString).map((x: any) => {
      const val = _.get(jsonString, x, '');
      const titleIdx = _.findIndex(titleNodeList, (n: any) => {
        const t = n.toString().replace(x, '');
        return '<h1></h1>' === t;
      });
      const splitVal = _.split(val, '\n');
      if (_.isArray(splitVal)) {
        splitVal.map(y => {
          html += `<p>${y}</p>`;
        });
      } else {
        html += `<p>${val}</p>`;
      }
      if (titleIdx + 1 <= titleNodeList.length) {
        titleNodeList[titleIdx + 1].insertAdjacentHTML('beforebegin', html);
        html = '';
      }
    });
    html = parseHtml.toString() + html;
  }
  return html;
}

export function makeContents(contentsJson: string, prevContents: string) {
  try {
    const jsonString = JSON.parse(contentsJson);
    let result = '';
    if (_.isArray(jsonString)) {
      return result;
    } else {
      result += makeHtml(jsonString, prevContents);
    }
    return result;
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
    return '';
  }
}
