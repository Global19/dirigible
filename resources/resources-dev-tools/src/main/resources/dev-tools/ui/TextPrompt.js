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
import * as Common from '../common/common.js';

import * as ARIAUtils from './ARIAUtils.js';
import {SuggestBox, SuggestBoxDelegate, Suggestion, Suggestions} from './SuggestBox.js';  // eslint-disable-line no-unused-vars
import {ElementFocusRestorer} from './UIUtils.js';
import {appendStyle} from './utils/append-style.js';

/**
 * @implements {SuggestBoxDelegate}
 * @unrestricted
 */
export class TextPrompt extends Common.ObjectWrapper.ObjectWrapper {
  constructor() {
    super();
    /**
     * @type {!Element|undefined}
     */
    this._proxyElement;
    this._proxyElementDisplay = 'inline-block';
    this._autocompletionTimeout = DefaultAutocompletionTimeout;
    this._title = '';
    this._queryRange = null;
    this._previousText = '';
    this._currentSuggestion = null;
    this._completionRequestId = 0;
    this._ghostTextElement = createElementWithClass('span', 'auto-complete-text');
    this._ghostTextElement.setAttribute('contenteditable', 'false');
    ARIAUtils.markAsHidden(this._ghostTextElement);
  }

  /**
   * @param {(function(this:null, string, string, boolean=):!Promise<!Suggestions>)} completions
   * @param {string=} stopCharacters
   */
  initialize(completions, stopCharacters) {
    this._loadCompletions = completions;
    this._completionStopCharacters = stopCharacters || ' =:[({;,!+-*/&|^<>.';
  }

  /**
   * @param {number} timeout
   */
  setAutocompletionTimeout(timeout) {
    this._autocompletionTimeout = timeout;
  }

  renderAsBlock() {
    this._proxyElementDisplay = 'block';
  }

  /**
   * Clients should never attach any event listeners to the |element|. Instead,
   * they should use the result of this method to attach listeners for bubbling events.
   *
   * @param {!Element} element
   * @return {!Element}
   */
  attach(element) {
    return this._attachInternal(element);
  }

  /**
   * Clients should never attach any event listeners to the |element|. Instead,
   * they should use the result of this method to attach listeners for bubbling events
   * or the |blurListener| parameter to register a "blur" event listener on the |element|
   * (since the "blur" event does not bubble.)
   *
   * @param {!Element} element
   * @param {function(!Event)} blurListener
   * @return {!Element}
   */
  attachAndStartEditing(element, blurListener) {
    const proxyElement = this._attachInternal(element);
    this._startEditing(blurListener);
    return proxyElement;
  }

  /**
   * @param {!Element} element
   * @return {!Element}
   */
  _attachInternal(element) {
    if (this._proxyElement) {
      throw 'Cannot attach an attached TextPrompt';
    }
    this._element = element;

    this._boundOnKeyDown = this.onKeyDown.bind(this);
    this._boundOnInput = this.onInput.bind(this);
    this._boundOnMouseWheel = this.onMouseWheel.bind(this);
    this._boundClearAutocomplete = this.clearAutocomplete.bind(this);
    this._proxyElement = element.ownerDocument.createElement('span');
    appendStyle(this._proxyElement, 'ui/textPrompt.css');
    this._contentElement = this._proxyElement.createChild('div', 'text-prompt-root');
    this._proxyElement.style.display = this._proxyElementDisplay;
    element.parentElement.insertBefore(this._proxyElement, element);
    this._contentElement.appendChild(element);
    this._element.classList.add('text-prompt');
    ARIAUtils.markAsTextBox(this._element);
    this._element.setAttribute('contenteditable', 'plaintext-only');
    this._element.addEventListener('keydown', this._boundOnKeyDown, false);
    this._element.addEventListener('input', this._boundOnInput, false);
    this._element.addEventListener('mousewheel', this._boundOnMouseWheel, false);
    this._element.addEventListener('selectstart', this._boundClearAutocomplete, false);
    this._element.addEventListener('blur', this._boundClearAutocomplete, false);

    this._suggestBox = new SuggestBox(this, 20);

    if (this._title) {
      this._proxyElement.title = this._title;
    }

    return this._proxyElement;
  }

