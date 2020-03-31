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

import * as SecurityModule from './security.js';

self.Security = self.Security || {};
Security = Security || {};

/**
 * @constructor
 */
Security.SecurityModel = SecurityModule.SecurityModel.SecurityModel;

/** @enum {symbol} */
Security.SecurityModel.Events = SecurityModule.SecurityModel.Events;

/**
 * @constructor
 */
Security.PageVisibleSecurityState = SecurityModule.SecurityModel.PageVisibleSecurityState;

/**
 * @constructor
 */
Security.CertificateSecurityState = SecurityModule.SecurityModel.CertificateSecurityState;

/**
 * @constructor
 */
Security.SecurityStyleExplanation = SecurityModule.SecurityModel.SecurityStyleExplanation;

/**
 * @constructor
 */
Security.SecurityPanel = SecurityModule.SecurityPanel.SecurityPanel;

/**
 * @constructor
 */
Security.SecurityPanelSidebarTree = SecurityModule.SecurityPanel.SecurityPanelSidebarTree;

/** @enum {symbol} */
Security.SecurityPanelSidebarTree.OriginGroup = SecurityModule.SecurityPanel.OriginGroup;

/**
 * @constructor
 */
Security.SecurityPanelSidebarTreeElement = SecurityModule.SecurityPanel.SecurityPanelSidebarTreeElement;

/**
 * @constructor
 */
Security.SecurityOriginView = SecurityModule.SecurityPanel.SecurityOriginView;
