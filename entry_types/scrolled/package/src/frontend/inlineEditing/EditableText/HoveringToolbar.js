import React, {useRef, useEffect} from 'react';
import {Editor, Range, Transforms} from 'slate';
import {ReactEditor, useSlate} from 'slate-react';

import {Toolbar} from '../Toolbar';
import {useI18n} from '../../i18n';
import {useSelectLinkDestination} from '../useSelectLinkDestination';

import styles from './index.module.css';

import BoldIcon from '../images/bold.svg';
import UnderlineIcon from '../images/underline.svg';
import ItalicIcon from '../images/italic.svg';
import StrikethroughIcon from '../images/strikethrough.svg';
import LinkIcon from '../images/link.svg';

export function HoveringToolbar() {
  const ref = useRef()
  const outerRef = useRef()
  const editor = useSlate()
  const {t} = useI18n({locale: 'ui'});
  const selectLinkDestination = useSelectLinkDestination();

  useEffect(() => {
    const el = ref.current
    const {selection} = editor

    if (!el || !outerRef.current) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.removeAttribute('style')
      return
    }

    const domRange = ReactEditor.toDOMRange(editor, editor.selection);
    const rect = domRange.getBoundingClientRect()
    const outerRect = outerRef.current.getBoundingClientRect()

    el.style.opacity = 1
    el.style.top = `${rect.bottom - outerRect.top + 10}px`
    el.style.left = `${rect.left - outerRect.left}px`
  })

  return (
    <div ref={outerRef}>
      <div ref={ref}
           className={styles.hoveringToolbar}>
        {renderToolbar(editor, t, selectLinkDestination)}
      </div>
    </div>
  );
}

function renderToolbar(editor, t, selectLinkDestination) {
  const buttons = [
    {
      name: 'bold',
      text: t('pageflow_scrolled.inline_editing.formats.bold'),
      icon: BoldIcon
    },
    {
      name: 'italic',
      text: t('pageflow_scrolled.inline_editing.formats.italic'),
      icon: ItalicIcon
    },
    {
      name: 'underline',
      text: t('pageflow_scrolled.inline_editing.formats.underline'),
      icon: UnderlineIcon
    },
    {
      name: 'strikethrough',
      text: t('pageflow_scrolled.inline_editing.formats.strikethrough'),
      icon: StrikethroughIcon
    },
    {
      name: 'link',
      text: isButtonActive(editor, 'link') ?
            t('pageflow_scrolled.inline_editing.remove_link') :
            t('pageflow_scrolled.inline_editing.insert_link'),
      icon: LinkIcon
    },
  ].map(button => ({...button, active: isButtonActive(editor, button.name)}));

  return (
    <Toolbar buttons={buttons}
             onButtonClick={name => handleButtonClick(editor, name, selectLinkDestination)}/>
  );
}

function handleButtonClick(editor, format, selectLinkDestination) {
  if (format === 'link') {
    if (isLinkActive(editor)) {
      unwrapLink(editor);
    }
    else {
      selectLinkDestination().then(({href, openInNewTab}) => {
        wrapLink(editor, href, openInNewTab);
      }, () => {});
    }
  }
  else {
    toggleMark(editor, format);
  }
}

function isButtonActive(editor, format) {
  if (format === 'link') {
    return isLinkActive(editor);
  }
  else {
    return isMarkActive(editor, format);
  }
}

function unwrapLink(editor) {
  Transforms.unwrapNodes(editor, {match: n => n.type === 'link'});
}

function wrapLink(editor, href, openInNewTab) {
  const link = {
    type: 'link',
    href,
    openInNewTab,
    children: [],
  };

  Transforms.wrapNodes(editor, link, {split: true});
  Transforms.collapse(editor, {edge: 'end'});
}

function isLinkActive(editor) {
  const [link] = Editor.nodes(editor, {match: n => n.type === 'link'});
  return !!link;
}

function toggleMark(editor, format) {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

function isMarkActive(editor, format) {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}