  detach() {
    this._removeFromElement();
    this._focusRestorer.restore();
    this._proxyElement.parentElement.insertBefore(this._element, this._proxyElement);
    this._proxyElement.remove();
    delete this._proxyElement;
    this._element.classList.remove('text-prompt');
    this._element.removeAttribute('contenteditable');
    this._element.removeAttribute('role');
  }

  /**
   * @return {string}
   */
  textWithCurrentSuggestion() {
    const text = this.text();
    if (!this._queryRange || !this._currentSuggestion) {
      return text;
    }
    const suggestion = this._currentSuggestion.text;
    return text.substring(0, this._queryRange.startColumn) + suggestion + text.substring(this._queryRange.endColumn);
  }

  /**
   * @return {string}
   */
  text() {
    let text = this._element.textContent;
    if (this._ghostTextElement.parentNode) {
      const addition = this._ghostTextElement.textContent;
      text = text.substring(0, text.length - addition.length);
    }
    return text;
  }

  /**
   * @param {string} text
   */
  setText(text) {
    this.clearAutocomplete();
    this._element.textContent = text;
    this._previousText = this.text();
    if (this._element.hasFocus()) {
      this.moveCaretToEndOfPrompt();
      this._element.scrollIntoView();
    }
  }

  focus() {
    this._element.focus();
  }

  /**
   * @return {string}
   */
  title() {
    return this._title;
  }

  /**
   * @param {string} title
   */
  setTitle(title) {
    this._title = title;
    if (this._proxyElement) {
      this._proxyElement.title = title;
    }
  }

  /**
   * @param {string} placeholder
   * @param {string=} ariaPlaceholder
   */
  setPlaceholder(placeholder, ariaPlaceholder) {
    if (placeholder) {
      this._element.setAttribute('data-placeholder', placeholder);
      // TODO(https://github.com/nvaccess/nvda/issues/10164): Remove ariaPlaceholder once the NVDA bug is fixed
      // ariaPlaceholder and placeholder may differ, like in case the placeholder contains a '?'
      ARIAUtils.setPlaceholder(this._element, ariaPlaceholder || placeholder);
    } else {
      this._element.removeAttribute('data-placeholder');
      ARIAUtils.setPlaceholder(this._element, null);
    }
  }

  /**
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    if (enabled) {
      this._element.setAttribute('contenteditable', 'plaintext-only');
    } else {
      this._element.removeAttribute('contenteditable');
    }
    this._element.classList.toggle('disabled', !enabled);
  }

  _removeFromElement() {
    this.clearAutocomplete();
    this._element.removeEventListener('keydown', this._boundOnKeyDown, false);
    this._element.removeEventListener('input', this._boundOnInput, false);
    this._element.removeEventListener('selectstart', this._boundClearAutocomplete, false);
    this._element.removeEventListener('blur', this._boundClearAutocomplete, false);
    if (this._isEditing) {
      this._stopEditing();
    }
    if (this._suggestBox) {
      this._suggestBox.hide();
    }
  }

  /**
   * @param {function(!Event)=} blurListener
   */
  _startEditing(blurListener) {
    this._isEditing = true;
    this._contentElement.classList.add('text-prompt-editing');
    if (blurListener) {
      this._blurListener = blurListener;
      this._element.addEventListener('blur', this._blurListener, false);
    }
    this._oldTabIndex = this._element.tabIndex;
    if (this._element.tabIndex < 0) {
      this._element.tabIndex = 0;
    }
    this._focusRestorer = new ElementFocusRestorer(this._element);
    if (!this.text()) {
      this.autoCompleteSoon();
    }
  }

  _stopEditing() {
    this._element.tabIndex = this._oldTabIndex;
    if (this._blurListener) {
      this._element.removeEventListener('blur', this._blurListener, false);
    }
    this._contentElement.classList.remove('text-prompt-editing');
    delete this._isEditing;
  }

