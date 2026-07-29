<template>
  <aside class="aboutApp">
    <details class="aboutApp__details" name="faq">
      <summary>Для кого создано приложение "Автоподборщик"&nbsp;?</summary>
      <p class="aboutApp__hidden-text">
        Для специалистов по подбору автомобилей и для всех, кто хочет вести личную подборку понравившихся машин.
      </p>
    </details>

    <details class="aboutApp__details" name="faq">
      <summary>Как отметить машину проданной&nbsp;?</summary>
      <p class="aboutApp__hidden-text">
        Нажмите на карточку автомобиля. Под блоком «Описание» появится кнопка «Машину продали».
        При клике откроется окно, в котором нужно указать сумму, за которую продан автомобиль.
        После ввода суммы нажмите на кнопку «Добавить автомобиль в проданные».
      </p>
    </details>

    <details class="aboutApp__details" name="faq">
      <summary>Приложение бесплатное&nbsp;?</summary>
      <p class="aboutApp__hidden-text">
        Да, приложение полностью бесплатно — вы можете пользоваться им без ограничений.
      </p>
    </details>

    <details class="aboutApp__details" name="faq">
      <summary>Где хранится информация об автомобилях и фотографии&nbsp;?</summary>
      <p class="aboutApp__hidden-text">
        Для хранения информации об автомобилях используется база данных "Firebase",
        фотографии хранятся в базе данных "ImgBB".
      </p>
    </details>

    <details class="aboutApp__details" name="faq">
      <summary>Какие языки и технологии использованы для создания проекта&nbsp;?</summary>
      <p class="aboutApp__hidden-text">
        • &ensp;HTML <br>
        • &ensp;SCSS <br>
        • &ensp;Адаптивная верстка <br>
        • &ensp;TypeScript <br>
        • &ensp;Vue(Composition API) <br>
        • &ensp;Vite <br>
        • &ensp;Pinia <br>
        • &ensp;npm <br>
        • &ensp;Git <br>
        • &ensp;REST API <br>
        • &ensp;Router <br>
      </p>
    </details>
  </aside>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
// Used as mask images below, so only their alpha matters — the visible colour
// comes from --faq-marker.
$marker-plus: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 5v14M5 12h14'/%3E%3C/svg%3E");
$marker-minus: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h14'/%3E%3C/svg%3E");

.aboutApp {
  // Pinned 13px above MainPageView's round "?"/"×" toggle (its `top` is 90px at
  // this width) so the toggle sits fully inside this corner instead of
  // straddling the edge. Tracks the button's per-breakpoint tops below.
  --faq-top: 77px;
  // Fixed so the panel stays with the toggle, which is fixed too, while the
  // listings scroll underneath. Taller content scrolls inside the panel rather
  // than off-screen.
  position: fixed;
  z-index: 10000;
  right: 0;
  width: 40%;
  height: fit-content;
  top: var(--faq-top);
  max-height: calc(100vh - var(--faq-top) - var(--space-5));
  overflow-y: auto;
  // Top inset clears that toggle and leaves a 25px gap below it, so the first
  // FAQ no longer butts against the panel edge.
  padding: var(--space-20) var(--space-5) var(--space-5);
  // FAQ copy and markers sit at muted ink rather than the near-black --ink.
  color: var(--ink-muted);
  --faq-marker: var(--ink-muted);
  background-color: var(--surface-2);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);

  &__details {
    position: relative;
    padding: var(--space-2) var(--space-3);
    background-color: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    &:not(:first-child) {
      margin-top: var(--space-2);
    }
  }

  &__hidden-text {
    padding-left: var(--space-1);
    margin-top: var(--space-2);
    font-size: var(--text-sm);
  }
}

details > summary {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;


  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }

  &::after {
    content: "";
    position: absolute;
    right: var(--space-3);
    display: inline-block;
    min-width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-left: var(--space-2);
    // Masked instead of used as a background image: a data-URI SVG is its own
    // document, so the glyph could not inherit a themeable colour. As a mask it
    // takes its colour from background-color.
    background-color: var(--faq-marker);
    mask-image: $marker-plus;
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center;
    -webkit-mask-image: $marker-plus;
    -webkit-mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    transition: transform 0.2s ease;
  }
}

details > summary::-webkit-details-marker {
  display: none;
}

details[open] > summary::after {
  mask-image: $marker-minus;
  -webkit-mask-image: $marker-minus;
}

summary {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: var(--space-1);
  // Clears the absolutely positioned +/− marker (20px wide, 12px from the edge).
  padding-right: 28px;
  font-size: var(--text-sm);
  font-weight: 600;
}

// On dark cards muted ink reads too dim for a 1.5px glyph, so the markers go
// white. Mirrors the two dark-theme selectors used in _root-variables.scss.
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .aboutApp {
    --faq-marker: var(--on-primary);
  }
}

:root[data-theme='dark'] .aboutApp {
  --faq-marker: var(--on-primary);
}

@media (max-width: 1023px) {
  .aboutApp {
    width: 60%;
  }
}

// Tracks MainPageView's button, which drops to top: 168px below the wrapped
// mobile header.
@media (max-width: 767px) {
  .aboutApp {
    --faq-top: 155px;
    width: 70%;
  }
}

@media (max-width: 430px) {
  summary, .aboutApp__hidden-text {
    font-size: var(--text-xs);
  }
}
</style>
