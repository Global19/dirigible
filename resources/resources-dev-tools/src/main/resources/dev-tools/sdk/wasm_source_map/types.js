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

// There is way too much stuff Closure Compiler currently doesn't understand
// in JavaScript bindings auto-generated by wasm-bindgen, so we exclude them
// from compilation and redefine types manually here.

import {SourceMapEntry} from '../SourceMap.js'; // eslint-disable-line no-unused-vars

/**
 * @type {function((!RequestInfo | !BufferSource)): !Promise<*>}
 */
self.wasm_bindgen;

/** @interface */
// eslint-disable-next-line no-unused-vars
class Resolver {
  /**
   * @param {!Uint8Array} src
   */
  constructor(src) {
  }

  /**
   * @return {void}
   */
  free() {
  }

  /**
   * @return {!Array<string>}
   */
  listFiles() {
  }

  /**
   * @return {!Array<!SourceMapEntry>}
   */
  listMappings() {
  }

  /**
   * @param {number} addr
   * @return {?SourceMapEntry}
   */
  resolve(addr) {
  }

  /**
   * @param {string} file
   * @param {number} line
   * @param {number} column
   * @return {?SourceMapEntry}
   */
  resolveReverse(file, line, column) {
  }
}

/** @type {!Resolver} */
self.wasm_bindgen.Resolver;