  /**
   * @param {!Event} event
   */
  onMouseWheel(event) {
    // Subclasses can implement.
  }

  /**
   * @param {!Event} event
   */
  onKeyDown(event) {
    let handled = false;
    if (this.isSuggestBoxVisible() && this._suggestBox.keyPressed(event)) {
      event.consume(true);
      return;
    }

    switch (event.key) {
      case 'Tab':
        handled = this.tabKeyPressed(event);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
      case 'Home':
        this.clearAutocomplete();
        break;
      case 'PageDown':
      case 'ArrowRight':
      case 'ArrowDown':
      case 'End':
        if (this._isCaretAtEndOfPrompt()) {
          handled = this.acceptAutoComplete();
        } else {
          this.clearAutocomplete();
        }
        break;
      case 'Escape':
        if (this.isSuggestBoxVisible()) {
          this.clearAutocomplete();
          handled = true;
        }
        break;
      case ' ':  // Space
        if (event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
          this.autoCompleteSoon(true);
          handled = true;
        }
        break;
    }

    if (isEnterKey(event)) {
      event.preventDefault();
    }

    if (handled) {
      event.consume(true);
    }
  }

  /**
   * @param {string} key
   * @return {boolean}
   */
  _acceptSuggestionOnStopCharacters(key) {
    if (!this._currentSuggestion || !this._queryRange || key.length !== 1 ||
        !this._completionStopCharacters.includes(key)) {
      return false;
    }

    const query = this.text().substring(this._queryRange.startColumn, this._queryRange.endColumn);
    if (query && this._currentSuggestion.text.startsWith(query + key)) {
      this._queryRange.endColumn += 1;
      return this.acceptAutoComplete();
    }
    return false;
  }

  /**
   * @param {!Event} event
   */
  onInput(event) {
    const text = this.text();
    if (event.data && !this._acceptSuggestionOnStopCharacters(event.data)) {
      const hasCommonPrefix = text.startsWith(this._previousText) || this._previousText.startsWith(text);
      if (this._queryRange && hasCommonPrefix) {
        this._queryRange.endColumn += text.length - this._previousText.length;
      }
    }
    this._refreshGhostText();
    this._previousText = text;
    this.dispatchEventToListeners(Events.TextChanged);

    this.autoCompleteSoon();
  }

  /**
   * @return {boolean}
   */
  acceptAutoComplete() {
    let result = false;
    if (this.isSuggestBoxVisible()) {
      result = this._suggestBox.acceptSuggestion();
    }
    if (!result) {
      result = this._acceptSuggestionInternal();
    }

    return result;
  }

  clearAutocomplete() {
    const beforeText = this.textWithCurrentSuggestion();

    if (this.isSuggestBoxVisible()) {
      this._suggestBox.hide();
    }
    this._clearAutocompleteTimeout();
    this._queryRange = null;
    this._refreshGhostText();

    if (beforeText !== this.textWithCurrentSuggestion()) {
      this.dispatchEventToListeners(Events.TextChanged);
    }
  }

  _refreshGhostText() {
    if (this._currentSuggestion && this._currentSuggestion.hideGhostText) {
      this._ghostTextElement.remove();
      return;
    }
    if (this._queryRange && this._currentSuggestion && this._isCaretAtEndOfPrompt() &&
        this._currentSuggestion.text.startsWith(this.text().substring(this._queryRange.startColumn))) {
      this._ghostTextElement.textContent =
          this._currentSuggestion.text.substring(this._queryRange.endColumn - this._queryRange.startColumn);
      this._element.appendChild(this._ghostTextElement);
    } else {
      this._ghostTextElement.remove();
    }
  }

  _clearAutocompleteTimeout() {
    if (this._completeTimeout) {
      clearTimeout(this._completeTimeout);
      delete this._completeTimeout;
    }
    this._completionRequestId++;
  }

  /**
   * @param {boolean=} force
   */
  autoCompleteSoon(force) {
    const immediately = this.isSuggestBoxVisible() || force;
    if (!this._completeTimeout) {
      this._completeTimeout =
          setTimeout(this.complete.bind(this, force), immediately ? 0 : this._autocompletionTimeout);
    }
  }

