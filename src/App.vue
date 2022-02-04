<template>
  <router-view/>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');

@font-face {
    font-family: 'ranyregular';
    src: url('../public/fonts/Rany/rany-webfont.woff2') format('woff2'),
         url('../public/fonts/Rany/rany-webfont.woff') format('woff');
    font-weight: normal;
    font-style: normal;

}
@font-face {
    font-family: 'ranybold';
    src: url('../public/fonts/Rany/rany-bold-webfont.woff2') format('woff2'),
         url('../public/fonts/Rany/rany-bold-webfont.woff') format('woff');
    font-weight: normal;
    font-style: normal;

}
@font-face {
    font-family: 'ranylight';
    src: url('../public/fonts/Rany/rany-light-webfont.woff2') format('woff2'),
         url('../public/fonts/Rany/rany-light-webfont.woff') format('woff');
    font-weight: normal;
    font-style: normal;

}
@font-face {
    font-family: 'ranymedium';
    src: url('../public/fonts/Rany/rany-medium-webfont.woff2') format('woff2'),
         url('../public/fonts/Rany/rany-medium-webfont.woff') format('woff');
    font-weight: normal;
    font-style: normal;

}

@font-face {
    font-family: 'Thunder';
    src: url('../public/fonts/THUNDER/Thunder-BoldLC.woff') format('woff'), /* Modern Browsers */
         url('../public/fonts/THUNDER/Thunder-BoldLC.woff2') format('woff2'), /* Modern Browsers */
         url('../public/fonts/THUNDER/Thunder-BoldLC.ttf') format('truetype'); /* Safari, Android, iOS */
             font-style: normal;
    font-weight: bold;
    text-rendering: optimizeLegibility;
}

#app {
  font-family: 'ranyregular', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
