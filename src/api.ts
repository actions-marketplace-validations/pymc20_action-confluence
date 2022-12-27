import axios from 'axios';
import _ from 'lodash';
import {makeContents} from './make';
import * as core from '@actions/core';

export async function getVersionAndContents(pageId: string) {
  const {JIRA_URL, JIRA_AUTH} = globalThis;
  const currentPage = await axios.get(
    `${JIRA_URL}/wiki/rest/api/content/${pageId}?expand=body.storage,version`,
    {
      headers: {
        Authorization: `Basic ${JIRA_AUTH}`,
      },
    }
  );
  const version = _.get(currentPage.data, 'version.number', '');
  const prevContents = _.get(currentPage.data, 'body.storage.value', '');
  return {
    version,
    prevContents,
  };
}

export async function updatePage({
  pageId,
  version,
  prevContents,
  childPageTitle,
  contentsJson,
}: {
  pageId: string;
  version: string;
  prevContents: string;
  childPageTitle: string;
  contentsJson: string;
}) {
  const {JIRA_URL, JIRA_AUTH} = globalThis;
  await axios.put(
    `${JIRA_URL}/wiki/rest/api/content/${pageId}`,
    {
      version: {
        number: _.toInteger(version) + 1,
      },
      title: childPageTitle,
      type: 'page',
      body: {
        storage: {
          value: `${makeContents(contentsJson, prevContents)}`,
          representation: 'storage',
        },
      },
    },
    {
      headers: {
        Authorization: `Basic ${JIRA_AUTH}`,
      },
    }
  );
}

export async function getChildrenByPage(pageId: string) {
  const {JIRA_URL, JIRA_AUTH} = globalThis;
  const page = await axios.get(
    `${JIRA_URL}/wiki/rest/api/content/${pageId}?expand=children.page`,
    {
      headers: {
        Authorization: `Basic ${JIRA_AUTH}`,
      },
    }
  );
  core.debug(`page: ${_.toString(page)}`);
  return _.get(page, 'children.page.results', []);
}

export async function createPage(
  pageId: string,
  title: string,
  contentsJson: string,
  spaceKey: string
) {
  const {JIRA_URL, JIRA_AUTH} = globalThis;
  await axios.post(
    `${JIRA_URL}/wiki/rest/api/content/`,
    {
      title,
      body: {
        storage: {
          value: makeContents(contentsJson, ''),
          representation: 'storage',
        },
      },
      type: 'page',
      space: {
        key: spaceKey,
      },
      ancestors: [
        {
          type: 'page',
          id: pageId,
        },
      ],
    },
    {
      headers: {
        Authorization: `Basic ${JIRA_AUTH}`,
      },
    }
  );
}
