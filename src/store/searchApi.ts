import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ProfileScore {
  raw: number;
  normalized: number;
}

export interface ProfileCard {
  id: string;
  full_name: string;
  first_name: string;
  gender?: 'male' | 'female';
  headline?: string;
  summary?: string;
  picture_url?: string;
  picture_proxy_url?: string;
  location_full?: string;
  location_city?: string;
  location_country?: string;
  active_experience_title?: string;
  active_experience_company_name?: string;
  active_experience_company_logo_url?: string;
  current_experience_label?: string;
  past_experience_labels?: string[];
  total_experience_duration_months?: number;
  linkedin_url?: string;
  score?: ProfileScore;
  salesql_emails?: SalesqlEmail[];
  salesql_phones?: SalesqlPhone[];
  salesql_enriched_at?: string;
}

export interface SearchProfilesRequest {
  skills?: string;
  designation?: string;
  female_candidate?: boolean;
  location?: string[];
  company_size_ranges?: string[];
  company_categories?: string[];
  company_category_scope?: 'current' | 'past';
  min_experience?: number;
  max_experience?: number;
  page?: number;
}

export interface SearchProfilesResponse {
  profiles: ProfileCard[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  maxScore: ProfileScore;
}

export interface LocationsResponse {
  locations: string[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

export interface CompanyCategoriesResponse {
  companyCategories: string[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

export interface SalesqlEmail {
  email: string;
  type?: string;
  status?: string;
}

export interface SalesqlPhone {
  phone: string;
  type?: string;
  country_code?: string;
  is_valid?: boolean;
}

export interface EnrichProfilesRequest {
  linkedin_urls: string[];
}

export interface EnrichContactResult {
  emails: SalesqlEmail[];
  phones: SalesqlPhone[];
  cached?: boolean;
  error?: string;
}

export interface EnrichProfilesResponse {
  results: Record<string, EnrichContactResult>;
}

export interface UpdateGenderRequest {
  firstName: string;
  gender: 'male' | 'female';
}

export interface UpdateGenderResponse {
  firstName: string;
  gender: 'male' | 'female';
  matchedProfiles: number;
  openSearchUpdated: number;
}

export interface Experience {
  id?: number;
  position_title?: string;
  company_name?: string;
  company_logo_url?: string;
  company_industry?: string;
  location?: string;
  date_from?: string;
  date_to?: string;
  description?: string;
  active_experience?: boolean;
  duration_months?: number;
}

export interface Education {
  id?: number;
  institution_name?: string;
  institution_logo_url?: string;
  degree?: string;
  date_from_year?: string;
  date_to_year?: string;
}

export interface Skill {
  skill_name?: string;
}

export interface ActivityItem {
  title?: string;
  action?: string;
  activity_url?: string;
  order_in_profile?: number;
}

export interface ProfileDetail {
  [key: string]: unknown;
  id: string;
  full_name: string;
  headline?: string;
  picture_url?: string;
  picture_proxy_url?: string;
  location_full?: string;
  location_city?: string;
  location_country?: string;
  summary?: string;
  activity?: ActivityItem[];
  linkedin_url?: string;
  connections_count?: number;
  followers_count?: number;
  active_experience_title?: string;
  total_experience_duration_months?: number;
  experiences?: Experience[];
  educations?: Education[];
  skills?: Skill[];
  salesql_emails?: SalesqlEmail[];
  salesql_phones?: SalesqlPhone[];
  salesql_enriched_at?: string;
}

export const searchApi = createApi({
  reducerPath: 'searchApi',
  tagTypes: ['Profiles'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
  }),
  endpoints: (builder) => ({
    searchProfiles: builder.query<SearchProfilesResponse, SearchProfilesRequest>({
      query: (body) => ({
        url: '/search/profiles',
        method: 'POST',
        body,
      }),
      providesTags: ['Profiles'],
    }),
    getProfileDetail: builder.query<ProfileDetail, string>({
      query: (profileId) => `/search/profile/${profileId}`,
    }),
    getLocations: builder.query<LocationsResponse, { page?: number; search?: string }>({
      query: ({ page = 1, search = '' }) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        if (search.trim()) {
          params.set('search', search.trim());
        }
        return `/search/locations?${params.toString()}`;
      },
    }),
    getCompanyCategories: builder.query<
      CompanyCategoriesResponse,
      { page?: number; search?: string }
    >({
      query: ({ page = 1, search = '' }) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        if (search.trim()) {
          params.set('search', search.trim());
        }
        return `/search/company-categories?${params.toString()}`;
      },
    }),
    updateGender: builder.mutation<UpdateGenderResponse, UpdateGenderRequest>({
      query: (body) => ({
        url: '/search/profiles/gender',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Profiles'],
    }),
    enrichProfiles: builder.mutation<EnrichProfilesResponse, EnrichProfilesRequest>({
      query: (body) => ({
        url: '/search/profiles/enrich',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useSearchProfilesQuery,
  useGetProfileDetailQuery,
  useLazyGetLocationsQuery,
  useLazyGetCompanyCategoriesQuery,
  useUpdateGenderMutation,
  useEnrichProfilesMutation,
} = searchApi;
