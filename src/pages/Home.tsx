import React, { useState, useEffect } from "react";
import { Search, Loader2, Database, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { useGetSearchCount, useSearchProfiles } from "@workspace/api-client-react";
import { ProfileCard } from "@/components/ProfileCard";
import { ProfileDetailDialog } from "@/components/ProfileDetailDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import clsx from "clsx";

interface SearchState {
  skills: string;
  designation: string;
}

export default function Home() {
  const [skillsInput, setSkillsInput] = useState("");
  const [designationInput, setDesignationInput] = useState("");
  
  const [activeSearch, setActiveSearch] = useState<SearchState | null>(null);
  const [activeSubset, setActiveSubset] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // 1. Fetch count (only when activeSearch is set)
  const { 
    data: countData, 
    isLoading: countLoading, 
    error: countError 
  } = useGetSearchCount(
    { skills: activeSearch?.skills, designation: activeSearch?.designation }, 
    { query: { enabled: !!activeSearch } }
  );

  // 2. Fetch profiles for current subset & page
  const { 
    data: profilesData, 
    isLoading: profilesLoading,
    isFetching: profilesFetching
  } = useSearchProfiles(
    { 
      skills: activeSearch?.skills, 
      designation: activeSearch?.designation,
      subset: activeSubset,
      page: currentPage
    },
    { 
      query: { 
        enabled: !!activeSearch && countData != null,
        // Keep previous data while fetching next page for smoother UX
        placeholderData: (prev) => prev 
      } 
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillsInput.trim() && !designationInput.trim()) return;
    
    setActiveSearch({
      skills: skillsInput.trim(),
      designation: designationInput.trim()
    });
    setActiveSubset(0);
    setCurrentPage(1);
  };

  const handleSubsetChange = (subsetIndex: number) => {
    setActiveSubset(subsetIndex);
    setCurrentPage(1);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const totalPages = profilesData?.totalPages || 0;
  const hasResults = countData && countData.total > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Hero Header Area */}
      <header className="relative pt-24 pb-32 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Network background" 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20 backdrop-blur-md">
            <Database className="w-4 h-4" />
            <span>AI-Powered Talent Discovery</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold text-foreground tracking-tight mb-6">
            Find the perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">candidate</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
            Search across millions of professional profiles using advanced skills matching and contextual ranking algorithms.
          </p>

          <div className="glass-panel max-w-4xl mx-auto rounded-3xl p-3 sm:p-4">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <Input 
                  placeholder="Skills (e.g. java, spring, react...)" 
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/50 border-white/20 hover:bg-white/80 focus:bg-white text-lg transition-all shadow-inner focus-visible:ring-2 focus-visible:ring-primary/50"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                />
              </div>
              <div className="md:w-1/3 relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <Input 
                  placeholder="Designation" 
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/50 border-white/20 hover:bg-white/80 focus:bg-white text-lg transition-all shadow-inner focus-visible:ring-2 focus-visible:ring-primary/50"
                  value={designationInput}
                  onChange={(e) => setDesignationInput(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                disabled={countLoading || (!skillsInput && !designationInput)}
                className="h-14 px-8 rounded-2xl text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                {countLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16 relative z-20">
        
        {/* Initial / Empty State */}
        {!activeSearch && !countLoading && (
          <div className="bg-card rounded-3xl p-12 text-center border shadow-sm flex flex-col items-center max-w-2xl mx-auto mt-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">Ready to source talent?</h2>
            <p className="text-muted-foreground text-lg text-balance">
              Enter specific technical skills or job titles above to discover ranked profiles tailored to your requirements.
            </p>
          </div>
        )}

        {/* Count Error */}
        {countError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl p-6 mb-8 flex items-center gap-4">
            <div className="bg-destructive/20 p-3 rounded-full">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Search Failed</h3>
              <p className="opacity-90">An error occurred while fetching the results. Please try again.</p>
            </div>
          </div>
        )}

        {/* Results Area */}
        {activeSearch && countData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Summary Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-2xl border shadow-sm">
              <div>
                <h2 className="text-2xl font-display font-bold">
                  {countData.total.toLocaleString()} Profiles Found
                </h2>
                <p className="text-muted-foreground">
                  Ranked by relevance for "{activeSearch.skills || activeSearch.designation}"
                </p>
              </div>
              
              {hasResults && (
                <div className="text-sm bg-muted/50 px-4 py-2 rounded-xl border">
                  Divided into <strong className="text-foreground">{countData.subsets} subsets</strong> of ~{countData.subsetSize.toLocaleString()}
                </div>
              )}
            </div>

            {/* Subsets Selector */}
            {hasResults && countData.subsets > 1 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-1">Data Volumes</h3>
                <div className="flex gap-2 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar snap-x">
                  {Array.from({ length: countData.subsets }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubsetChange(i)}
                      className={clsx(
                        "snap-start shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                        activeSubset === i 
                          ? "bg-primary text-primary-foreground border-primary shadow-md transform -translate-y-0.5" 
                          : "bg-card text-foreground hover:bg-muted border-border hover:border-border/80"
                      )}
                    >
                      Subset {i + 1}
                      <span className={clsx("ml-2 text-xs opacity-70", activeSubset === i ? "text-primary-foreground" : "text-muted-foreground")}>
                        ({(i * countData.subsetSize + 1).toLocaleString()} - {Math.min((i + 1) * countData.subsetSize, countData.total).toLocaleString()})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Profiles Grid */}
            {hasResults ? (
              <div className="relative">
                {profilesFetching && profilesData && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 rounded-3xl flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  </div>
                )}
                
                {profilesLoading && !profilesData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="bg-card rounded-2xl p-6 border shadow-sm">
                        <div className="flex gap-4 mb-4">
                          <Skeleton className="w-16 h-16 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </div>
                        <div className="space-y-3 mt-6">
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {profilesData?.profiles.map((profile) => (
                      <ProfileCard 
                        key={profile.id} 
                        profile={profile} 
                        onClick={setSelectedProfileId} 
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-10 h-10"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || profilesFetching}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="text-sm font-medium">
                      Page <span className="text-foreground">{currentPage}</span> of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-10 h-10"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || profilesFetching}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-12 text-center border shadow-sm">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold">No profiles found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search criteria to be less specific.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Profile Detail Modal */}
      <ProfileDetailDialog 
        profileId={selectedProfileId} 
        isOpen={!!selectedProfileId} 
        onOpenChange={(open) => !open && setSelectedProfileId(null)} 
      />
    </div>
  );
}
