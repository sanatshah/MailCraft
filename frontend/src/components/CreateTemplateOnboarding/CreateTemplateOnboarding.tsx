import { useState } from 'react'
import './CreateTemplateOnboarding.css'

type Step = 0 | 1

export function CreateTemplateOnboarding(props: {
  onCreate: (name: string) => Promise<void>
  onSkip: () => void
}) {
  const [step, setStep] = useState<Step>(0)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setError(null)
    setCreating(true)
    try {
      const trimmed = name.trim()
      await props.onCreate(trimmed || 'Untitled Template')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create template')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="create-template-onboarding" data-testid="create-template-onboarding">
      <div className="create-template-onboarding-card">
        {step === 0 && (
          <>
            <p className="create-template-onboarding-kicker">Get started</p>
            <h3 className="create-template-onboarding-title">Create your first email template</h3>
            <p className="create-template-onboarding-lead">
              MailCraft turns blocks into HTML you can send through your pipeline. Here is the flow:
            </p>
            <ol className="create-template-onboarding-steps">
              <li>Give your template a name so you can find it later.</li>
              <li>Drag blocks from the library into the canvas to build the layout.</li>
              <li>Edit blocks in the right panel and preview rendered HTML anytime.</li>
            </ol>
            <div className="create-template-onboarding-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setStep(1)}
              >
                Continue
              </button>
              <button
                type="button"
                className="create-template-onboarding-skip"
                onClick={() => props.onSkip()}
              >
                Skip for now
              </button>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <p className="create-template-onboarding-kicker">Step 2 of 2</p>
            <h3 className="create-template-onboarding-title">Name your template</h3>
            <p className="create-template-onboarding-lead">
              You can rename it later in the editor. We will open the editor so you can add blocks.
            </p>
            <label className="create-template-onboarding-label" htmlFor="onboarding-template-name">
              Template name
            </label>
            <input
              id="onboarding-template-name"
              type="text"
              className="create-template-onboarding-input"
              placeholder="e.g. Weekly digest"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={creating}
              autoComplete="off"
            />
            {error && <p className="create-template-onboarding-error">{error}</p>}
            <div className="create-template-onboarding-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => void handleCreate()}
                disabled={creating}
              >
                {creating ? 'Creating…' : 'Create & open editor'}
              </button>
              <button
                type="button"
                className="create-template-onboarding-secondary"
                onClick={() => setStep(0)}
                disabled={creating}
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
