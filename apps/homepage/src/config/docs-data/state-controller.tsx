import { TabControllerDemo } from '../../components/docs-mini-demos'
import { DocParagraph, DocCode, DocHeading, InfoCard } from '../../components/docs-elements'
import { DocSection } from '../docs-data'

export const stateControllerSection: DocSection = {
  id: 'state-controller',
  title: 'State & Controller',
  category: 'core',
  content: (
    <div className="space-y-6">
      <DocParagraph>
        The <DocCode highlight>useZeugma</DocCode> hook manages the state of the dashboard layout.
        It returns a <DocCode highlight>ZeugmaController</DocCode> instance containing the current
        layout state, locking status, and helper methods.
      </DocParagraph>

      <TabControllerDemo />

      <DocHeading>Controlled vs. Uncontrolled Mode</DocHeading>
      <DocParagraph>
        You can run the layout engine in either controlled or uncontrolled mode depending on your
        state requirements:
      </DocParagraph>

      <div className="grid md:grid-cols-2 gap-6 my-4">
        <InfoCard title="Uncontrolled Mode">
          <p className="text-text-secondary text-xs leading-relaxed">
            Pass <DocCode highlight>initialLayout</DocCode>. The hook manages layout state
            internally. Ideal for simple dashboards or when utilizing built-in local storage
            persistence.
          </p>
          <pre className="p-3 bg-bg-pane-inner/80 border border-border-primary/50 rounded font-mono text-[11px] text-text-primary overflow-x-auto">
            {`const controller = useZeugma({
  initialLayout: defaultLayout
})`}
          </pre>
        </InfoCard>
        <InfoCard title="Controlled Mode">
          <p className="text-text-secondary text-xs leading-relaxed">
            Pass both <DocCode highlight>layout</DocCode> and <DocCode highlight>onChange</DocCode>.
            You are responsible for storing and updating the tree state. Useful for syncing layout
            with global state (Redux/Zustand) or database backends.
          </p>
          <pre className="p-3 bg-bg-pane-inner/80 border border-border-primary/50 rounded font-mono text-[11px] text-text-primary overflow-x-auto">
            {`const [layout, setLayout] = useState(defaultLayout)
const controller = useZeugma({
  layout,
  onChange: setLayout
})`}
          </pre>
        </InfoCard>
      </div>
    </div>
  ),
}
