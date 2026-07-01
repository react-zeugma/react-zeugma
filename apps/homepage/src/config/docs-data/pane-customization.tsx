import { CustomStylingDemo } from '../../components/docs-mini-demos'
import { DocParagraph, DocCode, DocHeading, InfoCard } from '../../components/docs-elements'
import { DocSection } from '../docs-data'

export const paneCustomizationSection: DocSection = {
  id: 'pane-customization',
  title: 'Pane Customization',
  category: 'core',
  content: (
    <div className="space-y-6">
      <DocParagraph>
        Panes represent the workspaces where tabs are rendered. Because React Zeugma is headless,
        you are responsible for rendering the pane chrome, borders, headers, and tabs. Zeugma
        provides helper subcomponents under the <DocCode highlight>&lt;Pane&gt;</DocCode> namespace
        to simplify integration:
      </DocParagraph>

      <CustomStylingDemo />

      <DocHeading>Pane Subcomponents</DocHeading>
      <div className="space-y-4 my-4 text-sm">
        <InfoCard title='<Pane id="pane-id">' titleClassName="font-mono text-indigo-500 mb-1">
          <p className="text-text-secondary text-xs">
            The root container of a panel. Establishes the drag-and-drop context boundaries and
            monitors drop hover intents.
          </p>
        </InfoCard>
        <InfoCard title="<Pane.DragHandle>" titleClassName="font-mono text-indigo-500 mb-1">
          <p className="text-text-secondary text-xs">
            Wraps the element that triggers panel dragging. Can be placed on the header, tab bar, or
            a specific drag icon. Adds pointer events and grab cursors automatically.
          </p>
        </InfoCard>
        <InfoCard title="<Pane.Content>" titleClassName="font-mono text-indigo-500 mb-1">
          <p className="text-text-secondary text-xs">
            Renders the active tab's content. Accepts a child render function{' '}
            <DocCode>{'(tab: TabDetails) => React.ReactNode'}</DocCode> which is evaluated
            dynamically when tabs are switched.
          </p>
        </InfoCard>
        <InfoCard title="<Pane.Tabs>" titleClassName="font-mono text-indigo-500 mb-1">
          <p className="text-text-secondary text-xs">
            Helper component to render and reorder the tabs. Accepts a <DocCode>renderTab</DocCode>{' '}
            prop to customize the tab buttons.
          </p>
        </InfoCard>
      </div>
    </div>
  ),
}
