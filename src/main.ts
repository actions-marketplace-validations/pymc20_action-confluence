import * as core from '@actions/core';
import _ from 'lodash';
import {
  createPage,
  getChildrenByPage,
  getVersionAndContents,
  updatePage,
} from './api';

let title = '';
let title2: string;
let title3: string;
let title4: string;

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
    let notExistPage = true;
    for (const c of children) {
      title = c.title;
      title2 = c.childPageTitle;
      title3 = _.toString(c.title === childPageTitle);
      title4 = _.toString(_.isEqual(c.title, childPageTitle));
      if (c.title === childPageTitle) {
        const {version, prevContents} = await getVersionAndContents(c.id);
        await updatePage({
          pageId: c.id,
          version,
          prevContents,
          childPageTitle,
          contentsJson,
        });
        notExistPage = false;
      }
    }
    if (notExistPage)
      await createPage(parentPageId, childPageTitle, contentsJson, spaceKey);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
      core.debug(title);
      core.debug(title2);
      core.debug(title3);
      core.debug(title4);
    }
  }
}

run();