  /**
   * @param {boolean=} force
   */
  async complete(force) {
    this._clearAutocompleteTimeout();
    const selection = this._element.getComponentSelection();
    const selectionRange = selection && selection.rangeCount ? selection.getRangeAt(0) : null;
    if (!selectionRange) {
      return;
    }

    let shouldExit;

    if (!force && !this._isCaretAtEndOfPrompt() && !this.isSuggestBoxVisible()) {
      shouldExit = true;
    } else if (!selection.isCollapsed) {
      shouldExit = true;
    }

    if (shouldExit) {
      this.clearAutocomplete();
      return;
    }

    const wordQueryRange = selectionRange.startContainer.rangeOfWord(
        selectionRange.startOffset, this._completionStopCharacters, this._element, 'backward');

    const expressionRange = wordQueryRange.cloneRange();
    expressionRange.collapse(true);
    expressionRange.setStartBefore(this._element);
    const completionRequestId = ++this._completionRequestId;
    const completions = await this._loadCompletions(expressionRange.toString(), wordQueryRange.toString(), !!force);
    this._completionsReady(completionRequestId, selection, wordQueryRange, !!force, completions);
  }

  disableDefaultSuggestionForEmptyInput() {
    this._disableDefaultSuggestionForEmptyInput = true;
  }

  /**
   * @param {!Selection} selection
   * @param {!Range} textRange
   */
  _boxForAnchorAtStart(selection, textRange) {
    const rangeCopy = selection.getRangeAt(0).cloneRange();
    const anchorElement = createElement('span');
    anchorElement.textContent = '\u200B';
    textRange.insertNode(anchorElement);
    const box = anchorElement.boxInWindow(window);
    anchorElement.remove();
    selection.removeAllRanges();
    selection.addRange(rangeCopy);
    return box;
  }

  /**
   * @return {?Range}
   * @suppressGlobalPropertiesCheck
   */
  _createRange() {
    return document.createRange();
  }

  /**
   * @param {string} query
   * @return {!Suggestions}
   */
  additionalCompletions(query) {
    return [];
  }

  /**
   * @param {number} completionRequestId
   * @param {!Selection} selection
   * @param {!Range} originalWordQueryRange
   * @param {boolean} force
   * @param {!Suggestions} completions
   */
  _completionsReady(completionRequestId, selection, originalWordQueryRange, force, completions) {
    if (this._completionRequestId !== completionRequestId) {
      return;
    }

    const query = originalWordQueryRange.toString();

    // Filter out dupes.
    const store = new Set();
    completions = completions.filter(item => !store.has(item.text) && !!store.add(item.text));

    if (query || force) {
      if (query) {
        completions = completions.concat(this.additionalCompletions(query));
      } else {
        completions = this.additionalCompletions(query).concat(completions);
      }
    }

    if (!completions.length) {
      this.clearAutocomplete();
      return;
    }

    const selectionRange = selection.getRangeAt(0);

    const fullWordRange = this._createRange();
    fullWordRange.setStart(originalWordQueryRange.startContainer, originalWordQueryRange.startOffset);
    fullWordRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);

    if (query + selectionRange.toString() !== fullWordRange.toString()) {
      return;
    }

    const beforeRange = this._createRange();
    beforeRange.setStart(this._element, 0);
    beforeRange.setEnd(fullWordRange.startContainer, fullWordRange.startOffset);
    this._queryRange = new TextUtils.TextRange(
        0, beforeRange.toString().length, 0, beforeRange.toString().length + fullWordRange.toString().length);

