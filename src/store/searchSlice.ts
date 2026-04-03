import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface SearchState {
  skillsInput: string;
  designationInput: string;
  selectedLocations: string[];
  selectedCompanySizeRanges: string[];
  selectedCompanyCategories: string[];
  companyCategoryScope: 'current' | 'past';
  minExperienceInput: string;
  maxExperienceInput: string;
  femaleCandidate: boolean;
  submittedSkills: string;
  submittedDesignation: string;
  submittedLocations: string[];
  submittedCompanySizeRanges: string[];
  submittedCompanyCategories: string[];
  submittedCompanyCategoryScope: 'current' | 'past';
  submittedMinExperience: string;
  submittedMaxExperience: string;
  submittedFemaleCandidate: boolean;
  hasSearched: boolean;
  currentPage: number;
  selectedProfileId: string | null;
}

const initialState: SearchState = {
  skillsInput: '',
  designationInput: '',
  selectedLocations: [],
  selectedCompanySizeRanges: [],
  selectedCompanyCategories: [],
  companyCategoryScope: 'current',
  minExperienceInput: '',
  maxExperienceInput: '',
  femaleCandidate: false,
  submittedSkills: '',
  submittedDesignation: '',
  submittedLocations: [],
  submittedCompanySizeRanges: [],
  submittedCompanyCategories: [],
  submittedCompanyCategoryScope: 'current',
  submittedMinExperience: '',
  submittedMaxExperience: '',
  submittedFemaleCandidate: false,
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
    addCompanySizeRange(state, action: PayloadAction<string>) {
      if (!state.selectedCompanySizeRanges.includes(action.payload)) {
        state.selectedCompanySizeRanges.push(action.payload);
      }
    },
    removeCompanySizeRange(state, action: PayloadAction<string>) {
      state.selectedCompanySizeRanges = state.selectedCompanySizeRanges.filter(
        (range) => range !== action.payload
      );
    },
    clearCompanySizeRanges(state) {
      state.selectedCompanySizeRanges = [];
    },
    setSelectedCompanySizeRanges(state, action: PayloadAction<string[]>) {
      state.selectedCompanySizeRanges = [...action.payload];
    },
    addCompanyCategory(state, action: PayloadAction<string>) {
      if (!state.selectedCompanyCategories.includes(action.payload)) {
        state.selectedCompanyCategories.push(action.payload);
      }
    },
    removeCompanyCategory(state, action: PayloadAction<string>) {
      state.selectedCompanyCategories = state.selectedCompanyCategories.filter(
        (category) => category !== action.payload
      );
    },
    clearCompanyCategories(state) {
      state.selectedCompanyCategories = [];
    },
    setSelectedCompanyCategories(state, action: PayloadAction<string[]>) {
      state.selectedCompanyCategories = [...action.payload];
    },
    setCompanyCategoryScope(state, action: PayloadAction<'current' | 'past'>) {
      state.companyCategoryScope = action.payload;
    },
    setMinExperienceInput(state, action: PayloadAction<string>) {
      state.minExperienceInput = action.payload;
    },
    setMaxExperienceInput(state, action: PayloadAction<string>) {
      state.maxExperienceInput = action.payload;
    },
    setFemaleCandidate(state, action: PayloadAction<boolean>) {
      state.femaleCandidate = action.payload;
    },
    submitSearch(state) {
      state.submittedSkills = state.skillsInput.trim();
      state.submittedDesignation = state.designationInput.trim();
      state.submittedLocations = [...state.selectedLocations];
      state.submittedCompanySizeRanges = [...state.selectedCompanySizeRanges];
      state.submittedCompanyCategories = [...state.selectedCompanyCategories];
      state.submittedCompanyCategoryScope = state.companyCategoryScope;
      state.submittedMinExperience = state.minExperienceInput.trim();
      state.submittedMaxExperience = state.maxExperienceInput.trim();
      state.submittedFemaleCandidate = state.femaleCandidate;
      state.hasSearched = true;
      state.currentPage = 1;
    },
    clearSearch(state) {
      state.skillsInput = '';
      state.designationInput = '';
      state.selectedLocations = [];
      state.selectedCompanySizeRanges = [];
      state.selectedCompanyCategories = [];
      state.companyCategoryScope = 'current';
      state.minExperienceInput = '';
      state.maxExperienceInput = '';
      state.femaleCandidate = false;
      state.submittedSkills = '';
      state.submittedDesignation = '';
      state.submittedLocations = [];
      state.submittedCompanySizeRanges = [];
      state.submittedCompanyCategories = [];
      state.submittedCompanyCategoryScope = 'current';
      state.submittedMinExperience = '';
      state.submittedMaxExperience = '';
      state.submittedFemaleCandidate = false;
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
  addCompanySizeRange,
  removeCompanySizeRange,
  clearCompanySizeRanges,
  setSelectedCompanySizeRanges,
  addCompanyCategory,
  removeCompanyCategory,
  clearCompanyCategories,
  setSelectedCompanyCategories,
  setCompanyCategoryScope,
  setMinExperienceInput,
  setMaxExperienceInput,
  setFemaleCandidate,
  submitSearch,
  clearSearch,
  setCurrentPage,
  openProfile,
  closeProfile,
} = searchSlice.actions;

export default searchSlice.reducer;
