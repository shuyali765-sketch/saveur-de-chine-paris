import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    authReady: false,
    profile: {
      firstName: '',
      email: '',
      foodPreference: '',
    },
    favoriteNames: [],
  }),

  getters: {
    hasProfile: (state) => {
      return state.profile.firstName !== ''
    },

    isFavorite: (state) => {
      return (name) => state.favoriteNames.includes(name)
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

    toggleFavorite(name) {
      const index = this.favoriteNames.indexOf(name)

      if (index === -1) {
        this.favoriteNames.push(name)
      }
      else {
        this.favoriteNames.splice(index, 1)
      }
    },
  },

  persist: {
    pick: ['favoriteNames'],
  },
})
