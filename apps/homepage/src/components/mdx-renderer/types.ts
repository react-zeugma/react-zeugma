import type { RootContent } from '../../lib/parse-mdx'
import type {
  Heading,
  Text,
  Code,
  InlineCode,
  Paragraph,
  Strong,
  Emphasis,
  Link,
  List,
  ListItem,
  Table,
  TableRow,
  TableCell,
  Blockquote,
} from 'mdast'

export type { RootContent }
export type {
  Heading,
  Text,
  Code,
  InlineCode,
  Paragraph,
  Strong,
  Emphasis,
  Link,
  List,
  ListItem,
  Table,
  TableRow,
  TableCell,
  Blockquote,
}

export type CalloutType = 'note' | 'tip' | 'warning'

export interface ParsedCallout {
  type: CalloutType
  title: string
  bodyNodes: RootContent[]
}
