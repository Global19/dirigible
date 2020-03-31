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

import * as TimelineModelModule from './timeline_model.js';

self.TimelineModel = self.TimelineModel || {};
TimelineModel = TimelineModel || {};

/** @constructor */
TimelineModel.TimelineFrameModel = TimelineModelModule.TimelineFrameModel.TimelineFrameModel;

/** @constructor */
TimelineModel.TracingFrameLayerTree = TimelineModelModule.TimelineFrameModel.TracingFrameLayerTree;

/** @constructor */
TimelineModel.TimelineFrame = TimelineModelModule.TimelineFrameModel.TimelineFrame;

/** @constructor */
TimelineModel.LayerPaintEvent = TimelineModelModule.TimelineFrameModel.LayerPaintEvent;

/** @constructor */
TimelineModel.PendingFrame = TimelineModelModule.TimelineFrameModel.PendingFrame;

/** @constructor */
TimelineModel.TimelineIRModel = TimelineModelModule.TimelineIRModel.TimelineIRModel;

/** @enum {string} */
TimelineModel.TimelineIRModel.Phases = TimelineModelModule.TimelineIRModel.Phases;

/** @enum {string} */
TimelineModel.TimelineIRModel.InputEvents = TimelineModelModule.TimelineIRModel.InputEvents;

/** @constructor */
TimelineModel.TimelineJSProfileProcessor = TimelineModelModule.TimelineJSProfile.TimelineJSProfileProcessor;

/** @constructor */
TimelineModel.TimelineModel = TimelineModelModule.TimelineModel.TimelineModelImpl;

/** @constructor */
TimelineModel.TimelineModel.Track = TimelineModelModule.TimelineModel.Track;

/** @enum {symbol} */
TimelineModel.TimelineModel.TrackType = TimelineModelModule.TimelineModel.TrackType;

/** @enum {string} */
TimelineModel.TimelineModel.RecordType = TimelineModelModule.TimelineModel.RecordType;

/** @constructor */
TimelineModel.TimelineModel.PageFrame = TimelineModelModule.TimelineModel.PageFrame;

/** @constructor */
TimelineModel.TimelineModel.NetworkRequest = TimelineModelModule.TimelineModel.NetworkRequest;

/** @constructor */
TimelineModel.InvalidationTrackingEvent = TimelineModelModule.TimelineModel.InvalidationTrackingEvent;

/** @constructor */
TimelineModel.InvalidationTracker = TimelineModelModule.TimelineModel.InvalidationTracker;

/** @constructor */
TimelineModel.TimelineAsyncEventTracker = TimelineModelModule.TimelineModel.TimelineAsyncEventTracker;

/** @constructor */
TimelineModel.TimelineData = TimelineModelModule.TimelineModel.TimelineData;

/** @constructor */
TimelineModel.TimelineModelFilter = TimelineModelModule.TimelineModelFilter.TimelineModelFilter;

/** @constructor */
TimelineModel.TimelineVisibleEventsFilter = TimelineModelModule.TimelineModelFilter.TimelineVisibleEventsFilter;

/** @constructor */
TimelineModel.TimelineInvisibleEventsFilter = TimelineModelModule.TimelineModelFilter.TimelineInvisibleEventsFilter;

/** @constructor */
TimelineModel.ExclusiveNameFilter = TimelineModelModule.TimelineModelFilter.ExclusiveNameFilter;

TimelineModel.TimelineProfileTree = {};

/** @constructor */
TimelineModel.TimelineProfileTree.Node = TimelineModelModule.TimelineProfileTree.Node;

/** @constructor */
TimelineModel.TimelineProfileTree.TopDownNode = TimelineModelModule.TimelineProfileTree.TopDownNode;

/** @constructor */
TimelineModel.TimelineProfileTree.TopDownRootNode = TimelineModelModule.TimelineProfileTree.TopDownRootNode;

/** @constructor */
TimelineModel.TimelineProfileTree.BottomUpRootNode = TimelineModelModule.TimelineProfileTree.BottomUpRootNode;

/** @constructor */
TimelineModel.TimelineProfileTree.GroupNode = TimelineModelModule.TimelineProfileTree.GroupNode;

/** @constructor */
TimelineModel.TimelineProfileTree.BottomUpNode = TimelineModelModule.TimelineProfileTree.BottomUpNode;

TimelineModel.TimelineProfileTree.eventURL = TimelineModelModule.TimelineProfileTree.eventURL;
TimelineModel.TimelineProfileTree.eventStackFrame = TimelineModelModule.TimelineProfileTree.eventStackFrame;

/** @constructor */
TimelineModel.TracingLayerTree = TimelineModelModule.TracingLayerTree.TracingLayerTree;

/** @constructor */
TimelineModel.TracingLayer = TimelineModelModule.TracingLayerTree.TracingLayer;
