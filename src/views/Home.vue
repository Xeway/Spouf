<template>
  <h1>SPOUF</h1>
  <h3>A blockchain-based app that aims to stop procrastinating by loosing money 🤪💸</h3>
</template>

<script>
// @ is an alias to /src

export default {
  beforeCreate() {
    document.body.className = "darkblue-bg";
  },
  name: 'Home'
}

</script>

<style lang="scss" scoped>

h1 {
  font-family: 'ThunderBlack', sans-serif;
  font-size: 8rem;
  color: $red;
  text-shadow:
  0 15*1px 0 $yellow,
  0 15*2px 0 $bright_blue
  ;
  animation: shadowMove 1.3s infinite;
}

h3 {
  font-size: 2em;
  color: $yellow;
  // animation: move 1.3s infinite;
}

/*
@keyframes move {
  50% {
    transform: translateY(5px);
  }
  100% {
    transform: translateY(0px);
  }
}
*/

@keyframes shadowMove {
  25% {
    text-shadow:
    0 15*2px 0 $yellow,
    0 15*3px 0 $bright_blue
    ;
  }
  50% {
    text-shadow:
    0 15*2px 0 $yellow,
    0 15*4px 0 $bright_blue
    ;
  }
  100% {
    text-shadow:
    0 15*1px 0 $yellow,
    0 15*2px 0 $bright_blue
    ;
  }
}
</style>
