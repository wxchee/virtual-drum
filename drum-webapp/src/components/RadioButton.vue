<template>
  <div class="radio-button">
    <div :class="optionClass(opt)" v-for="(opt, i) in options" :key="i" @click="() => onSelect(opt)">{{ opt }}</div>
  </div>
</template>

<script>

export default {
  props: ['modelValue','options'],
  emits: ['update:modelValue'],
  setup (props, {emit}) {
    const optionClass = opt => ({
      'radio-button__option': true,
      'checked': opt === props.modelValue
    })

    const onSelect = newOpt => emit('update:modelValue', newOpt)
    
    return {optionClass, onSelect}
  }
}
</script>

<style lang="scss">
.radio-button {
  display: inline-flex;
  background-color: rgba(white, 0.1);
  border-radius: 6px;
  box-sizing: border-box;


  .radio-button__option {
    display: inline-block;
    background-color: rgba(black, 0.1);
    border-radius: 20px;
    border: 1px solid #ccc;
    cursor: pointer;
    color: #FFFFFF;
    

    &.checked {
      background-color: rgba(black, 0.7);
    }

    &:hover {
      background-color: rgba(black, 0.5);
    }
  }
}
</style>