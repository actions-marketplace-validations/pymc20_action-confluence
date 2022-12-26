import * as core from '@actions/core';
import _ from 'lodash';
import {
  createPage,
  getChildrenByPage,
  getVersionAndContents,
  updatePage,
} from './api';

async function run(): Promise<void> {
  try {
    const parentPageId = core.getInput('parentPageId');
    const childPageTitle = core.getInput('childPageTitle');
    const contentsJson = core.getInput('contentsJson');
    const spaceKey = core.getInput('spaceKey');
    globalThis.JIRA_URL = process.env.JIRA_URL || '';
    globalThis.JIRA_AUTH = process.env.JIRA_AUTH || '';
    const {JIRA_URL, JIRA_AUTH} = globalThis;
    core.debug(`parentPageId: ${parentPageId}`);
    core.debug(`childPageTitle: ${childPageTitle}`);
    core.debug(`contentsJson: ${contentsJson}`);
    core.debug(`spaceKey: ${spaceKey}`);
    core.debug(`jiraAuth: ${JIRA_AUTH}`);
    core.debug(`jiraUrl: ${JIRA_URL}`);
    if (
      _.isEmpty(parentPageId) ||
      _.isEmpty(JIRA_AUTH) ||
      _.isEmpty(JIRA_URL)
    ) {
      console.log('Check Value');
      console.log(`pageId: ${parentPageId}`);
      console.log(`jiraUrl: ${JIRA_URL}`);
      console.log(`jiraAuth: ${JIRA_AUTH}`);
      return;
    }
    const children = await getChildrenByPage(parentPageId);
    for (const c of children) {
      if (c.title === childPageTitle) {
        const {version, prevContents} = await getVersionAndContents(c.id);
        await updatePage({
          pageId: c.id,
          version,
          prevContents,
          childPageTitle,
          contentsJson,
        });
      } else {
        await createPage(parentPageId, childPageTitle, contentsJson, spaceKey);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
