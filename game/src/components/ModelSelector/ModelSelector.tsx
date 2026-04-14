import './ModelSelector.css'

interface CatBreedCard {
  id: string
  name: string
  realModel: string
  traits: string
  speed: number
  intelligence: number
  ascii: string
}

interface ModelSelectorProps {
  selectedModel: string | null
  onSelect: (modelId: string) => void
  disabled?: boolean
}

const CAT_BREEDS: CatBreedCard[] = [
  { id: 'quickpaw', name: 'Quickpaw (Siamese)', realModel: 'Fast model', traits: 'Fast, cheap, good for simple tasks', speed: 5, intelligence: 2, ascii: '🐱' },
  { id: 'thinker', name: 'Thinker (Maine Coon)', realModel: 'Reasoning model', traits: 'Slower, excellent at complex logic', speed: 2, intelligence: 5, ascii: '🦁' },
  { id: 'speedster', name: 'Speedster (Abyssinian)', realModel: 'Balanced model', traits: 'Good all-rounder', speed: 4, intelligence: 4, ascii: '🐈' },
  { id: 'bigbrain', name: 'Big Brain (Persian)', realModel: 'Frontier model', traits: 'Most capable, slowest, most expensive', speed: 1, intelligence: 5, ascii: '🧠' },
]

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="model-selector__stat">
      <span className="model-selector__stat-label">{label}</span>
      <span className="model-selector__stat-dots">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`model-selector__dot${i < value ? ' model-selector__dot--filled' : ''}`}
          />
        ))}
      </span>
    </div>
  )
}

export function ModelSelector({ selectedModel, onSelect, disabled = false }: ModelSelectorProps) {
  return (
    <div
      className={`model-selector${disabled ? ' model-selector--disabled' : ''}`}
      data-testid="model-selector"
    >
      {CAT_BREEDS.map((breed) => {
        const isSelected = selectedModel === breed.id

        return (
          <button
            key={breed.id}
            className={`model-selector__card${isSelected ? ' model-selector__card--selected' : ''}`}
            onClick={() => onSelect(breed.id)}
            disabled={disabled}
            data-testid={`model-card-${breed.id}`}
          >
            <div className="model-selector__emoji">{breed.ascii}</div>
            <div className="model-selector__name">{breed.name}</div>
            <div className="model-selector__real-model">{breed.realModel}</div>
            <div className="model-selector__traits">{breed.traits}</div>
            <div className="model-selector__stats">
              <StatBar label="SPD" value={breed.speed} />
              <StatBar label="INT" value={breed.intelligence} />
            </div>
          </button>
        )
      })}
    </div>
  )
}
