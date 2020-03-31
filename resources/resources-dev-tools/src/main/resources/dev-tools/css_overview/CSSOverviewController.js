/*
 * Copyright (c) 2010-2020 SAP and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   SAP - initial API and implementation
 */
// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as Common from '../common/common.js';
import * as SDK from '../sdk/sdk.js';

/**
 * @unrestricted
 */
export class OverviewController extends Common.ObjectWrapper.ObjectWrapper {
  constructor() {
    super();

    this.currentUrl = SDK.SDKModel.TargetManager.instance().inspectedURL();
    SDK.SDKModel.TargetManager.instance().addEventListener(
        SDK.SDKModel.Events.InspectedURLChanged, this._checkUrlAndResetIfChanged, this);
  }

  _checkUrlAndResetIfChanged() {
    if (this.currentUrl === SDK.SDKModel.TargetManager.instance().inspectedURL()) {
      return;
    }

    this.currentUrl = SDK.SDKModel.TargetManager.instance().inspectedURL();
    this.dispatchEventToListeners(Events.Reset);
  }
}

export const Events = {
  RequestOverviewStart: Symbol('RequestOverviewStart'),
  RequestNodeHighlight: Symbol('RequestNodeHighlight'),
  PopulateNodes: Symbol('PopulateNodes'),
  RequestOverviewCancel: Symbol('RequestOverviewCancel'),
  OverviewCompleted: Symbol('OverviewCompleted'),
  Reset: Symbol('Reset'),
};
