import {
  Tapable,
  AsyncParallelHook,
  SyncHook
} from "tapable";
import React from "react";
import { renderRoutes } from "react-router-config";
import { BrowserRouter } from "react-router-dom";
import { render, hydrate } from "react-dom";

export default class ClientService extends Tapable {

  constructor(options) {
    super();
    this.hooks = {
      "clientLocationChange": new AsyncParallelHook(["page", "title", "location"]),
      "clientBeforeRender": new AsyncParallelHook(),
      "clientRenderComplete": new SyncHook(),
    };
    this.options = options;
  }

  run({ routerService }) {
    const {env} = this.options;
    const root = _.get(env, "clientRootElementId", "app");

    if (!document.getElementById(root)) {
      // eslint-disable-next-line
      console.warn(`#${root} element not found in html. thus cannot proceed further`);
    }
    const domRootReference = document.getElementById(root);
    const renderer = env.serverSideRender ? hydrate: render;

    this.hooks.clientBeforeRender.callAsync(() => {
      // Render according to routes!
      renderer(
        <BrowserRouter>
          {renderRoutes(routerService.getRoutes())}
        </BrowserRouter>,
        domRootReference,
        () => {
          this.hooks.clientRenderComplete.call();
        }
      );
    });
  }
}