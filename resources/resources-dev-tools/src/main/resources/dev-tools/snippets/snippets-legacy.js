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

import * as Workspace from '../workspace/workspace.js';

import * as SnippetsModule from './snippets.js';

self.Snippets = self.Snippets || {};
Snippets = Snippets || {};

Snippets.evaluateScriptSnippet = SnippetsModule.ScriptSnippetFileSystem.evaluateScriptSnippet;
Snippets.isSnippetsUISourceCode = SnippetsModule.ScriptSnippetFileSystem.isSnippetsUISourceCode;
Snippets.isSnippetsProject = SnippetsModule.ScriptSnippetFileSystem.isSnippetsProject;

Snippets.project = /** @type {!Workspace.Workspace.Project} */ (
    Workspace.Workspace.WorkspaceImpl.instance()
        .projectsForType(Workspace.Workspace.projectTypes.FileSystem)
        .find(project => Persistence.FileSystemWorkspaceBinding.fileSystemType(project) === 'snippets'));

/**
 * @constructor
 */
Snippets.SnippetsQuickOpen = SnippetsModule.SnippetsQuickOpen.SnippetsQuickOpen;
