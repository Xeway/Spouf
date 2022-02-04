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
  beforeCreate: function() {
    document.body.classList.add("home");
  },
  name: 'Home'
}
</script>

<style lang="scss" scoped>

.home {
  background-color: $blue;
}

h1 {
  font-family: 'Anton', sans-serif;
  font-size: 8rem;
}

h3 {
  font-size: 2em;
}
</style>
