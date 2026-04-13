<template>
  <div class="insurance">
    <div class="steps">
      <div class="steps__item">
        <div class="steps__item-circle">1</div>
        <span class="steps__item-text">Марка / модель ТС</span>
      </div>

      <div class="steps__item">
        <div class="steps__item-circle">2</div>
        <span class="steps__item-text">Данные ТС</span>
      </div>

      <div class="steps__item">
        <div class="steps__item-circle">3</div>
        <span class="steps__item-text">Водители</span>
      </div>

      <div class="steps__item">
        <div class="steps__item-circle">4</div>
        <span class="steps__item-text">Рассчет</span>
      </div>
    </div>

    <div class="insurance__content">
      <button
        v-if="isShowNextStepBtn()"
        type="button"
        class="insurance__content-next-btn"
      >
        Далее
      </button>
      <component
        :is="currentComponent"
        @make-model-value="(value: string) => makeModelValue = value"
      />
    </div>
  </div>
</template>

<script setup lang='ts'>
import CarMakeModel from "@/components/Insurance/CarMakeModel.vue"
import { ref, computed } from "vue"

const makeModelValue = ref<string>('')

const currentStep = ref(1)

const steps = [
  { title: 'Марка / модель ТС', component: CarMakeModel, needConfirm: true }
  // { title: 'Данные ТС', component: CarData, needConfirm: true },
  // { title: 'Водители', component: Drivers, needConfirm: true },
  // { title: 'Расчет', component: Calculation, needConfirm: false }
]

const currentComponent = computed(() => {
  return steps[currentStep.value - 1]?.component
})

function isShowNextStepBtn () {
  if (makeModelValue.value !== '' && currentStep.value === 1) {
    return true
  } else {
    return false
  }
}

</script>

<style lang="scss" scoped>
.insurance {
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 900px;
    margin-top: 100px;
    background-color: #fff;
    border-radius: 10px;
    margin-bottom: 150px;

    &-next-btn {
      border: none;
      margin: 30px 20px 0 0;
      padding: 7px 25px;
      background-color: #528a52;
      color: #fff;
      border-radius: 20px;
      align-self: flex-end;

      &:hover {
        opacity: 0.8;
        transition-duration: 0.4s;
      }
    }
  }
}

.steps {
  --margin-step: 120px;

  display: flex;

  &__item {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &:not(:last-child) {
      margin-right: var(--margin-step);
    }
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      width: calc(var(--margin-step) + 2px);
      height: 2px;
      background-color: var(--color-middle-blue);
    }

    &-circle {
      width: 40px;
      height: 40px;
      color: #504f4f;
      border: 2px solid var(--color-middle-blue);
      border-radius: 50%;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &-text {
      position: absolute;
      top: 110%;
      color: #504f4f;
      white-space: nowrap;
    }
  }
}
</style>
