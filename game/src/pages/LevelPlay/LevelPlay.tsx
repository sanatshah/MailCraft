import { useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getLevelById } from '../../data/levels/index'
import { useGameStore } from '../../store/gameStore'
import { CatAvatar } from '../../components/CatAvatar/CatAvatar'
import { SimulatedEditor } from '../../components/SimulatedEditor/SimulatedEditor'
import { SimulatedChat } from '../../components/SimulatedChat/SimulatedChat'
import { SimulatedTerminal } from '../../components/SimulatedTerminal/SimulatedTerminal'
import { DiffView } from '../../components/DiffView/DiffView'
import { ModeSelector } from '../../components/ModeSelector/ModeSelector'
import { ModelSelector } from '../../components/ModelSelector/ModelSelector'
import { QuizPanel } from '../../components/QuizPanel/QuizPanel'
import { HintSystem } from '../../components/HintSystem/HintSystem'
import { CursorSidebar } from '../../components/CursorSidebar/CursorSidebar'
import type { LevelPhase, ChallengeStep, ChatMessage } from '../../types/game'
import './LevelPlay.css'

const PHASES: LevelPhase[] = ['briefing', 'challenge', 'debrief', 'quiz', 'complete']

export function LevelPlay() {
  const { levelId } = useParams<{ levelId: string }>()
  const navigate = useNavigate()
  const level = levelId ? getLevelById(levelId) : undefined

  const {
    accessories,
    addXp,
    completeLevel: markLevelComplete,
    addAccessory,
    useHint: recordHintUse,
  } = useGameStore()

  // Phase tracking
  const [phase, setPhase] = useState<LevelPhase>('briefing')
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [, setStepCompleted] = useState<Record<string, boolean>>({})
  const [quizScore, setQuizScore] = useState(0)
  const [startTime] = useState(Date.now())
  const [hintTier, setHintTier] = useState(-1)

  // Challenge-specific state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [selectedLines, setSelectedLines] = useState<[number, number] | null>(null)
  const [activeFileIdx, setActiveFileIdx] = useState(0)
  const [mode, setMode] = useState('Ask')
  const [, setSelectedModel] = useState<string | null>(null)
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<string, string>>({})
  const [scenarioSubmitted, setScenarioSubmitted] = useState(false)
  const [diffStatuses, setDiffStatuses] = useState<Record<string, 'pending' | 'accepted' | 'rejected'>>({})
  const [followUpSent, setFollowUpSent] = useState(false)
  const [terminalAttached, setTerminalAttached] = useState(false)
  const [rulesText, setRulesText] = useState('')
  const [enabledMcps, setEnabledMcps] = useState<string[]>([])
  const [mentionUsed, setMentionUsed] = useState(false)
  const [scopeRules, setScopeRules] = useState<Record<string, string>>({})
  const [cloudLaunched, setCloudLaunched] = useState(false)
  const [cloudDone, setCloudDone] = useState(false)
  const [localDone, setLocalDone] = useState(false)
  const [subtasks, setSubtasks] = useState<string[]>(['', '', '', ''])
  const [automationConfigs, setAutomationConfigs] = useState<Record<string, { trigger: string; prompt: string }>>({})
  const [prReviews, setPrReviews] = useState<Record<string, { issueType: string; comment: string }>>({})
  const [planEdited, setPlanEdited] = useState(false)

  const phaseIdx = PHASES.indexOf(phase)

  // Get current step from the level, handling multi_step nesting
  const effectiveSteps = useMemo(() => {
    if (!level) return []
    const steps: ChallengeStep[] = []
    for (const step of level.challengeSteps) {
      if (step.type === 'multi_step' && step.subSteps) {
        steps.push(...step.subSteps)
      } else {
        steps.push(step)
      }
    }
    return steps
  }, [level])

  const currentStep = effectiveSteps[currentStepIdx]

  const resetStepState = useCallback(() => {
    setChatMessages([])
    setSelectedLines(null)
    setActiveFileIdx(0)
    setSelectedModel(null)
    setScenarioAnswers({})
    setScenarioSubmitted(false)
    setDiffStatuses({})
    setFollowUpSent(false)
    setTerminalAttached(false)
    setRulesText('')
    setEnabledMcps([])
    setMentionUsed(false)
    setScopeRules({})
    setCloudLaunched(false)
    setCloudDone(false)
    setLocalDone(false)
    setSubtasks(['', '', '', ''])
    setAutomationConfigs({})
    setPrReviews({})
    setPlanEdited(false)
  }, [])

  // Advance to next step or phase
  const completeCurrentStep = useCallback(() => {
    if (!currentStep) return
    setStepCompleted((prev) => ({ ...prev, [currentStep.id]: true }))

    if (currentStepIdx < effectiveSteps.length - 1) {
      setCurrentStepIdx((i) => i + 1)
      resetStepState()
    } else {
      setPhase('debrief')
    }
  }, [currentStep, currentStepIdx, effectiveSteps.length, resetStepState])

  // Handle chat send
  const handleChatSend = useCallback(
    (text: string) => {
      if (!currentStep) return
      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text }
      setChatMessages((prev) => [...prev, userMsg])

      // Check if this completes the step
      if (currentStep.type === 'highlight_and_ask') {
        const kw = currentStep.expectedPrompt?.toLowerCase() ?? ''
        if (text.toLowerCase().includes(kw) && selectedLines) {
          setTimeout(() => {
            const agentMsg: ChatMessage = {
              id: `a-${Date.now()}`,
              role: 'agent',
              content: currentStep.agentResponse ?? 'Done!',
            }
            setChatMessages((prev) => [...prev, agentMsg])
            setTimeout(() => completeCurrentStep(), 800)
          }, 500)
        }
      }

      if (currentStep.type === 'debug_attach') {
        if (terminalAttached) {
          setTimeout(() => {
            const agentMsg: ChatMessage = {
              id: `a-${Date.now()}`,
              role: 'agent',
              content: currentStep.debugResponse ?? 'Fixed!',
            }
            setChatMessages((prev) => [...prev, agentMsg])
            setTimeout(() => completeCurrentStep(), 800)
          }, 500)
        }
      }

      if (currentStep.type === 'agent_diff_review' && followUpSent === false) {
        // Follow-up after rejection
        const hasRejected = Object.values(diffStatuses).some((s) => s === 'rejected')
        if (hasRejected) {
          setFollowUpSent(true)
          setTimeout(() => {
            const agentMsg: ChatMessage = {
              id: `a-${Date.now()}`,
              role: 'agent',
              content: 'Updated! I\'ve added proper error handling. Please review the updated diff.',
            }
            setChatMessages((prev) => [...prev, agentMsg])
          }, 500)
        }
      }

      if (currentStep.type === 'at_mention') {
        if (text.includes('@')) {
          setMentionUsed(true)
          setTimeout(() => {
            const agentMsg: ChatMessage = {
              id: `a-${Date.now()}`,
              role: 'agent',
              content: 'Got it! I\'ve referenced the context you pointed me to and applied the patterns.',
            }
            setChatMessages((prev) => [...prev, agentMsg])
            setTimeout(() => completeCurrentStep(), 800)
          }, 500)
        }
      }
    },
    [currentStep, selectedLines, terminalAttached, diffStatuses, followUpSent, completeCurrentStep],
  )

  // Handle terminal add-to-chat
  const handleTerminalAddToChat = useCallback(
    (text: string) => {
      setTerminalAttached(true)
      const sysMsg: ChatMessage = {
        id: `s-${Date.now()}`,
        role: 'system',
        content: `📋 Attached terminal output:\n${text}`,
      }
      setChatMessages((prev) => [...prev, sysMsg])
    },
    [],
  )

  // Handle diff accept/reject
  const handleDiffAction = useCallback(
    (fileName: string, action: 'accepted' | 'rejected') => {
      setDiffStatuses((prev) => ({ ...prev, [fileName]: action }))
    },
    [],
  )

  // Handle quiz complete
  const handleQuizComplete = useCallback(
    (score: number) => {
      setQuizScore(score)
      setPhase('complete')
    },
    [],
  )

  // Handle level complete — calculate XP and award everything
  const handleFinishLevel = useCallback(() => {
    if (!level || !levelId) return

    let totalXp = level.reward.xp

    // Speed bonus
    const elapsed = (Date.now() - startTime) / 1000
    if (elapsed < level.parTimeSeconds) {
      totalXp += 25
    }

    // No-hint bonus
    if (hintTier < 0) {
      totalXp += 25
    }

    // Quiz bonus
    totalXp += quizScore * 10

    addXp(totalXp)
    markLevelComplete(levelId)
    addAccessory(level.reward.accessory)
    navigate('/world')
  }, [level, levelId, startTime, hintTier, quizScore, addXp, markLevelComplete, addAccessory, navigate])

  // Handle hint
  const handleRequestHint = useCallback(
    (tier: number) => {
      if (!levelId) return
      setHintTier(tier)
      recordHintUse(levelId, tier)
      const cost = level?.hints[tier]?.xpCost ?? 0
      if (cost > 0) {
        addXp(-cost)
      }
    },
    [levelId, level, recordHintUse, addXp],
  )

  // ── Not found ──
  if (!level) {
    return (
      <div className="level-not-found">
        <div className="level-not-found__title">🐱 Level Not Found</div>
        <p>This level doesn&apos;t exist yet.</p>
        <Link to="/world" className="btn btn--primary">
          Back to World Map
        </Link>
      </div>
    )
  }

  // ── Render ──
  return (
    <div className="level-play level-play--with-sidebar" data-testid="level-play">
      {/* Cursor-style sidebar */}
      <CursorSidebar currentLevelId={levelId ?? ''} />

      {/* Main content area */}
      <div className="level-play__main">
        {/* Compact header */}
        <div className="level-play__header">
          <div className="level-play__header-left">
            <Link to="/world" className="level-play__back">
              ←
            </Link>
            <div className="level-play__level-info">
              <div className="level-play__level-title">
                {level.isBoss ? '⭐ ' : ''}
                {level.title}
              </div>
              <div className="level-play__level-subtitle">{level.subtitle}</div>
            </div>
          </div>
          <div className="level-play__phase-indicator">
            {PHASES.map((p, i) => (
              <div
                key={p}
                className={`level-play__phase-dot ${i === phaseIdx ? 'level-play__phase-dot--active' : ''} ${i < phaseIdx ? 'level-play__phase-dot--done' : ''}`}
              />
            ))}
          </div>
          <CatAvatar
            mood={phase === 'complete' ? 'happy' : phase === 'challenge' ? 'thinking' : 'idle'}
            accessories={accessories}
            size="sm"
          />
        </div>

        {/* Body */}
        <div className="level-play__body">
        {/* ── BRIEFING ── */}
        {phase === 'briefing' && (
          <div className="briefing">
            <span className="briefing__concept-tag">{level.concept}</span>
            <CatAvatar mood="idle" accessories={accessories} size="md" />
            <div className="briefing__narrative">{level.narrativeIntro}</div>
            <div className="briefing__task">
              <div className="briefing__task-label">📋 Your Mission</div>
              {level.briefing}
            </div>
            <button className="btn btn--primary" onClick={() => setPhase('challenge')}>
              Let&apos;s Go! 🐾
            </button>
          </div>
        )}

        {/* ── CHALLENGE ── */}
        {phase === 'challenge' && currentStep && (
          <div className="challenge">
            <div className="challenge__step-header">
              <div className="challenge__step-instruction">{currentStep.instruction}</div>
              <div className="challenge__step-progress">
                Step {currentStepIdx + 1} / {effectiveSteps.length}
              </div>
            </div>

            {/* ─ highlight_and_ask ─ */}
            {currentStep.type === 'highlight_and_ask' && (
              <>
                <ModeSelector activeMode={mode} enabledModes={['Ask']} onSelect={setMode} />
                <div className="challenge__step-body challenge__step-body--split">
                  <SimulatedEditor
                    files={currentStep.files ?? []}
                    activeFileIndex={activeFileIdx}
                    selectedLines={selectedLines}
                    onSelectLines={setSelectedLines}
                    onFileSelect={setActiveFileIdx}
                  />
                  <SimulatedChat
                    messages={chatMessages}
                    onSend={handleChatSend}
                    mode="Ask"
                    suggestions={[
                      currentStep.expectedPrompt ? `${currentStep.expectedPrompt} this` : 'Fix this',
                    ]}
                  />
                </div>
              </>
            )}

            {/* ─ review_plan ─ */}
            {currentStep.type === 'review_plan' && (
              <>
                <ModeSelector activeMode="Plan" enabledModes={['Plan']} onSelect={() => {}} />
                <div className="challenge__step-body" style={{ flexDirection: 'column', padding: 'var(--space-xl)', overflow: 'auto' }}>
                  <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <h3 style={{ color: 'var(--color-purple)' }}>📋 Proposed Plan</h3>
                    {currentStep.planSteps?.map((ps) => (
                      <div
                        key={ps.id}
                        style={{
                          padding: 'var(--space-md)',
                          background: ps.isBad && planEdited ? 'rgba(74,222,128,0.1)' : ps.isBad ? 'rgba(248,113,113,0.1)' : 'var(--color-surface)',
                          border: `1px solid ${ps.isBad ? (planEdited ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)') : 'var(--color-border)'}`,
                          borderRadius: 'var(--radius-md)',
                          cursor: ps.isBad ? 'pointer' : 'default',
                        }}
                        onClick={() => {
                          if (ps.isBad && !planEdited) {
                            setPlanEdited(true)
                          }
                        }}
                      >
                        <div>{ps.text}</div>
                        {ps.isBad && !planEdited && (
                          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-xs)' }}>
                            🔍 Click to identify and fix this step
                          </div>
                        )}
                        {ps.isBad && planEdited && ps.explanation && (
                          <div style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-xs)' }}>
                            ✓ {ps.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                    {planEdited && (
                      <button className="btn btn--primary" onClick={completeCurrentStep}>
                        ✅ Approve Revised Plan
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ─ agent_diff_review ─ */}
            {currentStep.type === 'agent_diff_review' && (
              <>
                <ModeSelector activeMode="Agent" enabledModes={['Agent']} onSelect={() => {}} />
                <div className="challenge__step-body" style={{ flexDirection: 'column', overflow: 'auto', padding: 'var(--space-md)' }}>
                  {currentStep.diffs?.map((d) => (
                    <DiffView
                      key={d.fileName}
                      fileName={d.fileName}
                      before={d.before}
                      after={d.after}
                      onAccept={() => handleDiffAction(d.fileName, 'accepted')}
                      onReject={() => handleDiffAction(d.fileName, 'rejected')}
                      status={diffStatuses[d.fileName]}
                    />
                  ))}
                  {followUpSent && currentStep.followUpDiff && (
                    <div style={{ marginTop: 'var(--space-md)' }}>
                      <DiffView
                        fileName={currentStep.followUpDiff.fileName}
                        before={currentStep.followUpDiff.before}
                        after={currentStep.followUpDiff.after}
                        onAccept={completeCurrentStep}
                        onReject={() => {}}
                      />
                    </div>
                  )}
                  {Object.values(diffStatuses).some((s) => s === 'rejected') && !followUpSent && (
                    <div style={{ marginTop: 'var(--space-md)', maxWidth: 500 }}>
                      <SimulatedChat
                        messages={chatMessages}
                        onSend={handleChatSend}
                        mode="Agent"
                        suggestions={['Add error handling', 'Add try/catch']}
                      />
                    </div>
                  )}
                  {currentStep.diffs &&
                    currentStep.diffs.every((d) => diffStatuses[d.fileName] === 'accepted') &&
                    !currentStep.diffs.some((d) => d.hasIssue) && (
                      <button className="btn btn--primary" onClick={completeCurrentStep} style={{ marginTop: 'var(--space-md)', alignSelf: 'center' }}>
                        Continue →
                      </button>
                    )}
                </div>
              </>
            )}

            {/* ─ debug_attach ─ */}
            {currentStep.type === 'debug_attach' && (
              <div className="challenge__step-body challenge__step-body--split">
                <SimulatedTerminal
                  lines={currentStep.terminalLines ?? []}
                  onAddToChat={handleTerminalAddToChat}
                />
                <SimulatedChat
                  messages={chatMessages}
                  onSend={handleChatSend}
                  mode="Agent"
                  suggestions={['Fix this error', 'Debug this issue']}
                  disabled={!terminalAttached}
                  placeholder={terminalAttached ? 'Ask your cat to fix it...' : 'First, add the error to chat →'}
                />
              </div>
            )}

            {/* ─ model_select ─ */}
            {currentStep.type === 'model_select' && (
              <div className="challenge__step-body challenge__step-body--center">
                <div className="scenarios">
                  {currentStep.scenarios?.map((sc) => (
                    <div key={sc.id} className="scenario-card">
                      <div className="scenario-card__description">🎯 {sc.description}</div>
                      <ModelSelector
                        selectedModel={scenarioAnswers[sc.id] ?? null}
                        onSelect={(modelId) => {
                          if (!scenarioSubmitted) {
                            setScenarioAnswers((prev) => ({ ...prev, [sc.id]: modelId }))
                          }
                        }}
                        disabled={scenarioSubmitted}
                      />
                      {scenarioSubmitted && (
                        <div
                          className={`scenario-card__result ${scenarioAnswers[sc.id] === sc.correctBreedId ? 'scenario-card__result--correct' : 'scenario-card__result--wrong'}`}
                        >
                          {scenarioAnswers[sc.id] === sc.correctBreedId
                            ? '✓ Correct!'
                            : `✗ ${sc.explanation}`}
                        </div>
                      )}
                    </div>
                  ))}
                  {!scenarioSubmitted && currentStep.scenarios && Object.keys(scenarioAnswers).length === currentStep.scenarios.length && (
                    <button
                      className="btn btn--primary"
                      onClick={() => setScenarioSubmitted(true)}
                    >
                      Submit Answers
                    </button>
                  )}
                  {scenarioSubmitted && (() => {
                    const correct = currentStep.scenarios?.filter((s) => scenarioAnswers[s.id] === s.correctBreedId).length ?? 0
                    const min = currentStep.minCorrect ?? 4
                    return correct >= min ? (
                      <button className="btn btn--primary" onClick={completeCurrentStep}>
                        Continue → ({correct}/{currentStep.scenarios?.length} correct)
                      </button>
                    ) : (
                      <button className="btn btn--secondary" onClick={() => { setScenarioSubmitted(false); setScenarioAnswers({}) }}>
                        Try Again ({correct}/{currentStep.scenarios?.length}, need {min})
                      </button>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* ─ write_rules ─ */}
            {currentStep.type === 'write_rules' && (
              <div className="challenge__step-body challenge__step-body--center">
                <div className="rules-editor">
                  <h3 style={{ color: 'var(--color-amber)' }}>📝 Write Your Project Rules</h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Write rules that your AI cat should follow. One rule per line.
                  </p>
                  <textarea
                    className="rules-editor__textarea"
                    value={rulesText}
                    onChange={(e) => setRulesText(e.target.value)}
                    placeholder="# .cursorrules&#10;&#10;- Always use const and let, never var&#10;- Use functional components&#10;- Use single quotes for strings"
                  />
                  {currentStep.beforeCode && currentStep.afterCode && (
                    <div className="rules-editor__comparison">
                      <div>
                        <div className="rules-editor__code-label rules-editor__code-label--before">
                          ✗ Before (without rules)
                        </div>
                        <pre className="rules-editor__code-block">{currentStep.beforeCode}</pre>
                      </div>
                      <div>
                        <div className="rules-editor__code-label rules-editor__code-label--after">
                          ✓ After (with rules)
                        </div>
                        <pre className="rules-editor__code-block">{currentStep.afterCode}</pre>
                      </div>
                    </div>
                  )}
                  <button
                    className="btn btn--primary"
                    disabled={
                      !currentStep.requiredRules?.every((kw) =>
                        rulesText.toLowerCase().includes(kw.toLowerCase()),
                      )
                    }
                    onClick={completeCurrentStep}
                  >
                    Save Rules & Apply ✓
                  </button>
                </div>
              </div>
            )}

            {/* ─ enable_mcps ─ */}
            {currentStep.type === 'enable_mcps' && (
              <div className="challenge__step-body challenge__step-body--center">
                <div>
                  <h3 style={{ color: 'var(--color-amber)', marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
                    🛒 Skills Shop — Enable the right MCPs
                  </h3>
                  <div className="mcp-shop">
                    {currentStep.availableMcps?.map((mcp) => (
                      <div
                        key={mcp.id}
                        className={`mcp-card ${enabledMcps.includes(mcp.id) ? 'mcp-card--active' : ''}`}
                        onClick={() => {
                          setEnabledMcps((prev) =>
                            prev.includes(mcp.id)
                              ? prev.filter((id) => id !== mcp.id)
                              : [...prev, mcp.id],
                          )
                        }}
                      >
                        <div className="mcp-card__emoji">{mcp.emoji}</div>
                        <div className="mcp-card__name">{mcp.name}</div>
                        <div className="mcp-card__desc">{mcp.description}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
                    <button
                      className="btn btn--primary"
                      disabled={
                        !currentStep.requiredMcpIds?.every((id) => enabledMcps.includes(id))
                      }
                      onClick={completeCurrentStep}
                    >
                      Confirm Selection ✓
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─ at_mention ─ */}
            {currentStep.type === 'at_mention' && (
              <div className="challenge__step-body challenge__step-body--center">
                <div style={{ maxWidth: 500, width: '100%' }}>
                  <SimulatedChat
                    messages={chatMessages}
                    onSend={handleChatSend}
                    mode="Agent"
                    suggestions={
                      currentStep.availableMentions?.map((m) => `${m.label} ${m.value}`) ?? []
                    }
                    placeholder="Use @-mentions to provide context..."
                  />
                  {mentionUsed && (
                    <div className="challenge__complete-banner">Context attached successfully!</div>
                  )}
                </div>
              </div>
            )}

            {/* ─ scope_rules ─ */}
            {currentStep.type === 'scope_rules' && (
              <div className="challenge__step-body challenge__step-body--center">
                <div className="scope-rules">
                  <h3 style={{ color: 'var(--color-amber)' }}>🎯 Scope Your Rules</h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Write a rule for each file pattern. Rules will only apply to matching files.
                  </p>
                  {currentStep.scopeTargets?.map((target) => (
                    <div key={target.glob} className="scope-rule-item">
                      <div className="scope-rule-item__glob">
                        📁 Pattern: <code>{target.glob}</code>
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                        Hint: {target.ruleHint}
                      </div>
                      <input
                        className="scope-rule-item__input"
                        placeholder={`Write a rule for ${target.glob} files...`}
                        value={scopeRules[target.glob] ?? ''}
                        onChange={(e) =>
                          setScopeRules((prev) => ({ ...prev, [target.glob]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                  <button
                    className="btn btn--primary"
                    disabled={
                      !currentStep.scopeTargets?.every(
                        (t) => (scopeRules[t.glob] ?? '').trim().length > 5,
                      )
                    }
                    onClick={completeCurrentStep}
                  >
                    Apply Scoped Rules ✓
                  </button>
                </div>
              </div>
            )}

            {/* ─ launch_background ─ */}
            {currentStep.type === 'launch_background' && (
              <div className="cloud-view">
                {/* Local editor side */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-md)' }}>
                  <h4 style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)' }}>
                    💻 Local Editor
                  </h4>
                  {currentStep.localTask?.files && (
                    <SimulatedEditor
                      files={currentStep.localTask.files}
                      activeFileIndex={0}
                      selectedLines={null}
                    />
                  )}
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-sm)', fontSize: 'var(--font-size-sm)' }}>
                    {currentStep.localTask?.instruction}
                  </p>
                  {!localDone && (
                    <button
                      className="btn btn--secondary"
                      style={{ marginTop: 'var(--space-md)' }}
                      onClick={() => setLocalDone(true)}
                    >
                      ✅ Mark Local Task Done
                    </button>
                  )}
                  {localDone && (
                    <div className="challenge__complete-banner">Local task completed!</div>
                  )}
                </div>
                {/* Cloud dashboard side */}
                <div className="cloud-dashboard">
                  <div className="cloud-dashboard__title">☁️ Cloud Colony</div>
                  {!cloudLaunched ? (
                    <button
                      className="btn btn--primary"
                      onClick={() => {
                        setCloudLaunched(true)
                        setTimeout(() => setCloudDone(true), 3000)
                      }}
                    >
                      🚀 Send to Cloud: &quot;{currentStep.cloudTask}&quot;
                    </button>
                  ) : (
                    <div className="cloud-agent">
                      <CatAvatar mood={cloudDone ? 'happy' : 'thinking'} accessories={[]} size="sm" />
                      <div className={`cloud-agent__status ${cloudDone ? 'cloud-agent__status--done' : 'cloud-agent__status--working'}`}>
                        {cloudDone ? '✅ Task Complete — PR Ready for Review' : '⏳ Working...'}
                      </div>
                    </div>
                  )}
                  {cloudDone && localDone && (
                    <button className="btn btn--primary" onClick={completeCurrentStep}>
                      Review & Continue →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ─ decompose_tasks ─ */}
            {currentStep.type === 'decompose_tasks' && (
              <div className="challenge__step-body challenge__step-body--center">
                <div className="decompose">
                  <h3 style={{ color: 'var(--color-amber)' }}>📋 Mission Control</h3>
                  <div className="decompose__feature">
                    <strong>Feature Request:</strong> {currentStep.featureDescription}
                  </div>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Break this into {currentStep.minSubtasks ?? 3}+ independent subtasks:
                  </p>
                  <div className="decompose__tasks">
                    {subtasks.map((task, i) => (
                      <div key={i} className="decompose__task-input">
                        <span style={{ color: 'var(--color-amber)', fontWeight: 700, minWidth: 24 }}>
                          {i + 1}.
                        </span>
                        <input
                          value={task}
                          onChange={(e) => {
                            const next = [...subtasks]
                            next[i] = e.target.value
                            setSubtasks(next)
                          }}
                          placeholder={`Subtask ${i + 1}...`}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn btn--primary"
                    disabled={
                      subtasks.filter((t) => t.trim().length > 3).length <
                      (currentStep.minSubtasks ?? 3)
                    }
                    onClick={completeCurrentStep}
                  >
                    🚀 Assign to Agents
                  </button>
                </div>
              </div>
            )}

            {/* ─ setup_automation ─ */}
            {currentStep.type === 'setup_automation' && (
              <div className="challenge__step-body challenge__step-body--center">
                <div className="automation-builder">
                  <h3 style={{ color: 'var(--color-amber)' }}>⚡ Automation Builder</h3>
                  {currentStep.automations?.map((auto) => {
                    const config = automationConfigs[auto.id] ?? { trigger: '', prompt: '' }
                    const isConfigured = config.trigger && config.prompt.trim().length > 5
                    return (
                      <div key={auto.id} className="automation-card">
                        <div className="automation-card__name">{auto.name}</div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          Trigger:
                        </label>
                        <select
                          value={config.trigger}
                          onChange={(e) =>
                            setAutomationConfigs((prev) => ({
                              ...prev,
                              [auto.id]: { ...config, trigger: e.target.value },
                            }))
                          }
                        >
                          <option value="">Select a trigger...</option>
                          {auto.triggerOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          Agent Prompt:
                        </label>
                        <textarea
                          rows={2}
                          value={config.prompt}
                          placeholder={auto.promptHint}
                          onChange={(e) =>
                            setAutomationConfigs((prev) => ({
                              ...prev,
                              [auto.id]: { ...config, prompt: e.target.value },
                            }))
                          }
                        />
                        <div
                          className={`automation-card__status ${isConfigured ? 'automation-card__status--configured' : 'automation-card__status--pending'}`}
                        >
                          {isConfigured ? '✓ Configured' : '○ Pending'}
                        </div>
                      </div>
                    )
                  })}
                  <button
                    className="btn btn--primary"
                    disabled={
                      !currentStep.automations?.every((auto) => {
                        const c = automationConfigs[auto.id]
                        return c && c.trigger && c.prompt.trim().length > 5
                      })
                    }
                    onClick={completeCurrentStep}
                  >
                    ⚡ Deploy Automations
                  </button>
                </div>
              </div>
            )}

            {/* ─ review_pr ─ */}
            {currentStep.type === 'review_pr' && (
              <div className="challenge__step-body" style={{ flexDirection: 'column', overflow: 'auto' }}>
                <div className="pr-review">
                  {currentStep.prs?.map((pr) => {
                    const review = prReviews[pr.id] ?? { issueType: '', comment: '' }
                    return (
                      <div key={pr.id} className="pr-review-item">
                        <div className="pr-review-item__header">
                          📄 PR: {pr.title}
                        </div>
                        <div className="pr-review-item__body">
                          <DiffView
                            fileName={pr.diff.fileName}
                            before={pr.diff.before}
                            after={pr.diff.after}
                            onAccept={() => {}}
                            onReject={() => {}}
                          />
                        </div>
                        <div className="pr-review-item__issue-select">
                          {['security', 'complexity', 'testing', 'style', 'correctness'].map(
                            (issueType) => (
                              <button
                                key={issueType}
                                className={`issue-tag ${review.issueType === issueType ? 'issue-tag--selected' : ''}`}
                                onClick={() =>
                                  setPrReviews((prev) => ({
                                    ...prev,
                                    [pr.id]: { ...review, issueType },
                                  }))
                                }
                              >
                                {issueType}
                              </button>
                            ),
                          )}
                        </div>
                        <div className="pr-review-item__comment">
                          <textarea
                            value={review.comment}
                            placeholder="Write your review comment..."
                            onChange={(e) =>
                              setPrReviews((prev) => ({
                                ...prev,
                                [pr.id]: { ...review, comment: e.target.value },
                              }))
                            }
                          />
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ padding: 'var(--space-md) var(--space-xl)', textAlign: 'center' }}>
                    <button
                      className="btn btn--primary"
                      disabled={
                        !currentStep.prs?.every((pr) => {
                          const r = prReviews[pr.id]
                          return r && r.issueType === pr.issueType && r.comment.trim().length > 5
                        })
                      }
                      onClick={completeCurrentStep}
                    >
                      Submit Reviews ✓
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DEBRIEF ── */}
        {phase === 'debrief' && (
          <div className="debrief">
            <CatAvatar mood="happy" accessories={accessories} size="md" />
            <div className="debrief__text">{level.debrief}</div>
            <div className="debrief__mapping">
              <div className="debrief__mapping-label">🔗 Real-World Cursor Feature</div>
              {level.realWorldMapping}
            </div>
            <button className="btn btn--primary" onClick={() => setPhase('quiz')}>
              Take the Quiz 📝
            </button>
          </div>
        )}

        {/* ── QUIZ ── */}
        {phase === 'quiz' && (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-xl)', overflow: 'auto' }}>
            <QuizPanel questions={level.quiz} onComplete={handleQuizComplete} />
          </div>
        )}

        {/* ── COMPLETE ── */}
        {phase === 'complete' && (
          <div className="complete">
            <div className="complete__title">🎉 Level Complete!</div>
            <CatAvatar mood="happy" accessories={[...accessories, level.reward.accessory]} size="lg" />
            <div className="complete__xp">
              <div className="complete__xp-row">
                Level XP: <span className="complete__xp-value">+{level.reward.xp}</span>
              </div>
              {(Date.now() - startTime) / 1000 < level.parTimeSeconds && (
                <div className="complete__xp-row">
                  Speed Bonus: <span className="complete__xp-value">+25</span>
                </div>
              )}
              {hintTier < 0 && (
                <div className="complete__xp-row">
                  No-Hint Bonus: <span className="complete__xp-value">+25</span>
                </div>
              )}
              <div className="complete__xp-row">
                Quiz Bonus: <span className="complete__xp-value">+{quizScore * 10}</span>
              </div>
              <div className="complete__xp-total">
                Total: +
                {level.reward.xp +
                  ((Date.now() - startTime) / 1000 < level.parTimeSeconds ? 25 : 0) +
                  (hintTier < 0 ? 25 : 0) +
                  quizScore * 10}{' '}
                XP
              </div>
            </div>
            <div className="complete__accessory">
              <div className="complete__accessory-emoji">{level.reward.accessoryEmoji}</div>
              <div className="complete__accessory-name">
                New Accessory: {level.reward.accessory.replace(/-/g, ' ')}
              </div>
            </div>
            <button className="btn btn--primary" onClick={handleFinishLevel}>
              Continue to World Map →
            </button>
          </div>
        )}

        {/* Hint System (always visible during challenge) */}
        {phase === 'challenge' && (
          <HintSystem
            hints={level.hints}
            currentTier={hintTier}
            onRequestHint={handleRequestHint}
            levelId={level.id}
          />
        )}
        </div>
      </div>
    </div>
  )
}
