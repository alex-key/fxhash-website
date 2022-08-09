import { Range, Editor  } from 'slate';
import { BlockTypeChange } from './BlockTypeChange'
import { InlineTypeChange } from './InlineTypeChange'
import { CustomDirectiveChange } from './CustomDirectiveChange'
import { LinkChange } from './LinkChange'

export type AutoFormatChangeType = "BlockTypeChange" | "InlineTypeChange" | "CustomDirectiveChange" | "LinkChange";
export type ChangeData = {[key: string]: number | string | boolean}

export type AutoFormatChange = {
  shortcut: string | string[]
  type: AutoFormatChangeType
  data?: ChangeData
  apply: (editor: Editor, text: string) => boolean,
}

function createChangeTypeHeading():AutoFormatChange[] {
  const changes = [];
  for (let i = 1; i <= 6; i++) {
    changes.push(new BlockTypeChange(
      Array(i).fill('#').join(''),
      {
        type: 'heading',
        depth: i,
      }
    ));
  }
  return changes;
}

const config: AutoFormatChange[] = [
  ...createChangeTypeHeading(),
  new BlockTypeChange('p',   {type: 'paragraph',} ), 
  new BlockTypeChange('>',   {type: 'blockquote',} ), 
  new BlockTypeChange(['---', '***', '___'], {type: 'thematicBreak'}),
  new InlineTypeChange(['__', '**'], {strong: true}),
  new InlineTypeChange(['_', '*'], {emphasis: true}),
  new InlineTypeChange('`', {inlineCode: true}), 
  new CustomDirectiveChange('tezos-storage'), 
  new CustomDirectiveChange('embed-media'), 
  new CustomDirectiveChange('link'),
  new LinkChange(), 
]

export const withAutoFormat = (editor: Editor) => {
  const { insertText } = editor;
  editor.insertText = text => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const handled = config.some(change =>  {
        return ['BlockTypeChange', 'InlineTypeChange', 'CustomDirectiveChange', 'LinkChange'].indexOf(change.type) > -1 ?
          change.apply(editor, text) : false
      });
      if (handled) return true;
    }
    insertText(text)
  }

  return editor
}
