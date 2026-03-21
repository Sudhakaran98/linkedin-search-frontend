import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface SearchState {
  /** Live input values (controlled inputs) */
  skillsInput: string;
  designationInput: string;
  /** Values actually submitted – used as query keys */
  submittedSkills: string;
  submittedDesignation: string;
  /** Whether a search has been submitted at least once */
  hasSearched: boolean;
  /** Currently selected 1 000-profile subset (0-indexed) */
  activeSubset: number;
  /** Current page within the active subset */
  currentPage: number;
  /** Profile ID whose detail modal is open (null = closed) */
  selectedProfileId: string | null;
}

const initialState: SearchState = {
  skillsInput: '',
  designationInput: '',
  submittedSkills: '',
  submittedDesignation: '',
  hasSearched: false,
  activeSubset: 0,
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
    /** Commit the input values and reset pagination */
    submitSearch(state) {
      state.submittedSkills      = state.skillsInput;
      state.submittedDesignation = state.designationInput;
      state.hasSearched          = true;
      state.activeSubset         = 0;
      state.currentPage          = 1;
    },
    setActiveSubset(state, action: PayloadAction<number>) {
      state.activeSubset = action.payload;
      state.currentPage  = 1;           // reset to page 1 when switching subset
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
  submitSearch,
  setActiveSubset,
  setCurrentPage,
  openProfile,
  closeProfile,
} = searchSlice.actions;

export default searchSlice.reducer;
