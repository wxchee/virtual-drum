<template>
  <div class="device-panel">
    <div class="device-panel-container" :class="{inView: inView}" @mouseover="() => inView = true" @mouseout="() => inView = false">
      <div class="device-panel__content">
        <GenericButton class="device-panel__button connected" v-for="(d, i) in connectedDevices" :key="i"
          @click="() => disconnectBTDevice(d)">{{d.name}}</GenericButton>
        <GenericButton class="device-panel__button " v-if="connectedDevices.length < 2"
          :style="{pointerEvents: connectInProgress ? 'none' : 'all', opacity: connectInProgress ? 0.5 : 1}"
          @click="clickConnectButton">{{connectInProgress ? 'connecting...' : '&#43; Add peripheral'}}</GenericButton>
      </div>
      <div class="device-panel__entry">
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 20 20" enable-background="new 0 0 20 20" xml:space="preserve">
        <polyline fill="none" stroke="#D1D3D4" stroke-width="1.5" stroke-miterlimit="10" points="6.35,6.04 13.65,13.34 10.14,16.85 
          10.14,3.15 13.63,6.65 6.67,13.62 "/></svg>
          <span>{{ connectedDevices.length }}</span>
        </div>
    </div>
    
  </div>
</template>

<script>
import GenericButton from '@/components/GenericButton.vue'
import {connectBTDevice, disconnectBTDevice, getConnectedDevices} from '@/js/device'
import { computed, ref } from 'vue'



export default {
  components: {GenericButton},
  setup() {
    const inView = ref(false)
    const connectInProgress = ref(false)
    const connectedDevices = computed(() => getConnectedDevices())

    const clickConnectButton = () => {
      connectInProgress.value = true
      connectBTDevice(() => {
        connectInProgress.value = false
        inView.value = false
      })
    }
    
    return {connectInProgress, clickConnectButton, disconnectBTDevice, connectedDevices, inView}
  }
}
</script>

<style lang="scss">
.device-panel {
  position: fixed;
  top: 10px;
  left: 0;

  .device-panel-container {
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    transform: translateX(calc(-100% + 32px));
    display: flex;
    align-items: flex-start;
    transition: transform 0.2s;

    &.inView {
      transform: translateX(0);

      .device-panel__entry {
        box-shadow: 3px 1px 2px #000000;
      }
    }

    .device-panel__entry {
      left: 0;
      transform: translateY(15px);
      color: #FFFFFF;
      line-height: 1;
      width: 30px;
      height: 35px;
      padding-right: 5px;
      background-color:#0082FC;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      cursor: pointer;
      pointer-events: none;
      transition: filter 0.2s;

      &:hover {
        filter:brightness(0.8);
      }

      & > * {
        user-select: none;
        pointer-events: none;
      }
      
      svg {
        width: 20px;
      }

      span {
        font-size: 15px;
      }
    }

    .device-panel__content {
      padding: 18px 35px 18px 42px;
      background-color:#002b53;
      border-right: 3px solid #0082FC;

      & > * {
        position: relative;
        text-align: center;
        vertical-align: middle;
        line-height: 1;
        white-space: nowrap;
        transition: background-color 0.15s, border 0.15s;
        &:not(:last-child) {
          margin-bottom: 10px;
        }

        &.connected {
          position: relative;
          border: 3px solid #0063c0;
          background-color: #0082FC;
          box-sizing: border-box;

          &:hover {
            border: 3px solid rgb(62, 62, 62);
            background-color: rgb(97, 97, 97);
            // opacity: 0.8;
            color: transparent;

            &::after {
              display: block;
              content: 'Disconnect';
              position: absolute;
              color: #FFFFFF;
              font-size: 20px;
              font-family: sans-serif;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 100%;
              height: 100%;
              line-height: 32px;
            }
          }
        }
      }
    }
  }

  
  
}
</style>