<template>
  <h1>SPOUF</h1>
  <h3>A blockchain-based app that aims to stop procrastinating by loosing money 🤪💸</h3>
</template>

<script>
// @ is an alias to /src

export default {
  data() {
  },
  methods: {
  },
  beforeCreate() {
    document.body.className = "home";
  },
  name: 'Home'
}

</script>

<style lang="scss">

.home {
  background-color: $dark_blue;
}
</style>

<style lang="scss" scoped>

h1 {
  font-family: 'Anton', sans-serif;
  font-size: 8rem;
  color: $red;
  text-shadow:
  0 15*1px 0 $yellow,
  0 15*2px 0 $bright_blue
  ;
}

h3 {
  font-size: 2em;
  color: $yellow;
}
</style>
