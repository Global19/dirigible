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

import * as BinaryResourceViewFactory from './BinaryResourceViewFactory.js';
import * as FontView from './FontView.js';
import * as ImageView from './ImageView.js';
import * as JSONView from './JSONView.js';
import * as PreviewFactory from './PreviewFactory.js';
import * as ResourceSourceFrame from './ResourceSourceFrame.js';
import * as SourceCodeDiff from './SourceCodeDiff.js';
import * as SourceFrame from './SourceFrame.js';
import * as SourcesTextEditor from './SourcesTextEditor.js';
import * as XMLView from './XMLView.js';

/**
 * @typedef {{
  *  editorToRawLocation: function(number, number=):!Array<number>,
  *  rawToEditorLocation: function(number, number=):!Array<number>
  * }}
  */
export let Transformer;

export {
  BinaryResourceViewFactory,
  FontView,
  ImageView,
  JSONView,
  PreviewFactory,
  ResourceSourceFrame,
  SourceCodeDiff,
  SourceFrame,
  SourcesTextEditor,
  XMLView,
};
