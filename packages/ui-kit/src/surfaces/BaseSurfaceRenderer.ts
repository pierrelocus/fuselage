import { Conditions } from '../definition/Conditions';
import { Block } from '../definition/blocks/Block';
import { BlockElement } from '../definition/blocks/element/BlockElement';
import { ActionsBlock } from '../definition/blocks/layout/ActionsBlock';
import { ConditionalBlock } from '../definition/blocks/layout/ConditionalBlock';
import { ContextBlock } from '../definition/blocks/layout/ContextBlock';
import { InputBlock } from '../definition/blocks/layout/InputBlock';
import { LayoutBlock } from '../definition/blocks/layout/LayoutBlock';
import { SectionBlock } from '../definition/blocks/layout/SectionBlock';
import { Markdown } from '../definition/blocks/text/Markdown';
import { PlainText } from '../definition/blocks/text/PlainText';
import { TextObject } from '../definition/blocks/text/TextObject';
import { ISurfaceRenderer } from '../definition/rendering/ISurfaceRenderer';
import { BlockContext, TextObjectType } from '../enums';
import { LayoutBlockType } from '../enums/LayoutBlockType';
import {
  isActionsBlockElement,
  isAllowedLayoutBlock,
  isContextBlockElement,
  isInputBlockElement,
  isNotNull,
  isSectionBlockAccessoryElement,
  isTextObject,
  renderBlockElement,
  renderLayoutBlock,
  renderTextObject,
  resolveConditionalBlocks,
} from '../rendering';

export abstract class BaseSurfaceRenderer<OutputElement>
  implements ISurfaceRenderer<OutputElement> {
  public constructor(
    public allowedLayoutBlockTypes?: Exclude<
      LayoutBlock,
      ConditionalBlock
    >['type'][]
  ) {}

  public render(blocks: readonly Block[], conditions?: Conditions) {
    if (!Array.isArray(blocks)) {
      return [];
    }

    return blocks
      .flatMap(resolveConditionalBlocks(conditions))
      .filter(isAllowedLayoutBlock(this.allowedLayoutBlockTypes))
      .map(renderLayoutBlock(this))
      .filter(isNotNull);
  }

  public renderTextObject(
    textObject: TextObject,
    index: number,
    context: BlockContext
  ): OutputElement | null {
    return renderTextObject(this, context)(textObject, index);
  }

  public renderActionsBlockElement(
    block: BlockElement,
    index: number
  ): OutputElement | null {
    if (
      this.allowedLayoutBlockTypes?.includes(LayoutBlockType.ACTIONS) ===
        false &&
      !isActionsBlockElement(block)
    ) {
      return null;
    }

    return renderBlockElement(this, BlockContext.ACTION)(block, index);
  }

  /** @deprecated */
  public renderActions(
    element: ActionsBlock['elements'][number],
    _context: BlockContext,
    _: undefined,
    index: number
  ): OutputElement | null {
    return this.renderActionsBlockElement(element, index);
  }

  public renderContextBlockElement(
    block: TextObject | BlockElement,
    index: number
  ): OutputElement | null {
    if (
      this.allowedLayoutBlockTypes?.includes(LayoutBlockType.CONTEXT) ===
        false &&
      !isContextBlockElement(block)
    ) {
      return null;
    }

    if (isTextObject(block)) {
      return renderTextObject(this, BlockContext.CONTEXT)(block, index);
    }

    return renderBlockElement(this, BlockContext.CONTEXT)(block, index);
  }

  /** @deprecated */
  public renderContext(
    element: ContextBlock['elements'][number],
    _context: BlockContext,
    _: undefined,
    index: number
  ): OutputElement | null {
    return this.renderContextBlockElement(element, index);
  }

  public renderInputBlockElement(
    block: BlockElement,
    index: number
  ): OutputElement | null {
    if (
      this.allowedLayoutBlockTypes?.includes(LayoutBlockType.INPUT) === false &&
      !isInputBlockElement(block)
    ) {
      return null;
    }

    return renderBlockElement(this, BlockContext.FORM)(block, index);
  }

  /** @deprecated */
  public renderInputs(
    element: InputBlock['element'],
    _context: BlockContext,
    _: undefined,
    index: number
  ): OutputElement | null {
    return this.renderInputBlockElement(element, index);
  }

  public renderSectionAccessoryBlockElement(
    block: BlockElement,
    index: number
  ): OutputElement | null {
    if (
      this.allowedLayoutBlockTypes?.includes(LayoutBlockType.SECTION) ===
        false &&
      !isSectionBlockAccessoryElement(block)
    ) {
      return null;
    }

    return renderBlockElement(this, BlockContext.SECTION)(block, index);
  }

  /** @deprecated */
  public renderAccessories(
    element: Exclude<SectionBlock['accessory'], undefined>,
    _context: BlockContext,
    _: undefined,
    index: number
  ): OutputElement | null {
    return this.renderSectionAccessoryBlockElement(element, index);
  }

  public abstract [TextObjectType.PLAIN_TEXT](
    element: PlainText,
    context: BlockContext,
    index: number
  ): OutputElement | null;

  /** @deprecated */
  public plainText(
    element: PlainText,
    context: BlockContext,
    index: number
  ): OutputElement | null {
    return this[TextObjectType.PLAIN_TEXT](element, context, index);
  }

  /** @deprecated */
  public mrkdwn(
    _element: Markdown,
    _context: BlockContext,
    _index: number
  ): OutputElement | null {
    return null;
  }

  /** @deprecated */
  public text(
    textObject: TextObject,
    context: BlockContext,
    index: number
  ): OutputElement | null {
    switch (textObject.type) {
      case TextObjectType.PLAIN_TEXT:
        return this.plainText(textObject, context, index);

      case TextObjectType.MARKDOWN:
        return this.mrkdwn(textObject, context, index);

      default:
        return null;
    }
  }
}