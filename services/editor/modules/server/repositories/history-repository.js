import path from 'path';
import nodegit from 'nodegit';

const BasePathForRules = "rules";

export default class HistoryRepository {
  constructor(gitTransactionManager, settings) {
    this._gitTransactionManager = gitTransactionManager;
    this._settings = settings;
  }

  async getHistory() {
    return new Promise((resolve, reject) => {
      this._gitTransactionManager.read(async gitRepo => {
        const walker = gitRepo._repo.createRevWalk('master');
        walker.pushHead();
        const firstCommitOnMaster = await gitRepo._repo.getMasterCommit();
        const historyEmitter = firstCommitOnMaster.history(nodegit.Revwalk.SORT.Time);
        let commits = [];
        historyEmitter.on('commit', (commit) => {
          commits.push({ time: commit.date().toDateString(), message: commit.message(), sha: commit.sha() });
        });
        historyEmitter.on('end', () => {
          resolve(commits);
        });
        historyEmitter.on('error', (error) => {
          reject(error);
        });
        historyEmitter.start();
      })
    })
  }
}