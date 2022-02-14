<template>
    <nav class="buttons">
        <div class="invisible-div"></div>
        <div class="nav">
            <router-link to="/">Home</router-link>
            <router-link to="/about">About</router-link>
            <router-link to="/working">How it works</router-link>
            <router-link to="/contact">Contact</router-link>
        </div>
        <router-link to="/app" class="app-button">App</router-link>
    </nav>
</template>

<script>
export default {
    name: "Nav"
}
</script>

<style lang="scss" scoped>
    .buttons {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 1.4rem;
        font-family: "ranylight";
        margin: 0 1rem 0 1rem;

        .nav {
            display: flex;
            align-items: center;

            & > * {
                margin: 0 1rem 0 1rem;
                background-color: $bright_blue;
                border-radius: 1rem;
                height: 3rem;
                width: auto;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 0 1rem 0 1rem;

                &:hover {
                    box-shadow: 5px 5px 0 $yellow;
                }
            }
        }

        .app-button {
            border-radius: 1rem;
            height: 3rem;
            width: 6rem;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 1rem 0 1rem;
            background-color: $red;
            font-family: "ranymedium";

            &:hover {
                box-shadow: 5px 5px 0 $yellow;
            }
        }

        .invisible-div {
            @extend .app-button;
            visibility: hidden;
        }
    }
    a {
        color: $dark_blue;
        text-decoration: none;
    }
</style>
