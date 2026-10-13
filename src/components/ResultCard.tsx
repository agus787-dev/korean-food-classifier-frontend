import { BadgeCheck } from 'lucide-react'
import type { FoodClass, Prediction } from '../api/predict'

const FOOD_LABELS: Record<FoodClass, string> = {
  bibimbap: 'Bibimbap',
  fried_rice: 'Fried rice',
}

const FOOD_DESCRIPTIONS: Record<FoodClass, string> = {
  bibimbap:
    'A colorful Korean rice bowl topped with vegetables, often finished with gochujang and a sunny-side-up egg.',
  fried_rice:
    'A comforting, savory rice dish stir-fried with flavorful seasonings and a delicious mix of ingredients.',
}

interface ResultCardProps {
  prediction: Prediction
}

function ProbabilityBar({ foodClass, probability }: { foodClass: FoodClass; probability: number }) {
  const percentage = Math.round(probability * 100)
  const isWinner = foodClass === 'bibimbap'

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className={`font-medium ${isWinner ? 'text-foreground' : 'text-muted'}`}>
          {FOOD_LABELS[foodClass]}
        </span>
        <span className="font-semibold tabular-nums text-foreground">{percentage}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={`${FOOD_LABELS[foodClass]} probability`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        className="h-2.5 overflow-hidden rounded-full bg-border/70"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${
            isWinner ? 'bg-accent' : 'bg-olive/70'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function ResultCard({ prediction }: ResultCardProps) {
  const predictedLabel = FOOD_LABELS[prediction.predicted_class]

  return (
    <section className="mt-6 rounded-2xl border border-border bg-background/70 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#eaf0e3] text-olive dark:bg-[#303a2a]">
          <BadgeCheck aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
            Looks like
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight">{predictedLabel}</h3>
          <p className="mt-1 text-sm text-muted">
            {Math.round(prediction.confidence * 100)}% model confidence
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">
        {FOOD_DESCRIPTIONS[prediction.predicted_class]}
      </p>
      <div className="mt-5 border-t border-border pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
          Class probabilities
        </h4>
        <ProbabilityBar foodClass="bibimbap" probability={prediction.probabilities.bibimbap} />
        <ProbabilityBar foodClass="fried_rice" probability={prediction.probabilities.fried_rice} />
      </div>
    </section>
  )
}
