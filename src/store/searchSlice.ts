import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface SearchState {
  skillsInput: string;
  designationInput: string;
  selectedLocations: string[];
  minExperienceInput: string;
  maxExperienceInput: string;
  submittedSkills: string;
  submittedDesignation: string;
  submittedLocations: string[];
  submittedMinExperience: string;
  submittedMaxExperience: string;
  hasSearched: boolean;
  currentPage: number;
  selectedProfileId: string | null;
}

const initialState: SearchState = {
  skillsInput: '',
  designationInput: '',
  selectedLocations: [],
  minExperienceInput: '',
  maxExperienceInput: '',
  submittedSkills: '',
  submittedDesignation: '',
  submittedLocations: [],
  submittedMinExperience: '',
  submittedMaxExperience: '',
  hasSearched: false,
  currentPage: 1,
  selectedProfileId: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSkillsInput(state, action: PayloadAction<string>) {
      state.skillsInput = action.payload;
    },
    setDesignationInput(state, action: PayloadAction<string>) {
      state.designationInput = action.payload;
    },
    addLocation(state, action: PayloadAction<string>) {
      if (!state.selectedLocations.includes(action.payload)) {
        state.selectedLocations.push(action.payload);
      }
    },
    removeLocation(state, action: PayloadAction<string>) {
      state.selectedLocations = state.selectedLocations.filter(
        (location) => location !== action.payload
      );
    },
    clearLocations(state) {
      state.selectedLocations = [];
    },
    setSelectedLocations(state, action: PayloadAction<string[]>) {
      state.selectedLocations = [...action.payload];
    },
    setMinExperienceInput(state, action: PayloadAction<string>) {
      state.minExperienceInput = action.payload;
    },
    setMaxExperienceInput(state, action: PayloadAction<string>) {
      state.maxExperienceInput = action.payload;
    },
    submitSearch(state) {
      state.submittedSkills = state.skillsInput.trim();
      state.submittedDesignation = state.designationInput.trim();
      state.submittedLocations = [...state.selectedLocations];
      state.submittedMinExperience = state.minExperienceInput.trim();
      state.submittedMaxExperience = state.maxExperienceInput.trim();
      state.hasSearched = true;
      state.currentPage = 1;
    },
    clearSearch(state) {
      state.skillsInput = '';
      state.designationInput = '';
      state.selectedLocations = [];
      state.minExperienceInput = '';
      state.maxExperienceInput = '';
      state.submittedSkills = '';
      state.submittedDesignation = '';
      state.submittedLocations = [];
      state.submittedMinExperience = '';
      state.submittedMaxExperience = '';
      state.hasSearched = false;
      state.currentPage = 1;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    openProfile(state, action: PayloadAction<string>) {
      state.selectedProfileId = action.payload;
    },
    closeProfile(state) {
      state.selectedProfileId = null;
    },
  },
});

export const {
  setSkillsInput,
  setDesignationInput,
  addLocation,
  removeLocation,
  clearLocations,
  setSelectedLocations,
  setMinExperienceInput,
  setMaxExperienceInput,
  submitSearch,
  clearSearch,
  setCurrentPage,
  openProfile,
  closeProfile,
} = searchSlice.actions;

export default searchSlice.reducer;