    const shouldSelect = !this._disableDefaultSuggestionForEmptyInput || !!this.text();
    if (this._suggestBox) {
      this._suggestBox.updateSuggestions(
          this._boxForAnchorAtStart(selection, fullWordRange), completions, shouldSelect, !this._isCaretAtEndOfPrompt(),
          this.text());
    }
  }

  /**
   * @override
   * @param {?Suggestion} suggestion
   * @param {boolean=} isIntermediateSuggestion
   */
  applySuggestion(suggestion, isIntermediateSuggestion) {
    this._currentSuggestion = suggestion;
    this._refreshGhostText();
    if (isIntermediateSuggestion) {
      this.dispatchEventToListeners(Events.TextChanged);
    }
  }

  /**
   * @override
   */
  acceptSuggestion() {
    this._acceptSuggestionInternal();
  }

  /**
   * @return {boolean}
   */
  _acceptSuggestionInternal() {
    if (!this._queryRange) {
      return false;
    }

    const suggestionLength = this._currentSuggestion ? this._currentSuggestion.text.length : 0;
    const selectionRange = this._currentSuggestion ? this._currentSuggestion.selectionRange : null;
    const endColumn = selectionRange ? selectionRange.endColumn : suggestionLength;
    const startColumn = selectionRange ? selectionRange.startColumn : suggestionLength;
    this._element.textContent = this.textWithCurrentSuggestion();
    this.setDOMSelection(this._queryRange.startColumn + startColumn, this._queryRange.startColumn + endColumn);

    this.clearAutocomplete();
    this.dispatchEventToListeners(Events.TextChanged);

    return true;
  }

  /**
   * @param {number} startColumn
   * @param {number} endColumn
   */
  setDOMSelection(startColumn, endColumn) {
    this._element.normalize();
    const node = this._element.childNodes[0];
    if (!node || node === this._ghostTextElement) {
      return;
    }
    const range = this._createRange();
    range.setStart(node, startColumn);
    range.setEnd(node, endColumn);
    const selection = this._element.getComponentSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * @protected
   * @return {boolean}
   */
  isSuggestBoxVisible() {
    return this._suggestBox && this._suggestBox.visible();
  }

  /**
   * @return {boolean}
   */
  isCaretInsidePrompt() {
    const selection = this._element.getComponentSelection();
    // @see crbug.com/602541
    const selectionRange = selection && selection.rangeCount ? selection.getRangeAt(0) : null;
    if (!selectionRange || !selection.isCollapsed) {
      return false;
    }
    return selectionRange.startContainer.isSelfOrDescendant(this._element);
  }

  /**
   * @return {boolean}
   */
  _isCaretAtEndOfPrompt() {
    const selection = this._element.getComponentSelection();
    const selectionRange = selection && selection.rangeCount ? selection.getRangeAt(0) : null;
    if (!selectionRange || !selection.isCollapsed) {
      return false;
    }

    let node = selectionRange.startContainer;
    if (!node.isSelfOrDescendant(this._element)) {
      return false;
    }

    if (this._ghostTextElement.isAncestor(node)) {
      return true;
    }

    if (node.nodeType === Node.TEXT_NODE && selectionRange.startOffset < node.nodeValue.length) {
      return false;
    }

    let foundNextText = false;
    while (node) {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue.length) {
        if (foundNextText && !this._ghostTextElement.isAncestor(node)) {
          return false;
        }
        foundNextText = true;
      }

      node = node.traverseNextNode(this._element);
    }

    return true;
  }

  moveCaretToEndOfPrompt() {
    const selection = this._element.getComponentSelection();
    const selectionRange = this._createRange();

    let container = this._element;
    while (container.childNodes.length) {
      container = container.lastChild;
    }
    const offset = container.nodeType === Node.TEXT_NODE ? container.textContent.length : 0;
    selectionRange.setStart(container, offset);
    selectionRange.setEnd(container, offset);

    selection.removeAllRanges();
    selection.addRange(selectionRange);
  }

  /**
   * @param {!Event} event
   * @return {boolean}
   */
  tabKeyPressed(event) {
    return this.acceptAutoComplete();
  }

  /**
   * @return {?Element}
   */
  proxyElementForTests() {
    return this._proxyElement || null;
  }
}

const DefaultAutocompletionTimeout = 250;

/** @enum {symbol} */
export const Events = {
  TextChanged: Symbol('TextChanged')
};
