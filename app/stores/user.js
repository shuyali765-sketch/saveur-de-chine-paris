import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    authReady: false,
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
      if (foodPreference !== undefined) {
        this.profile.foodPreference = foodPreference
      }
    },

    clearAuthProfile() {
      this.profile.firstName = ''
      this.profile.email = ''
    },

    setAuthReady(value) {
      this.authReady = value
    },

    logout() {
      this.clearAuthProfile()
    },
  },
})
