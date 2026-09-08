import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: {
      firstName: '',
      email: '',
      foodPreference: '',
    },
  }),

  getters: {
    hasProfile: (state) => {
      return state.profile.firstName !== ''
    },
  },

  actions: {
    setProfile(firstName, email, foodPreference) {
      this.profile.firstName = firstName
      this.profile.email = email
      this.profile.foodPreference = foodPreference
    },

    logout() {
      this.profile.firstName = ''
      this.profile.email = ''
      this.profile.foodPreference = ''
    },
  },

  persist: true,
})
