<template>
  <div class="calc">
    <BaseSelect
      class="calc__region"
      label="Регион регистрации ТС"
      placeholder="Выберите регион"
      :options="regions"
      v-model="regionValue"
    />

    <Transition name="reveal">
      <div v-if="isReadyToCalculate" class="calc__result">
        <div class="calc__coeffs">
          <div
            v-for="c in coefficients"
            :key="c.key"
            class="calc__chip"
            :class="`calc__chip--${direction(c.value)}`"
          >
            <span class="calc__chip-head">
              <span class="calc__chip-key">{{ c.key }}</span>
              <component :is="directionIcon(c.value)" :size="15" class="calc__chip-icon" />
            </span>
            <span class="calc__chip-label">{{ c.label }}</span>
            <span class="calc__chip-value mono">×{{ c.value }}</span>
          </div>
        </div>

        <div class="calc__total">
          <div class="calc__total-meta">
            <span class="calc__total-label">Стоимость полиса ОСАГО</span>
            <span class="calc__total-base">
              Базовый тариф <b class="mono">{{ formatNumber(baseRate) }} ₽</b>
            </span>
          </div>
          <div class="calc__total-price">
            <span class="calc__total-amount mono">{{ formatNumber(Math.round(displayPrice)) }}</span>
            <span class="calc__total-currency">₽</span>
          </div>
        </div>

        <p class="calc__note">
          Расчёт приблизительный и не является публичной офертой. Итоговая стоимость полиса
          рассчитывается страховой компанией.
        </p>
      </div>

      <p v-else class="calc__hint">
        Заполните данные ТС и водителей на предыдущих шагах, чтобы увидеть расчёт стоимости.
      </p>
    </Transition>
  </div>
</template>

<script setup lang='ts'>
import { ref, computed } from "vue"
import { TrendingUp, TrendingDown, Minus } from "@lucide/vue"
import { useTransition, TransitionPresets, useMediaQuery } from "@vueuse/core"
import BaseSelect from "@/components/ui/BaseSelect.vue"
import { useFormatters } from "@/composables/formatters.ts"
import {
  useInsuranceCalculation,
  REGIONS,
  type CarCategory,
  type DriversMode,
  type InsuranceDriver
} from "@/composables/insuranceCalculation.ts"

const props = defineProps<{
  category: CarCategory | ''
  enginePower: number | null
  mode: DriversMode
  drivers: InsuranceDriver[]
}>()

const { formatNumber } = useFormatters()

const regions = REGIONS
const regionValue = ref(regions[0]?.value ?? 'other')

const category = computed(() => props.category)
const enginePower = computed(() => props.enginePower)
const mode = computed(() => props.mode)
const drivers = computed(() => props.drivers)

const {
  baseRate,
  territoryCoefficient,
  ageExperienceCoefficient,
  bonusMalusCoefficient,
  unlimitedDriversCoefficient,
  powerCoefficient,
  isReadyToCalculate,
  totalPrice
} = useInsuranceCalculation(category, enginePower, regionValue, mode, drivers)

const coefficients = computed(() => [
  { key: 'КТ', label: 'Территория', value: territoryCoefficient.value },
  { key: 'КВС', label: 'Возраст и стаж', value: ageExperienceCoefficient.value },
  { key: 'КБМ', label: 'Бонус-малус', value: bonusMalusCoefficient.value },
  { key: 'КО', label: 'Без ограничений', value: unlimitedDriversCoefficient.value },
  { key: 'КМ', label: 'Мощность', value: powerCoefficient.value }
])

function direction(value: number): 'up' | 'down' | 'flat' {
  if (value > 1) return 'up'
  if (value < 1) return 'down'
  return 'flat'
}
function directionIcon(value: number) {
  const d = direction(value)
  return d === 'up' ? TrendingUp : d === 'down' ? TrendingDown : Minus
}

// Odometer-style count-up on the final price; instant if reduced motion.
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const displayPrice = useTransition(totalPrice, {
  duration: reducedMotion.value ? 0 : 850,
  transition: TransitionPresets.easeOutCubic
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.calc {
  width: 100%;

  &__region {
    max-width: 360px;
  }

  &__result {
    margin-top: var(--space-8);
  }

  &__coeffs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: var(--space-3);
  }

  &__chip {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--surface-2);

    &--up {
      border-color: color-mix(in srgb, var(--warning) 45%, var(--border));
      background: var(--warning-soft);
    }
    &--down {
      border-color: color-mix(in srgb, var(--success) 40%, var(--border));
      background: var(--success-soft);
    }
  }
  &__chip-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__chip-key {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--ink);
  }
  &__chip-icon {
    .calc__chip--up & { color: var(--warning); }
    .calc__chip--down & { color: var(--success); }
    .calc__chip--flat & { color: var(--ink-faint); }
  }
  &__chip-label {
    font-size: var(--text-xs);
    color: var(--ink-muted);
  }
  &__chip-value {
    margin-top: var(--space-1);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--ink);
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-5);
    flex-wrap: wrap;
    margin-top: var(--space-6);
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    color: var(--on-primary);
    background:
      radial-gradient(120% 140% at 100% 0%, color-mix(in srgb, var(--accent) 55%, transparent), transparent 60%),
      linear-gradient(135deg, var(--primary), var(--primary-hover));
    box-shadow: var(--shadow-primary);
  }
  &__total-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  &__total-label {
    font-size: var(--text-base);
    font-weight: 600;
  }
  &__total-base {
    font-size: var(--text-sm);
    opacity: 0.8;
    b { font-weight: 700; }
  }
  &__total-price {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
  }
  &__total-amount {
    font-size: var(--text-4xl);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  &__total-currency {
    font-size: var(--text-2xl);
    font-weight: 600;
    opacity: 0.85;
  }

  &__note {
    margin: var(--space-5) 0 0;
    font-size: var(--text-xs);
    color: var(--ink-faint);
  }

  &__hint {
    margin: var(--space-8) 0 0;
    padding: var(--space-5);
    background: var(--surface-2);
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius-md);
    color: var(--ink-muted);
    text-align: center;
  }

  @include mobile {
    &__region {
      max-width: 100%;
    }
    &__total {
      flex-direction: column;
      align-items: flex-start;
    }
    &__total-amount {
      font-size: var(--text-3xl);
    }
  }
}

.reveal-enter-active {
  transition: opacity var(--dur-slow) var(--ease), transform var(--dur-slow) var(--ease-out);
}
.reveal-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
</style>
