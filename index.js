import React, { Component } from 'react';
import uuid from 'uuid/v1';

export default function preparePollingHOC(WrappedComponent) {
  return class PollingHOC extends Component {
    constructor(props) {
      super(props);
      this._livePolls = {};
      this.setUpPolling = this.setUpPolling.bind(this);
      this.removePolling = this.removePolling.bind(this);
      this.removeAll = this.removeAll.bind(this);
      this.setUpUniquePolling = this.setUpUniquePolling.bind(this);
    }

    setUpPolling(pollingFunction, pollingInterval) {
      return this.setUpUniquePolling(pollingFunction, pollingInterval);
    }

    setUpUniquePolling(pollingFunction, pollingInterval, uid = null) {
      if (!uid) {
        const uniqueN = uuid();
        const pollTimeoutFunction = setTimeout(() => {
          pollingFunction();
          this.setUpUniquePolling(pollingFunction, pollingInterval, uuid);
        }, pollingInterval);
        this._livePolls[uniqueN] = pollTimeoutFunction;
        return uniqueN;
      }
      const newPollTimeoutFunction = setTimeout(() => {
        pollingFunction();
        this.setUpUniquePolling(pollingFunction, pollingInterval, uid);
      }, pollingInterval);
      this._livePolls[uid] = newPollTimeoutFunction;
    }

    removePolling(uid) {
      if (this._livePolls[uid]) {
        clearTimeout(this._livePolls[uid]);
      }
    }

    removeAll() {
      Object.keys(this._livePolls).map(el => {
        if (this._livePolls[el]) {
          clearTimeout(this._livePolls[el]);
        }
        return null;
      });
      this._livePolls = {};
    }

    componentWillUnmount() {
      this.removeAll();
    }

    render() {
      const pollConfigOptions = {
        setUpPolling: this.setUpPolling,
        removePolling: this.removePolling,
        removeAllPolling: this.removeAll
      };

      return <WrappedComponent {...this.props} {...pollConfigOptions} />;
    }
  };
}
