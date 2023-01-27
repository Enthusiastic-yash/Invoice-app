<script setup>
import { toRef } from "vue";
import { useField } from "vee-validate";

const props = defineProps({
  label: {
    type: String,
    required: true,
    default: "",
  },
  type: {
    type: [String, Number],
    default: "",
  },
  name: {
    type: String,
    required: true,
    default: "",
  },

  value: {
    type: [String, Number],
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const name = toRef(props, "name");
const {
  value: inputValue,
  errorMessage,
  meta,
  handleChange,
} = useField(name, undefined, {
  initialValue: props.value,
});
</script>
<template>
  <div>
    <div class="mt-3">
      <label :for="name" class="text-white">{{ label }}</label>
    </div>

    <input
      :class="{ 'bg-red-200': errorMessage }"
      :id="name"
      :name="name"
      :type="type"
      :value="inputValue"
      :disabled="disabled"
      @input="handleChange"
      class="p-2 rounded-md outline-none w-full bg-white"
    />
    <span
      v-show="errorMessage || meta.valid"
      class="text-white flex"
      :class="{ 'text-red-500': errorMessage }"
      >{{ errorMessage }}
    </span>
  </div>
</template>
